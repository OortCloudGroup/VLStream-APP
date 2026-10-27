/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:04:34
* @Copyright aPaaS-front-team. All rights reserved.
*/
/**
 * 平台 accessToken 与 VLStream 本地会话令牌（JWT）的交换。
 * apaas-vls-server 只认 Authorization: Bearer <JWT>，apaas-wvp-server 只认 x-vlstream-token，
 * 二者都不认平台的 accessToken，故业务请求前需先用平台令牌换取 JWT。
 * 单租户（Config.authMode === 'local'）登录拿到的 BladeX 令牌本身就是业务令牌，无需交换。
 */
import axios from 'axios'
import Config from '@/config'
import { getToken } from './cache'

const VLSTREAM_TOKEN_KEY = 'vlstreamToken'

/** 换取 JWT 的接口路径，需与 buildVlsUrl 拼接结果一致，用于拦截器自我排除 */
export const EXCHANGE_PATH = 'sso/v1/exchangeToken'

export const getVlstreamToken = () => sessionStorage.getItem(VLSTREAM_TOKEN_KEY) || ''

export const setVlstreamToken = (token: string) => {
  if (token) sessionStorage.setItem(VLSTREAM_TOKEN_KEY, token)
}

export const removeVlstreamToken = () => sessionStorage.removeItem(VLSTREAM_TOKEN_KEY)

/** 换令牌必须绕开 service.ts，否则拦截器会递归调用自身 */
function buildVlsUrl(interfaceName: string) {
  const path = interfaceName.replace(/^\/+/, '')
  return `${Config.URL}${Config.gateWay}apaas-vls-server/${path}`
}

let pending: Promise<string> | null = null

/**
 * 返回可用的 VLStream JWT；无缓存时用平台 accessToken 换取，并发请求共享同一次交换。
 * 换取失败返回空串，交由请求本身的鉴权错误流程处理，避免拦截器挂起。
 */
export function ensureVlstreamToken(): Promise<string> {
  if (Config.authMode === 'local') return Promise.resolve(getToken() || '')
  const cached = getVlstreamToken()
  if (cached) return Promise.resolve(cached)
  if (pending) return pending
  const accessToken = getToken()
  if (!accessToken) return Promise.resolve('')
  const tenantId = sessionStorage.getItem('tenantId') || ''
  pending = axios
    .post(
      buildVlsUrl(EXCHANGE_PATH),
      { accessToken, tenantId },
      {
        timeout: 10 * 1000,
        headers: {
          'Content-Type': 'application/json',
          ...Config.headers,
          accesstoken: accessToken,
          Authorization: `Bearer ${accessToken}`,
          tenantid: tenantId
        }
      }
    )
    .then((res) => {
      const jwt = res.data?.data?.accessToken || res.data?.data?.token || ''
      setVlstreamToken(jwt)
      return jwt
    })
    .catch(() => '')
    .then((jwt) => {
      pending = null
      return jwt
    })
  return pending
}
