import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method: string, isParams = false) {
  let params = method === 'get' || method === 'delete' || method === 'DELETE' ? { params: data } : { data: data }
  if (isParams) {
    params = { params: data }
  }
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-meetingservice' + interfaceName,
    method: method,
    ...params
  })
}

/* 会议创建/修改接口 */
export function conferenceSave(data: any) {
  return commonFunc('/conference/v1/save', data, 'post')
}

/* 会议列表 del */
export function conferenceDel(data: any) {
  return commonFunc('/conference/v1/delete', data, 'post')
}

/* 会议详情 */
export function conferenceInfo(data: any) {
  return commonFunc('/conference/v1/info', data, 'post')
}

/* 会议列表 list */
export function conferenceList(data: any) {
  return commonFunc('/conference/v1/list', data, 'post')
}

/* 签到列表 */
export function conferencesignList(data: any) {
  return commonFunc('/conferencesign/v1/list', data, 'post')
}

/* 投票列表 */
export function voteList(data: any) {
  return commonFunc('/vote/v1/list', data, 'post')
}

/* 新建投票 */
export function voteAdd(data: any) {
  return commonFunc('/vote/v1/add', data, 'post')
}

/* 新建投票 */
export function voteAdd2(data) {
  return commonFunc('/vote/v2/add', data, 'post')
}

/* 编辑投票 */
export function voteEdit(data: any) {
  return commonFunc('/vote/v1/edit', data, 'post')
}

/* 编辑投票 */
export function voteEdit2(data) {
  return commonFunc('/vote/v2/edit', data, 'post')
}

/* 删除投票 */
export function voteDel(data: any) {
  return commonFunc('/vote/v1/delete ', data, 'post')
}

/* 投票详情 */
export function voteInfo(data: any) {
  return commonFunc('/vote/v1/info ', data, 'post')
}

/* 创建新会议室 */
export function conferenceroomAdd(data: any) {
  return commonFunc('/conferenceroom/v1/add', data, 'post')
}

/* 创建新会议室 edit */
export function conferenceroomEdit(data: any) {
  return commonFunc('/conferenceroom/v1/edit', data, 'post')
}

/* 会议室 del */
export function conferenceroomDel(data: any) {
  return commonFunc('/conferenceroom/v1/delete', data, 'post')
}

/* 会议室状态 */
export function conferenceroomStatus(data: any) {
  return commonFunc('/conferenceroom/v1/setStatus', data, 'post')
}

/* 会议室 list */
export function conferenceroomList(data: any) {
  return commonFunc('/conferenceroom/v1/list', data, 'post')
}

/* 被预定的会议室信息列表 */
export function reserveList(data: any) {
  return commonFunc('/conferenceroom/v1/reserveList', data, 'post')
}

/* 录音录像删除 */
export function materialDelete(data: any) {
  return commonFunc('/conference/v1/materialDelete', data, 'post')
}

/* 录音录像列表 */
export function materialList(data: any) {
  return commonFunc('/conference/v1/materialList', data, 'post')
}
/* 上传 录音录像 */
export function materialAdd(data: any) {
  return commonFunc('/conference/v1/materialAdd', data, 'post')
}

/* 查询会议纪要列表 */
export function summaryList(data: any) {
  return commonFunc('/summary/v1/list', data, 'get')
}

/* 查询会议纪要 add */
export function summaryAdd(data: any) {
  return commonFunc('/summary/v1/add', data, 'post')
}

/* 查询会议纪要  reply*/
export function summaryReply(data: any) {
  return commonFunc('/summary/v1/reply', data, 'post')
}

/* 查询会议纪要 del */
export function summaryDel(data: any) {
  return commonFunc('/summary/v1/delete', data, 'post')
}

/* 查询会议纪要 del */
export function houseNumberSync(data: any) {
  return commonFunc('/conference/v1/houseNumberSync ', data, 'post')
}

/* 投票详情 */
export function vote2Info(data: any) {
  return commonFunc('/vote/v2/info', data, 'post')
}

/* 会议档案MD5列表 */
export function materialMd5List(data) {
  return commonFunc('/conference/v1/materialMd5List', data, 'post')
}

/* 会议档案MD5列表 */
export function timeZoneList(data) {
  return commonFunc('/conference/v1/timeZoneList', data, 'post')
}

/* 会议日期高亮 */
export function myConferenceList(data) {
  return commonFunc('/conference/v1/myConferenceList', data, 'post')
}

/* 改文件名 */
export function materialEdit(data) {
  return commonFunc('/conference/v1/materialEdit', data, 'post')
}
