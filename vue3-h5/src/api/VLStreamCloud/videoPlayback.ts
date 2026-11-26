/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 10:38:14
 * @Last Modified by: 兰舰
 * @Last Modified time: 2025-01-23 14:35:59
* @Copyright aPaaS-front-team. All rights reserved.
*/
// import { request } from '@/utils/service'
// import config from '@/config'
// function commonFunc<T, K>(interfaceName: string, data: T, method = 'post') {
//   return request<K>({
//     url: config.URL + config.gateWay + 'apaas-vls-server/' + interfaceName,
//     method: method,
//     data: data
//   })
// }

// export function getDeviceList(data) {
//   return commonFunc('/vlsDeviceInfo/page', data, 'GET')
// }

import { request } from '@/utils/service'
import config from '@/config'
import { getDeviceList } from './device'

// 公共请求函数：统一URL拼接、请求方式、入参处理，泛型支持类型约束
function commonFunc<T, K>(interfaceName: string, data: T, method = 'post', isParams = false) {
  let params = method === 'get' || method === 'delete' || method === 'GET' || method === 'DELETE' ? { params: data } : { data: data }
  if (isParams) {
    params = { params: data }
  }
  return request < K >({
    url: config.URL + config.gateWay + 'apaas-vls-server' + interfaceName,
    method: method,
    ...params
  })
}

/**
 * 设备序列号 → vls_device_info.id 映射
 * 云端录像表 vls_video_record.device_id 存的是 vls_device_info 的主键（录制任务按序列号解析设备后写入），
 * 不是 WVP 设备行 id，也不是序列号，所以查回放前必须先换成 vls 主键。
 * /vlsDeviceInfo/page 服务端不做条件过滤，只能拉全量后在前端按 deviceId 匹配。
 * @param {string[]} serials - 设备序列号（历史数据可能直接是 vls 数字主键）
 * @returns 与入参同序的 vls 主键数组，匹配不到的为空串
 */
export async function resolveVlsDeviceIds(serials: string[]): Promise<string[]> {
  const keys = serials.map(s => String(s || '').trim())
  if (!keys.some(k => !!k)) return keys.map(() => '')
  const res: any = await getDeviceList({ current: 1, size: 1000 }).catch(() => null)
  const records: any[] = res && res.code === 200 && res.data && Array.isArray(res.data.records) ? res.data.records : []
  const bySerial = new Map<string, string>()
  const idSet = new Set<string>()
  records.forEach((r: any) => {
    const id = String(r.id ?? '').trim()
    if (!id) return
    idSet.add(id)
    const serial = String(r.deviceId ?? '').trim()
    if (serial && !bySerial.has(serial)) bySerial.set(serial, id)
  })
  return keys.map((k) => {
    if (!k) return ''
    if (bySerial.has(k)) return bySerial.get(k) as string
    // 兼容历史数据：直接存的就是 vls 主键
    return idSet.has(k) ? k : ''
  })
}

/**
 * 视频回放查询（deviceId 为 vls_device_info.id，Long）
 */
export function getPlayback(data) {
  return commonFunc('/vlsVideoRecord/playback', data, 'GET')
}

/**
 * 获取视频回放流
 * @param {number|string} recordId - 录制记录ID
 * @param {Object} params - 请求参数，包含 accessToken
 */
export function getPlaybackStream(recordId, params = {}) {
  return request({
    url: config.URL + config.gateWay + 'apaas-vls-server/vlsVideoRecord/stream/' + recordId,
    method: 'GET',
    params: params,
    responseType: 'blob',
    // 回放视频整段下载，覆盖默认 10s 超时，避免大文件下载被中断
    timeout: 10 * 60 * 1000
  })
}
