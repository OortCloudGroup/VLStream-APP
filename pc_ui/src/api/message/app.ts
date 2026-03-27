import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method = 'post') {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-admin-platform/' + interfaceName,
    method: method,
    data: data
  })
}

// 应用市场（应用列表）
export function appmarket(data) {
  return commonFunc('admin-platform/appmarket', data)
}

// 获取分类列表
export function classifylist(data) {
  return commonFunc('admin-platform/classifylist', data)
}
