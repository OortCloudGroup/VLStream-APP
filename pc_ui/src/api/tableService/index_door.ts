import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method: string) {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-tablet/' + interfaceName,
    method: method,
    data: data
  })
}

export function addDevice(data) {
  return commonFunc('table/v1/add_device', data, 'post')
}

export function getDeviceList(data) {
  return commonFunc('table/v1/get_devices', data, 'post')
}

export function removeDevice(data) {
  return commonFunc('table/v1/remove_device', data, 'post')
}

// 获取网关设备
export function getGetWaysDevice(data) {
  return commonFunc('table/v1/get_gateways', data, 'post')
}

// 通过网关搜索设备
export function getDeviceByGateway(data) {
  return commonFunc('table/v1/scan_devices', data, 'post')
}

// 添加下发任务
export function addQueue(data) {
  return commonFunc('table/v2/add_queue', data, 'post')
}

// 获取下发任务状态
export function getQueueStatus(data) {
  return commonFunc('table/v2/add_queue_state', data, 'post')
}

// 清空网关下发任务
export function clearQueue(data) {
  return commonFunc('table/v1/clear_queue', data, 'post')
}

// 停止下发
export function removeQueue(data) {
  return commonFunc('table/v1/remove_queue', data, 'post')
}

// 删除图片
export function imgDelete(data) {
  return commonFunc('ftp/v1/img_delete', data, 'post')
}

// 获取图片列表
export function imgList(data) {
  return commonFunc('ftp/v1/img_list', data, 'post')
}

// 查看图片
export function imgView(data) {
  return commonFunc('ftp/v1/img_show', data, 'post')
}

// 上传图片
export function imgUpload(data) {
  return commonFunc('ftp/v1/img_upload', data, 'post')
}

// 重新绑定tcp接收消息
export function bingingTcp(data) {
  return commonFunc('table/v1/binding', data, 'post')
}
// 桌牌列表
export function gettablelist(data) {
  return commonFunc('table/v2/table_list', data, 'post')
}
// 名牌列表
export function getimglist(data) {
  return commonFunc('ftp/v1/img_list', data, 'post')
}

// 修改桌牌信息
export function tableSave(data) {
  return commonFunc('table/v2/table_save', data, 'post')
}

// 删除名牌
export function getimgDelete(data) {
  return commonFunc('ftp/v1/img_delete', data, 'post')
}

// 图片模板获取
export function templateGet(data) {
  return commonFunc('table/v2/template_get', data, 'post')
}

// 保存图片模板
export function templateSet(data) {
  return commonFunc('table/v2/template_set', data, 'post')
}

// 门牌

// 获取门牌信息
export function getDoorCardInfo(data) {
  return commonFunc('tablet/v2/device_info', data, 'post')
}
// 获取门牌列表
export function getDoorCardList(data) {
  return commonFunc('tablet/v2/device_list', data, 'post')
}
// 下发门牌图片
export function sendDoorCardImage(data) {
  return commonFunc('tablet/v2/device_refresh', data, 'post')
}
// 保存门牌信息
export function saveDoorCardInfo(data) {
  return commonFunc('tablet/v2/device_save', data, 'post')
}

// 强制刷新门牌
export function forceRefreshDoorCard(data) {
  return commonFunc('tablet/v2/device_save', data, 'post')
}

// 删除文件
export function deleteDoorImage(data) {
  return commonFunc('tablet/v2/img_delete', data, 'post')
}

// 获取图片列表
export function getDoorImageList(data) {
  return commonFunc('tablet/v2/img_list', data, 'post')
}

// 上传图片
export function uploadDoorImage(data) {
  return commonFunc('tablet/v2/img_upload', data, 'post')
}

// 删除图片模块
export function tableImgDelete(data) {
  return commonFunc('tablet/v2/img_delete', data, 'post')
}

export function tableImgEdit(data) {
  return commonFunc('tablet/v2/img_edit', data, 'post')
}

export function tableImgInfo(data) {
  return commonFunc('tablet/v2/img_info', data, 'post')
}

export function tableImgList(data) {
  return commonFunc('tablet/v2/img_list', data, 'post')
}

export function tableImgSetDefault(data) {
  return commonFunc('tablet/v2/img_set_default', data, 'post')
}

export function tableImgUpload(data) {
  return commonFunc('tablet/v2/img_upload', data, 'post')
}
