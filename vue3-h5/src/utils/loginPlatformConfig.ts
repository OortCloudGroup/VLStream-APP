/**
 * 登录页平台配置（移植自 T-OORT.SH/login-page 的 utils/initConfig.ts）。
 * 读取 apaas-sso `frontConf/v1/config.json`，决定登录页展示哪些登录方式：
 *   common.isOpenOtherLoginWay  各登录方式开关（account 恒开）
 *   common.loginWaySort         [{ sort, type }] 排序，sort 最小且已开启的是默认方式
 *   common.authConfig           [{ types, value }] 短信(1)/邮箱(7)等认证的 config_code
 * 未登录前不带租户，取公共配置；5 秒超时或失败时退回只有账号密码登录。
 * 仅多租户（platform）环境存在该服务，单租户不调用。
 */
import Config from '@/config'

export interface LoginPlatformCommon {
  isOpenOtherLoginWay?: Record<string, boolean>
  loginWaySort?: Array<{ sort: number | string, type: string }> | Record<string, number>
  authConfig?: Array<{ types: number, value: string }>
  enableRegister?: boolean
  [key: string]: any
}

let pending: Promise<LoginPlatformCommon> | null = null

export function loadLoginPlatformConfig(): Promise<LoginPlatformCommon> {
  if (pending) return pending
  pending = new Promise((resolve) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const fallback = () => {
      // 失败不缓存，下次进入登录页再试
      pending = null
      resolve({})
    }
    const url = `${Config.platformURL}${Config.gateWay}apaas-sso/frontConf/v1/config.json`
    fetch(url, {
      method: 'get',
      headers: { ...Config.headers, tenantid: '' },
      signal: controller.signal
    }).then(res => (res.status === 200 ? res.json() : null)).then((data) => {
      clearTimeout(timer)
      if (!data || !data.common) {
        fallback()
        return
      }
      Config.common = data.common
      // 平台可配置额外的请求头，与 login-page 一致只取勾选项
      if (Array.isArray(data.header)) {
        data.header.forEach((item) => {
          if (item && item.checked) Config.headers[item.key] = item.value
        })
      }
      resolve(data.common)
    }).catch(() => {
      clearTimeout(timer)
      fallback()
    })
  })
  return pending
}

/** loginWaySort 归一成 { type: sort }，非法或 ≤0 的排序忽略 */
export function parseLoginWaySort(raw: LoginPlatformCommon['loginWaySort']): Record<string, number> {
  const map: Record<string, number> = {}
  if (Array.isArray(raw)) {
    raw.forEach((item) => {
      const sort = Number(item?.sort)
      if (item?.type && sort > 0) map[item.type] = sort
    })
  } else if (raw && typeof raw === 'object') {
    Object.keys(raw).forEach((key) => {
      const sort = Number(raw[key])
      if (sort > 0) map[key] = sort
    })
  }
  return map
}
