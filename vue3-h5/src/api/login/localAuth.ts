/**
 * 单租户（authMode=local）本地认证：vlstream 集群不路由 apaas-sso，
 * 登录走自带的 BladeX 端点 `vls-server/blade-auth/token`（表单参数，账号字段名是 account 不是 username），
 * 校验/登出分别是 `sso/v1/getUserInfo` 与 `blade-auth/logout`。
 * 这里直接用 axios，绕开 utils/service.ts 的拦截器：登录时还没有令牌，
 * 且拦截器的令牌模型（平台 accessToken + 换取 JWT）只适用于多租户。
 * 返回值统一成 store 期望的 `{ code, msg, data }` 旧信封，调用方无需区分环境。
 */
import axios from 'axios'
import Config from '@/config'

function authBase() {
  return `${Config.URL}${Config.gateWay}${Config.authService}/`
}

/** 业务请求都带的平台网关头，登录端点额外要 BladeX 客户端凭证 */
function gatewayHeaders(extra: Record<string, string> = {}) {
  return {
    Accept: 'application/json',
    requesttype: 'app',
    appid: Config.appId,
    secretkey: Config.secretKey,
    tenantid: Config.tenantId,
    ...extra
  }
}

function normalize(res: any) {
  const body = res?.data ?? {}
  const code = body.code === undefined ? (res?.status === 200 ? 200 : 500) : Number(body.code)
  return { code, msg: body.msg || body.message || '', data: body.data ?? body, raw: body }
}

export interface LocalLoginParams {
  account: string
  password: string
}

export interface LocalAuthResult {
  code: number
  msg?: string
  data: any
}

/**
 * 本地登录。BladeX 的 token 端点从表单里取参数，密码为明文（走 https）。
 */
export async function localLogin(params: LocalLoginParams): Promise<LocalAuthResult> {
  const form = new URLSearchParams({
    account: params.account,
    password: params.password,
    grant_type: 'password',
    scope: 'all',
    type: 'account',
    tenantId: Config.tenantId
  })
  const res = await axios.post(`${authBase()}blade-auth/token`, form, {
    timeout: 15 * 1000,
    headers: gatewayHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: Config.bladeClientAuth
    })
  })
  const out = normalize(res)
  const d = out.data || {}
  const accessToken = d.accessToken || d.access_token || d.token || ''
  return {
    code: accessToken ? 200 : out.code,
    msg: out.msg,
    data: {
      ...d,
      accessToken,
      token: accessToken,
      refreshToken: d.refreshToken || d.refresh_token || accessToken,
      tenantId: d.tenantId || d.tenant_id || Config.tenantId
    }
  }
}

/** 已登录令牌的请求头：Authorization/blade-auth/accesstoken 都用本地令牌 */
function tokenHeaders(accessToken: string) {
  return gatewayHeaders({
    Authorization: `Bearer ${accessToken}`,
    'blade-auth': `Bearer ${accessToken}`,
    accesstoken: accessToken
  })
}

/** 校验本地令牌并取用户信息（服务端保留了旧 SSO 信封） */
export async function localVerify(accessToken: string): Promise<LocalAuthResult> {
  const res = await axios.post(`${authBase()}sso/v1/getUserInfo`, { accessToken }, {
    timeout: 15 * 1000,
    headers: tokenHeaders(accessToken)
  })
  return normalize(res)
}

export async function localLogout(accessToken: string): Promise<LocalAuthResult> {
  const res = await axios.post(`${authBase()}blade-auth/logout`, null, {
    timeout: 15 * 1000,
    headers: tokenHeaders(accessToken)
  })
  return normalize(res)
}
