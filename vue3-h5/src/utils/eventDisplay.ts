/*
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
*/

// 事件详情的展示口径：事件类型、事件位置与录制视频。
// 主动安全事件（mod_type !== 1）的 mod_status 从 0（待确认）起，不能只映射 1/2/3。

import i18n from '@/lang'

const t = (key: string): string => i18n.global.t(key)

const EVENT_TYPE_LABELS: Record<number, string> = {
  0: '待确认',
  1: '真实告警',
  2: '维保',
  3: '误报'
}

export function eventTypeText(modStatus: any) {
  const value = Number(modStatus)
  if (Number.isFinite(value) && EVENT_TYPE_LABELS[value]) return t(EVENT_TYPE_LABELS[value])
  return t('未知')
}

// 位置优先取上报地址，其次取非零经纬度；设备没上报位置时明确显示「未上报」
export function eventLocationText(point: any) {
  const address = typeof point?.address === 'string' ? point.address.trim() : ''
  if (address) return address
  const lng = Number(point?.lng)
  const lat = Number(point?.lat)
  if (Number.isFinite(lng) && Number.isFinite(lat) && (lng !== 0 || lat !== 0)) {
    return `${lng}, ${lat}`
  }
  return t('未上报')
}

export function hasEventLocation(point: any) {
  // Judge by data presence instead of comparing display text (locale-proof)
  const address = typeof point?.address === 'string' ? point.address.trim() : ''
  if (address) return true
  const lng = Number(point?.lng)
  const lat = Number(point?.lat)
  return Number.isFinite(lng) && Number.isFinite(lat) && (lng !== 0 || lat !== 0)
}

// 录制视频：兼容 video[] 与 videoUrl 两种返回，去重后只保留 http(s) 链接
export function eventVideoSources(detail: any): string[] {
  const raw = Array.isArray(detail?.video)
    ? detail.video
    : detail?.videoUrl ? [detail.videoUrl] : []
  const seen = new Set<string>()
  const urls: string[] = []
  raw.forEach((item: any) => {
    if (typeof item !== 'string') return
    const url = item.trim()
    if (!url || seen.has(url)) return
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) return
    } catch (e) {
      return
    }
    seen.add(url)
    urls.push(url)
  })
  return urls
}
