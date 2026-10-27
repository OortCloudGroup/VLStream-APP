/*
* @Created by: Qoder
* @Date: 2026-10-27
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { request } from '@/utils/service'
import config from '@/config'

// WVP 聚合设备服务：apaas-wvp-server
// 鉴权由 utils/service.ts 请求拦截器统一注入 x-vlstream-token / x-wvp-auth-source，
// 业务侧不需要（也不能）再传 accessToken 参数。
function commonFunc<T, K>(interfaceName: string, data: T, method = 'post', isParams = false) {
  let params = method === 'get' || method === 'delete' || method === 'GET' || method === 'DELETE' ? { params: data } : { data: data }
  if (isParams) {
    params = { params: data }
  }
  return request < K >({
    url: config.URL + config.gateWay + 'apaas-wvp-server' + interfaceName,
    method: method,
    ...params
  })
}

/**
 * VLStream 协议推送的设备分页列表
 * 返回体是 RuoYi 分页格式：{ code, msg, total, rows }，记录在 rows 而非 data.records
 * @param params.pageNum / params.pageSize
 */
export function getWvpVlsDeviceList(params) {
  return commonFunc('/vlstream/device/list', params, 'GET')
}

/**
 * 设备详情，data.device.online 为真实在线状态
 * @param {string|number} rowId 设备行 id（列表里的 id，不是 deviceId 序列号）
 */
export function getWvpVlsDeviceDetail(rowId) {
  return commonFunc(`/vlstream/device/${rowId}/detail`, {}, 'GET')
}

/**
 * 设备可用视频流列表，data 为数组，defaultStream 标记默认流
 */
export function getWvpVlsDeviceStreams(rowId) {
  return commonFunc(`/vlstream/device/${rowId}/streams`, {}, 'GET')
}

/**
 * 创建预览会话，data 形如 { playMode: 'cameraRTC', url: 'http://host/videocall/设备ID' }
 */
export function createWvpVlsDevicePreview(rowId, streamId) {
  return commonFunc(`/vlstream/device/${rowId}/preview`, { streamId })
}

/**
 * 视频广场聚合列表（含各协议设备）
 */
export function getWvpVideoDeviceCatalog(params) {
  return commonFunc('/video/device/list', params, 'GET')
}
