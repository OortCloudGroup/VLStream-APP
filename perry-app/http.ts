/*
 * HTTP 适配层：用 node:https/node:http 实现 request()，
 * 对齐 vue3-h5-ts 的 utils/service.ts 关键语义（注入 token、code!==200 toast、无效 token 跳登录）。
 * Perry 全局 fetch 在 Windows 运行时挂起，故用 node:https。
 */
import { request as httpsRequest } from 'node:https'
import { request as httpRequest } from 'node:http'
import type { IncomingMessage } from 'node:http'
import config from './config'
import { getToken, removeToken } from './store'
import { showToast } from 'perry/ui'

export interface IApiResponseData {
  code: number
  msg?: string
  data?: any
  [k: string]: any
}

export interface RequestOptions {
  url: string
  method?: string
  data?: any
  params?: any
  headers?: Record<string, string>
  responseType?: string
}

function buildQuery(params: any): string {
  if (!params) return ''
  const parts: string[] = []
  for (const k of Object.keys(params)) {
    const v = params[k]
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v == null ? '' : String(v))}`)
  }
  return parts.length ? '?' + parts.join('&') : ''
}

function readBody(res: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    res.on('data', (c: any) => {
      body += typeof c === 'string' ? c : c.toString('utf8')
    })
    res.on('end', () => resolve(body))
  })
}

let _goLogin: () => void = () => {}
/** main.ts 注入"跳登录页"回调 */
export function setGoLogin(fn: () => void): void {
  _goLogin = fn
}

export function request<T = any>(opts: RequestOptions): Promise<T> {
  const method = (opts.method || 'post').toUpperCase()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
    AccessToken: getToken(),
    ...(opts.headers || {})
  }

  const isGetLike = method === 'GET' || method === 'DELETE'
  const finalUrl = isGetLike ? opts.url + buildQuery(opts.data) : opts.url

  let payload = ''
  if (!isGetLike && opts.data != null) {
    payload = typeof opts.data === 'string' ? opts.data : JSON.stringify(opts.data)
  }

  const u = new URL(finalUrl)
  const lower = u.protocol === 'https:' ? httpsRequest : httpRequest

  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method,
      headers: Object.assign({}, headers, payload ? { 'Content-Length': Buffer.byteLength(payload).toString() } : {})
    }
    const req = lower(reqOptions, async (res: IncomingMessage) => {
      const text = await readBody(res)
      if (opts.responseType === 'blob') {
        resolve(text as any)
        return
      }
      let parsed: any = text
      try {
        parsed = JSON.parse(text)
      } catch {
        /* 非 JSON，保留原文 */
      }
      const data = parsed as IApiResponseData
      if (data && typeof data.code === 'number' && data.code !== 200) {
        const msg = data.msg || ''
        if (msg.includes('无效的accesstoken') || msg.includes('accessToken无效') || msg.includes('token失效')) {
          removeToken()
          _goLogin()
        } else if (msg) {
          showToast(msg)
        }
      }
      resolve(parsed as T)
    })
    req.on('error', (e: Error) => {
      showToast(e.message || '网络错误')
      reject(e)
    })
    if (payload) req.write(payload)
    req.end()
  })
}
