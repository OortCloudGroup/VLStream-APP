import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method = 'post') {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-sso' + interfaceName,
    method: method,
    data: data
  })
}

// 获取部门
export function deptList(data) {
  return commonFunc('/sso/v1/deptlist', data)
}

// rank_用户排行榜
export function rankUserList(data) {
  return commonFunc('/api/v1/rankUserList', data)
}

// rank_部门排行榜
export function rankDeptList(data) {
  return commonFunc('/api/v1/rankDeptList', data)
}

