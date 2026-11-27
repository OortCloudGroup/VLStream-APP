import { request } from '@/utils/service'
import config from '@/config'

// Each directory uses its owning protocol's identifier and pagination convention.
export const gbPages = [
  ['gb', '国标设备', 'device'], ['records', '云端录像', 'cloudRecord'], ['push', '推流列表', 'streamPush'],
  ['proxy', '拉流列表', 'streamProxy'], ['platform', '国标级联', 'platform'], ['plan', '录像计划', 'recordPlan'],
  ['region', '行政分组', 'administrativeGrouping'], ['channel', '通道管理', 'thoroughfare'],
  ['alarm', '报警管理', 'alarm'], ['node', '节点管理', 'node'], ['live', '分屏监控', 'wvpLive']
]
export const protocols = [
  ['vls', 'VLStream 协议', 'vlstream/device'], ['isup', 'ISUP 协议', 'isup/isupDevice'],
  ['ehome', 'EHome 协议', 'ehome/device'], ['rtsp', 'RTSP 协议', 'rtsp/rtspDevice'],
  ['onvif', 'ONVIF 协议', 'onvif/cameraManage'], ['gb', '国标协议', 'gbmanger/device'], ['custom', '自定义', 'custom/device']
]

export function menuAllowed(path, permissions) {
  return permissions.includes('*:*:*') || permissions.includes('vls:menu:' + path.replaceAll('/', ':'))
}

export async function wvp(path, options = {}) {
  const result = await request({ ...options, url: config.URL + config.gateWay + 'apaas-wvp-server' + path, silentError: true }).catch(reason => { throw reason instanceof Error ? reason : new Error(String(reason || '设备服务连接失败')) })
  let body = result
  while (body && typeof body === 'object' && Object.hasOwn(body, 'code')) {
    if (Number(body.code) !== 200) throw new Error(body.msg || '设备服务请求失败')
    if (!body.data || !Object.hasOwn(body.data, 'code')) break
    body = body.data
  }
  return body
}

export const directories = {
  isup: { list: '/isup/lsupDevice/list', detail: '/isup/lsupDevice/', edit: '/isup/lsupDevice', remove: '/isup/lsupDevice/', search: 'name', names: ['name', 'deviceId'], subtitle: ['deviceId', 'ipAddress'], classType: 'ISUP' },
  ehome: { list: '/ehome/devices', editRow: '/ehome/devices/', search: 'keyword', names: ['name', 'deviceId'], subtitle: ['deviceId', 'ipAddress'], classType: 'EHOME' },
  rtsp: { list: '/rtsp/RtspDevice/list', detail: '/rtsp/RtspDevice/', add: '/rtsp/RtspDevice', edit: '/rtsp/RtspDevice', remove: '/rtsp/RtspDevice/', search: 'name', names: ['name', 'ip'], subtitle: ['ip', 'channel'], classType: 'RTSP' },
  onvif: { list: '/onvif/device/list', detail: '/onvif/device/', edit: '/onvif/device', remove: '/onvif/device/', search: 'ip', names: ['name', 'ip'], subtitle: ['ip', 'model'], classType: 'ONVIF' },
  custom: { list: '/custom/device/list', detail: '/custom/device/', add: '/custom/device', edit: '/custom/device', remove: '/custom/device/', search: 'deviceName', names: ['deviceName', 'deviceCode'], subtitle: ['deviceCode', 'deviceType'], classType: 'CUSTOM' },
  gb: { list: '/api/device/query/devices', search: 'name', names: ['name', 'deviceId'], subtitle: ['deviceId', 'hostAddress'], edit: '/api/device/query/device/update/', editMethod: 'post', classType: 'GB28181' },
  records: { list: '/api/cloud/record/list', search: 'query', names: ['fileName', 'stream'], subtitle: ['app', 'stream', 'mediaServerId'] },
  push: { list: '/api/push/list', add: '/api/push/add', edit: '/api/push/update', editMethod: 'post', remove: '/api/push/remove/', names: ['gbName', 'stream'], subtitle: ['app', 'mediaServerId'], search: 'query' },
  proxy: { list: '/api/proxy/list', add: '/api/proxy/add', edit: '/api/proxy/update', editMethod: 'post', remove: '/api/proxy/delete/', names: ['gbName', 'stream'], subtitle: ['app', 'mediaServerId'], search: 'query' },
  platform: { list: '/api/platform/query', names: ['name', 'serverGBId'], subtitle: ['serverGBId', 'serverIp'], search: 'query', add: '/api/platform/add', edit: '/api/platform/update', editMethod: 'post', remove: '/api/platform/delete/' },
  plan: { list: '/api/record/plan/query', names: ['name'], subtitle: ['updateTime'], search: 'query', detail: '/api/record/plan/get/', add: '/api/record/plan/add', edit: '/api/record/plan/update', editMethod: 'post', remove: '/api/record/plan/delete/' },
  region: { list: '/api/region/tree/list', names: ['name', 'gbName', 'deviceId'], subtitle: ['deviceId', 'parentId'] },
  channel: { list: '/api/common/channel/civilcode/list', names: ['gbName', 'name', 'gbDeviceId'], subtitle: ['gbDeviceId', 'gbCivilCode'], search: 'query', params: { civilCode: ' ' }},
  alarm: { list: '/api/alarm/all', names: ['alarmDescription', 'deviceId'], subtitle: ['alarmTime', 'channelId'] },
  node: { list: '/api/server/media_server/list', names: ['id', 'ip'], subtitle: ['ip', 'type'], remove: '/api/server/media_server/delete/' },
  live: { list: '/api/common/channel/civilcode/list', names: ['gbName', 'name', 'gbDeviceId'], subtitle: ['gbDeviceId'], search: 'query', params: { civilCode: ' ' }}
}

export async function pageOf(key, page, size, keyword, extra, signal) {
  const def = directories[key]
  const params = key === 'platform' ? { page, count: size } : { pageNum: page, pageSize: size }
  if (key === 'alarm') Object.assign(params, { page, count: size })
  if (def.search && keyword) params[def.search] = keyword
  const body = await wvp(def.list, { params: { ...params, ...def.params, ...extra }, signal })
  const data = body?.data ?? body
  const rows = body?.rows ?? data?.rows ?? data?.list ?? (Array.isArray(data) ? data : null)
  if (!Array.isArray(rows)) throw new Error('设备服务返回的目录格式异常')
  if (Array.isArray(data) && body.total == null) {
    const visible = def.search || !keyword ? rows : rows.filter(row => [...def.names, ...def.subtitle].some(k => String(row[k] || '').toLowerCase().includes(keyword.toLowerCase())))
    return { rows: visible.slice((page - 1) * size, page * size), total: visible.length }
  }
  return { rows, total: Number(body.total ?? data.total ?? rows.length) }
}
