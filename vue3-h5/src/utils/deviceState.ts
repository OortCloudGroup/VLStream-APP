/*
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
*/

// VLStream 推送设备（WVP vlstream/device）的展示口径，与管理平台设备详情保持一致。

export function parseSnapshot(value: any): any[] | null {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed : null
  } catch (e) {
    return null
  }
}

const CAPABILITY_LABELS: Record<string, string> = {
  video: '视频',
  audio: '音频',
  ptz: '云台',
  aiInfer: 'AI 推理',
  face: '人脸识别',
  recording: '录像',
  ota: '固件升级'
}

export function capabilityText(value: any) {
  const capabilities = parseSnapshot(value)
  if (!capabilities) return '未上报'
  const labels = capabilities.map((item: string) => CAPABILITY_LABELS[item] || item)
  return labels.length ? labels.join('、') : '无'
}

export function formatDeviceTime(value: any, withSeconds = true) {
  if (value == null || value === '') return '-'
  const date = new Date(typeof value === 'string' ? value.replace(' ', 'T') : value)
  if (Number.isNaN(date.getTime())) return '-'
  const pad = (n: number) => String(n).padStart(2, '0')
  const base = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  return withSeconds ? `${base}:${pad(date.getSeconds())}` : base
}

function parseTelemetry(device: any) {
  if (!device?.telemetryJson) return null
  if (typeof device.telemetryJson === 'object') return device.telemetryJson
  return parseSnapshotObject(device.telemetryJson)
}

function parseSnapshotObject(value: any) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch (e) {
    return null
  }
}

// telemetry.bootTime 是设备实际启动时间（Unix 毫秒）；没有时按心跳次数回推。
export function deviceBootTimeText(device: any) {
  const telemetry = parseTelemetry(device)
  const bootTime = telemetry?.bootTime
  if (typeof bootTime === 'number' && Number.isFinite(bootTime) && bootTime > 0 && bootTime <= Date.now()) {
    const text = formatDeviceTime(bootTime)
    if (text !== '-') return text
  }
  const rawIndex = device?.heartbeatIndex
  const index = typeof rawIndex === 'number' || typeof rawIndex === 'string' ? Number(rawIndex) : NaN
  const reportedAt = device?.lastReportedAt
  if (!Number.isSafeInteger(index) || index < 1 || reportedAt == null || reportedAt === '') return '未上报'
  const timestamp = new Date(typeof reportedAt === 'string' ? reportedAt.replace(' ', 'T') : reportedAt).getTime()
  if (!Number.isFinite(timestamp) || timestamp <= 0 || timestamp > Date.now()) return '未上报'
  const estimated = timestamp - (index - 1) * 60000
  if (!Number.isFinite(estimated) || estimated <= 0) return '未上报'
  const text = formatDeviceTime(estimated, false)
  return text === '-' ? '未上报' : text
}

export function deviceOnlineDurationText(device: any, now = Date.now()) {
  if (!device?.online) return '离线'
  const start = device.lastOnlineTime
  if (start == null || start === '') return '未上报'
  const timestamp = new Date(typeof start === 'string' ? start.replace(' ', 'T') : start).getTime()
  if (!Number.isFinite(timestamp) || timestamp > now) return '未上报'
  const seconds = Math.floor((now - timestamp) / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return [
    days ? `${days} 天` : '',
    `${hours} 小时`,
    `${minutes} 分`,
    `${seconds % 60} 秒`
  ].filter(Boolean).join(' ')
}

export function deviceLocationText(device: any) {
  const longitude = device?.longitude
  const latitude = device?.latitude
  if (typeof longitude !== 'number' || typeof latitude !== 'number' ||
    !Number.isFinite(longitude) || !Number.isFinite(latitude) ||
    Math.abs(longitude) > 180 || Math.abs(latitude) > 90) return '未上报'
  return `经度 ${longitude}, 纬度 ${latitude} (WGS84)`
}

export function modelStatusText(status: any) {
  return ({ loaded: '已加载', running: '运行中', stopped: '已停止', failed: '异常' } as Record<string, string>)[status] || status || '未上报'
}
