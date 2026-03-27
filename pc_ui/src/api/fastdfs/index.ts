/*
*  @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2025-04-22 10:44:25
 * @Last Modified by: 兰舰
 * @Last Modified time: 2025-08-11 11:01:49
* @Copyright 奥尔特云(深圳)智慧科技 aPaaS-front-team. All rights reserved.
*/
import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T, K>(interfaceName: string, data: T, method: string) {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-fastdfsservice/' + interfaceName,
    method: method,
    data: data
  })
}

// 生成base64文件
export function uploadBase64(data) {
  return commonFunc('fastdfs/v1/uploadBase64', data, 'post')
}

// 分块上传文件
export function uploadBlockFile(data) {
  return commonFunc('fastdfs/v1/upload_blockfile', data, 'post')
}

// 检查文件是否可以秒传
export function uploadCheck(data) {
  return commonFunc('fastdfs/v1/upload_check', data, 'post')
}
