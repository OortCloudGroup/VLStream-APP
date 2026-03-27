import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method = 'post') {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-sso/' + interfaceName,
    method: method,
    data: data
  })
}

// 清空最近联系人
export function usedDel(data) {
  return commonFunc('tag/v1/usedDel', data, 'post')
}

// 获取最近联系人
export function usedGet(data) {
  return commonFunc('tag/v1/usedGet', data, 'post')
}

// 获取用户信息
export function getUserInfo(data) {
  return commonFunc('sso/v1/getUserInfo', data, 'post')
}

// 部门和用户树
export function getdeptuser(data) {
  return commonFunc('sso/v1/getdeptuser', data)
}

// 上报最近联系人
export function usedSet(data) {
  return commonFunc('tag/v1/usedSet', data, 'post')
}

// 地址本关联用户列表
export function addressUserList(data) {
  return commonFunc('address/v1/tagUserList', data, 'post')
}

// 地址本列表
export function addressList(data) {
  return commonFunc('address/v1/tagList', data, 'post')
}

// 标签列表
export function tagList(data) {
  return commonFunc('tag/v1/tagList', data, 'post')
}

// 标签关联用户列表
export function tagUserList(data) {
  return commonFunc('tag/v1/tagUserList', data, 'post')
}
