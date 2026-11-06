import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T = any, K = any>(interfaceName: string, data: T, method = 'post') {
  return request<K>({
    url: config.URL + config.gateWay + 'apaas-vls-server/' + interfaceName,
    method: method,
    data: data
  })
}

/**
 * 分页查询事件列表
 * @param {Object} params
 * @param {number} params.current 当前页
 * @param {number} params.size 每页数量
 * @param {string} [params.eventType] 事件类型
 * @param {string} [params.eventStatus] 事件状态
 * @param {string} [params.eventLevel] 事件级别
 * @param {string} [params.keyword] 搜索关键词
 * @param {string} [params.startTime] 上报开始时间 yyyy-MM-dd HH:mm:ss
 * @param {string} [params.endTime] 上报结束时间 yyyy-MM-dd HH:mm:ss
 */
export function getEventPage(params) {
  return commonFunc('/vlsEventManagement/page', params, 'GET')
}

/**
 * 按设备序列号查询事件列表（/list 走字段等值过滤，事件录像回放列表数据源）
 * @param {string} reportDevice 设备序列号（WVP deviceId）
 * @param {Object} params
 * @param {number} [params.current] 当前页
 * @param {number} [params.size] 每页数量
 */
export function getEventListByDevice(reportDevice, params = {}) {
  return commonFunc('/vlsEventManagement/list', { reportDevice, ...params }, 'GET')
}

/**
 * 获取事件媒体短期私有播放地址（图片/MP4 通用）
 * @param {string} mediaId 媒体ID
 * @param {number} [seconds] 地址有效期秒数，默认 300
 */
export function getEventMediaViewUrl(mediaId, seconds = 300) {
  return commonFunc(`/vlsDeviceMedia/${mediaId}/view-url`, { seconds }, 'GET')
}

/**
 * 获取事件媒体短期下载地址（view-url 失败时的兜底）
 * @param {string} mediaId 媒体ID
 */
export function getEventMediaDownloadUrl(mediaId) {
  return commonFunc(`/vlsDeviceMedia/${mediaId}/download-url`, {}, 'GET')
}

/**
 * 获取事件详情
 * @param {number} id 事件ID
 */
export function getEventById(id) {
  return commonFunc(`/vlsEventManagement/${id}`, {}, 'GET')
}

/**
 * 新建事件
 * @param {Object} data 事件数据
 */
export function createEvent(data) {
  return commonFunc('/vlsEventManagement', data)
}

/**
 * 更新事件
 * @param {Object} data 事件数据（需包含id）
 */
export function updateEvent(data) {
  return commonFunc('/vlsEventManagement', data, 'PUT')
}

/**
 * 更新事件状态
 * @param {number} id 事件ID
 * @param {Object} params
 * @param {string} params.status 事件状态
 * @param {string} [params.executor] 执行人
 * @param {string} [params.handleResult] 处理结果
 */
export function updateEventStatus(id, params) {
  return commonFunc(`/vlsEventManagement/${id}/status`, params, 'PATCH')
}

/**
 * 删除事件
 * @param {number} id 事件ID
 */
export function deleteEvent(id) {
  return commonFunc(`/vlsEventManagement/${id}`, {}, 'DELETE')
}

/**
 * 批量删除事件
 * @param {Array<number>} ids 事件ID列表
 */
export function batchDeleteEvents(ids) {
  return commonFunc('/vlsEventManagement/batch', ids, 'DELETE')
}
