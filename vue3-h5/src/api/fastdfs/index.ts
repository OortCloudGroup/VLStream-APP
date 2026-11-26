/*
*  @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2025-04-22 10:44:25
 * @Last Modified by: 兰舰
 * @Last Modified time: 2025-04-22 10:46:17
* @Copyright 奥尔特云(深圳)智慧科技 aPaaS-front-team. All rights reserved.
*/
import { request } from '@/utils/service'
import config, { uploadUrl, uploadHeaders, normalizeUploadedUrl } from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method: string) {
  return request<K>({
    url: config.platformURL + config.gateWay + 'apaas-fastdfsservice/' + interfaceName,
    method: method,
    data: data
  })
}

// 生成base64文件
export function uploadBase64(data) {
  return commonFunc('fastdfs/v1/uploadBase64', data, 'post')
}

import { getToken } from '@/utils/cache'
function commonFuncFile<T, K>(interfaceName: string, data: T, method: string) {
  return request<K>({
    url: uploadUrl(),
    method: method,
    data: data,
    headers: { 'Content-Type': 'multipart/form-data', ...uploadHeaders(getToken()) }
  })
}

// 文件上传
export function uploadFile(data) {
  return commonFuncFile('fastdfs/v1/uploadFile', data, 'post').then((res: any) => {
    // single 新接口返回的 url 可能是内网/错误地址，统一按当前网关重写
    if (res && res.data && res.data.url) {
      res.data.url = normalizeUploadedUrl(res.data.url)
    }
    return res
  })
}
