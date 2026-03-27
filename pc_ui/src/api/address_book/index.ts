/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 10:46:45
* @Last Modified by:   兰舰
* @Last Modified time: 2024-11-15 10:46:45
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method: string, type = true) {
  let params = type ? { params: data } : { data: data }
  return request<K>({
    // url: 'http://192.168.88.56:8099' + interfaceName,
    url: config.URL + config.gateWay + 'oortcloud-contacts-service/' + interfaceName,
    method: method,
    ...params
  })
}

function commonFunc1<T, K>(interfaceName: string, data: T, method: string, type = true) {
  let params = type ? { params: data } : { data: data }
  return request<K>({
    // url: 'http://192.168.88.56:8099' + interfaceName,
    url: config.URL + config.gateWay + 'oortcloud-sso/' + interfaceName,
    method: method,
    ...params
  })
}

// 获取通讯录信息显示设置
export function columnGet(data) {
  return commonFunc('contacts/v1/columnGet', data, 'POST', false)
}
// 保存通讯录信息显示设置
export function columnSet(data) {
  return commonFunc('contacts/v1/columnSet', data, 'POST', false)
}
// 获取我的权限
export function getMyauth(data) {
  return commonFunc('contacts/v1/getMyauth', data, 'POST', false)
}
// 获取用户权限
export function getUserAuth(data) {
  return commonFunc('/set/v1/getUserAuth', data, 'POST', false)
}
// 设置权限
export function saveAuth(data) {
  return commonFunc('set/v1/saveAuth', data, 'POST', false)
}
// 设置部门排序
export function sortDept(data) {
  return commonFunc('contacts/v1/sortDept', data, 'POST', false)
}
// 设置用户排序
export function sortUser(data) {
  return commonFunc('contacts/v1/sortUser', data, 'POST', false)
}
// 新增板块
export function add(data) {
  return commonFunc('set/v1/add', data, 'POST', false)
}
// 查询板块详情列表
export function detailList(data) {
  return commonFunc('set/v1/detailList', data, 'POST', false)
}
// 编辑板块
export function edit(data) {
  return commonFunc('set/v1/edit', data, 'POST', false)
}
// 查询板块列表
export function list(data) {
  return commonFunc('set/v1/list', data, 'POST', false)
}
// 组织用户列表
export function deptUserList(data) {
  return commonFunc('contacts/v1/deptUserList', data, 'POST', false)
}
// 组织用户列表
export function deptList(data) {
  return commonFunc1('set/v1/deptlist', data, 'POST', false)
}
// 用户列表
export function userlist(data) {
  return commonFunc1('set/v1/userlist', data, 'POST', false)
}
// 自定义字段元数据添加
export function metadataAdd(data) {
  return commonFunc('customField/v1/metadataAdd', data, 'POST', false)
}
// 自定义字段元数据删除
export function metadataDel(data) {
  return commonFunc('customField/v1/metadataDel', data, 'POST', false)
}
// 自定义字段元数据编辑
export function metadataEdit(data) {
  return commonFunc('customField/v1/metadataEdit', data, 'POST', false)
}
// 自定义字段元数据信息
export function metadataInfo(data) {
  return commonFunc('customField/v1/metadataInfo', data, 'POST', false)
}
// 自定义字段元数据key是否存在
export function metadataKeyExist(data) {
  return commonFunc('customField/v1/metadataKeyExist', data, 'POST', false)
}
// 自定义字段元数据列表
export function metadataList(data) {
  return commonFunc('customField/v1/metadataList', data, 'POST', false)
}
// 自定义字段元数据排序
export function metadataSort(data) {
  return commonFunc('customField/v1/metadataSort', data, 'POST', false)
}
// 查询默认板块详情
export function defaultInfo(data) {
  return commonFunc('set/v1/column.golbalget', data, 'POST', false)
}
// 保存默认板块详情
export function save(data) {
  return commonFunc('set/v1/column.golbalset', data, 'POST', false)
}
// 保存角色板块详情
export function roleSave(data) {
  return commonFunc('set/v1/column.roleset', data, 'POST', false)
}
// 获取角色板块详情
export function roleGet(data) {
  return commonFunc('set/v1/column.roleget', data, 'POST', false)
}
// 保存部门板块详情
export function deptSave(data) {
  return commonFunc('set/v1/column.deptset', data, 'POST', false)
}
// 获取部门板块详情
export function deptGet(data) {
  return commonFunc('set/v1/column.deptget', data, 'POST', false)
}
// 保存用户板块详情
export function userSave(data) {
  return commonFunc('set/v1/column.userset', data, 'POST', false)
}
// 选择默认板块
export function select(data) {
  return commonFunc('set/v1/select', data, 'POST', false)
}
// 选择默认板块
export function info(data) {
  return commonFunc('set/v1/info', data, 'POST', false)
}
// 根据userid获取用户详情
export function getUserInfoByUserId(data) {
  return commonFunc('set/v1/column.userget', data, 'POST', false)
}
// 删除板块
export function deleteBoard(data) {
  return commonFunc('set/v1/delete', data, 'POST', false)
}
// 删除板块
export function modelDel(data) {
  return commonFunc('customField/v1/modelDel', data, 'POST', false)
}
// 获取通讯录权限配置
export function getContactScope(data) {
  return commonFunc('contact/v1/getContactScope', data, 'POST', false)
}
// 保存通讯录查询列表权限配置
export function saveContactScope(data) {
  return commonFunc('contact/v1/saveContactScope', data, 'POST', false)
}
// 清除通讯录查询列表权限配置
export function deleteContactScope(data) {
  return commonFunc('contact/v1/deleteContactScope', data, 'POST', false)
}
// 获取部门层级下用户对外展示表设置
export function userDetailDisplayGet(data) {
  return commonFunc('contact/v1/userDetailDisplayGet', data, 'GET')
}
// 保存部门层级下用户对外展示表设置
export function userDetailDisplaySave(data) {
  return commonFunc('contact/v1/userDetailDisplaySave', data, 'POST', false)
}
// 组织用户列表
export function deptUserListAdmin(data) {
  return commonFunc('contacts/v1/deptUserListAdmin', data, 'POST', false)
}
// 组织用户列表
export function conDeptList(data) {
  return commonFunc('contacts/v1/deptList', data, 'POST', false)
}
