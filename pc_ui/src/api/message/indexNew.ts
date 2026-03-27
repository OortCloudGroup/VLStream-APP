import { request } from '@/utils/service'
import { getToken } from '@/utils/cache/cookies'
import config from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method: string) {
  return request<K>({
    url: 'http://192.168.88.52:8012' + interfaceName,
    // url: config.URL + config.gateWay + 'oortcloud-unified-msg' + interfaceName,
    method: method,
    data: data
  })
}

function commonFunc1<T, K>(interfaceName: string, data: T, method: string) {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-unified-msg' + interfaceName,
    method: method,
    headers: { 'Content-Type': 'multipart/form-data', 'AccessToken': getToken() },
    data: data
  })
}

function commonFunc2<T, K>(interfaceName: string, data: T, method: string) {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-unified-msg' + interfaceName,
    method: method,
    params: data,
    responseType: 'blob'
  })
}

// app
/* 渠道列表 */
export function appList(data: any) {
  return commonFunc('/app/v1/list', data, 'post')
}

/* 渠道列表 */
export function appSave(data: any) {
  return commonFunc('/app/v1/save', data, 'post')
}

// channel
/* 新增渠道 */
export function channelAdd(data: any) {
  return commonFunc('/channel/v1/add', data, 'post')
}

/* 渠道删除 */
export function channelDel(data: any) {
  return commonFunc('/channel/v1/del', data, 'post')
}

/* 渠道更新 */
export function channelEdit(data: any) {
  return commonFunc('/channel/v1/edit', data, 'post')
}

/* 渠道信息 */
export function channelInfo(data: any) {
  return commonFunc('/channel/v1/info', data, 'post')
}

/* 渠道列表 */
export function channelList(data: any) {
  return commonFunc('/channel/v1/list', data, 'post')
}

/* 获取渠道类型 */
export function channelTypeList(data: any) {
  return commonFunc('/channel/v1/type/list', data, 'post')
}

// duct
/* 渠道额度列表 */
export function ductChannelList(data: any) {
  return commonFunc('/duct/v1/channel/list', data, 'post')
}

/* 通道删除 */
export function ductDel(data: any) {
  return commonFunc('/duct/v1/del', data, 'post')
}

/* 通道列表 */
export function ductList(data: any) {
  return commonFunc('/duct/v1/list', data, 'post')
}

/* 渠道配额 */
export function ductQuotaSave(data: any) {
  return commonFunc('/duct/v1/quota/save', data, 'post')
}

/* 新增/修改通道 */
export function ductSave(data: any) {
  return commonFunc('/duct/v1/save', data, 'post')
}

// home
/* 数据列表 */
export function homeFirst(data: any) {
  return commonFunc('/home/v1/index/first', data, 'post')
}

/* 数据看板曲线图 */
export function homeThree(data: any) {
  return commonFunc('/home/v1/index/three', data, 'post')
}

/* 数据看板 发送渠道统计/发送状态 */
export function homeTwo(data: any) {
  return commonFunc('/home/v1/index/two', data, 'post')
}

// msg
/* 发送消息列表 */
export function msgList(data: any) {
  return commonFunc('/msg/v1/list', data, 'post')
}

/* 消息重发 */
export function msgRepeat(data: any) {
  return commonFunc('/msg/v1/repeat', data, 'post')
}

/* 定时未发送消息撤销 */
export function msgRevoke(data: any) {
  return commonFunc('/msg/v1/revoke', data, 'post')
}

/* 发送消息 */
export function msgSend(data: any) {
  return commonFunc('/msg/v1/send', data, 'post')
}

// system
/* 获取场景管理列表 */
export function systemSceneAll(data: any) {
  return commonFunc('/system/v1/scene/all', data, 'post')
}

/* 场景管理删除 */
export function systemSceneDel(data: any) {
  return commonFunc('/system/v1/scene/del', data, 'post')
}

/* 场景管理列表 */
export function systemSceneList(data: any) {
  return commonFunc('/system/v1/scene/list', data, 'post')
}

/* 添加场景 */
export function systemSceneSave(data: any) {
  return commonFunc('/system/v1/scene/save', data, 'post')
}

/* 删除敏感词库 */
export function systemSensitiveDel(data: any) {
  return commonFunc('/system/v1/sensitive/del', data, 'post')
}

/* 下载敏感词库 */
export function systemSensitiveDownload(data: any) {
  return commonFunc2('/system/v1/sensitive/download', data, 'get')
}

/* 获取敏感词配置 */
export function systemSensitiveInfo(data: any) {
  return commonFunc('/system/v1/sensitive/info', data, 'post')
}

/* 敏感词设置 */
export function systemSensitiveSet(data: any) {
  return commonFunc('/system/v1/sensitive/set', data, 'post')
}

/* 敏感词库上传 */
export function systemSensitiveUpload(data: any) {
  return commonFunc1('/system/v1/sensitive/upload', data, 'post')
}

/* 获取模版类型列表 */
export function systemTemplateTypeAll(data: any) {
  return commonFunc('/system/v1/template/type/all', data, 'post')
}

/* 模版类型删除 */
export function systemTemplateTypeDel(data: any) {
  return commonFunc('/system/v1/template/type/del', data, 'post')
}

/* 模版类型列表 */
export function systemTemplateTypeList(data: any) {
  return commonFunc('/system/v1/template/type/list', data, 'post')
}

/* 添加模版类型 */
export function systemTemplateTypeSave(data: any) {
  return commonFunc('/system/v1/template/type/save', data, 'post')
}

// template
/*  模版审核 */
export function templateCheck(data: any) {
  return commonFunc('/template/v1/check', data, 'post')
}

/* 模版类型删除 */
export function templateDel(data: any) {
  return commonFunc('/template/v1/del', data, 'post')
}

/* 模版列表 */
export function templateList(data: any) {
  return commonFunc('/template/v1/list', data, 'post')
}

/* 新增/修改模版 */
export function templateSave(data: any) {
  return commonFunc('/template/v1/save', data, 'post')
}

/* 获取模版列表下拉框 */
export function templateSelect(data: any) {
  return commonFunc('/template/v1/select', data, 'post')
}

/* 模版详情 */
export function templateShow(data: any) {
  return commonFunc('/template/v1/show', data, 'post')
}

/* 删除模版 */
export function templateVariablesDel(data: any) {
  return commonFunc('/template/v1/variables/del', data, 'post')
}

/* 模版变量列表 */
export function templateVariablesList(data: any) {
  return commonFunc('/template/v1/variables/list', data, 'post')
}

/* 模版变量添加 */
export function templateVariablesSave(data: any) {
  return commonFunc('/template/v1/variables/save', data, 'post')
}

