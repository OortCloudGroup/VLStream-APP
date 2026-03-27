import { request } from '@/utils/service'
import config from '@/config'
// import config from '@/config'
import { getToken } from '@/utils/cache/cookies'
function commonFunc<T, K>(interfaceName: string, data: T, method: string) {
  const params = method === 'get' || method === 'delete' ? { params: data } : { data: data }
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-workflowforms' + interfaceName,
    method: method,
    ...params,
    headers: {
      'authorization': getToken()
    }
  })
}

// 分页查询流程分类列表
export function listCategory(query) {
  return commonFunc('/workflow/category/list', query, 'get')
}

// 查询流程全部分类列表
export function listAllCategory(query) {
  return commonFunc('/workflow/category/listAll', query, 'get')
}

// 新增流程分类
export function addCategory(data) {
  return commonFunc('/workflow/category', data, 'post')
}

// 修改流程分类
export function updateCategory(data) {
  return commonFunc('/workflow/category', data, 'put')
}

// 删除流程分类
export function deleteCategory(data) {
  return commonFunc('/workflow/category/' + data.categoryId, {}, 'delete')
}
