/*
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { getWvpVlsDeviceList } from '@/api/VLStreamCloud/wvp'

// WVP 设备行（RuoYi 行记录，id 是行 id，deviceId 是设备序列号）
interface WvpRow {
  id: number | string
  deviceId?: string
  deviceName?: string
  ipAddr?: string
  [key: string]: unknown
}

// WVP 设备行列表的短缓存，避免列表/卡片两个入口重复拉取
let rowsPromise: Promise<WvpRow[]> | null = null
let cachedAt = 0
const CACHE_TTL = 30000

const fetchRows = (): Promise<WvpRow[]> => {
  const now = Date.now()
  if (!rowsPromise || now - cachedAt > CACHE_TTL) {
    cachedAt = now
    rowsPromise = getWvpVlsDeviceList({ pageNum: 1, pageSize: 200 })
      .then((res: any) => (res && res.code === 200 && Array.isArray(res.rows) ? res.rows : []))
      .catch((error: unknown) => {
        // 请求失败不缓存，让下一次点击重试；向上抛出以便调用方区分「网络失败」与「未接入」
        rowsPromise = null
        cachedAt = 0
        throw error
      })
  }
  return rowsPromise
}

/**
 * 按设备序列号（vlsDeviceInfo.deviceId）查找对应的 WVP 设备行
 * WVP 行的 id 是行 id，摄像头详情 / PTZ / 播放都依赖它
 * @returns WVP 设备行，未接入视频平台时返回 null
 */
export async function resolveWvpDeviceRow(deviceId: string | number): Promise<WvpRow | null> {
  const key = String(deviceId || '').trim()
  if (!key) return null
  const rows: WvpRow[] = await fetchRows()
  return rows.find(row => String(row.deviceId || '').trim() === key) || null
}

// 失效缓存（新增设备后调用，保证下次解析拿到最新列表）
export function invalidateWvpDeviceCache(): void {
  rowsPromise = null
  cachedAt = 0
}
