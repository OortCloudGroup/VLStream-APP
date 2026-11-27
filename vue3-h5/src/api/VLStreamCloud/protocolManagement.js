import { request } from '@/utils/service'
import config from '@/config'
import { getToken } from '@/utils/cache'

export async function managementRequest(path, { wvp = false, method = 'get', params, data, media = false, headers } = {}) {
  const service = wvp ? 'apaas-wvp-server' : 'apaas-vls-server'
  const result = await request({
    url: config.URL + config.gateWay + service + path, method, params, data,
    ...(headers ? { headers: { ...config.headers, ...headers }} : {}),
    timeout: 120000, silentError: true, responseType: media ? 'blob' : 'json'
  })
  if (media && result instanceof Blob) {
    if (!result.type.includes('json')) return result
    const response = JSON.parse(await result.text())
    throw new Error(response.msg || response.message || '文件读取失败')
  }
  if (result?.code !== 200) throw new Error(result?.msg || '操作未完成，请刷新核实')
  return result.data
}

function newOperationId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

let owner
let attempts = new Map()
export function dispatchAttempt(parts) {
  const identity = JSON.stringify([config.URL, getToken(), sessionStorage.getItem('tenantId')])
  if (identity !== owner) {
    owner = identity
    attempts = new Map()
  }
  const key = JSON.stringify(parts)
  const store = attempts
  if (!store.has(key)) store.set(key, newOperationId())
  return { id: store.get(key), clear: () => store.delete(key) }
}
