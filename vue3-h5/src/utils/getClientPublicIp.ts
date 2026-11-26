/**
 * 从当前用户设备获取可用 IP（公网优先，失败则 WebRTC 兜底）
 * 结果缓存在 sessionStorage，同会话内只请求一次
 */

const CLIENT_IP_CACHE_KEY = 'login_client_public_ip'

const fetchWithTimeout = async(url: string, timeout = 3000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const res = await fetch(url, { signal: controller.signal, cache: 'no-store' })
    if (!res.ok) throw new Error('ip fetch failed')
    return res
  } finally {
    clearTimeout(timer)
  }
}

/** WebRTC 兜底：优先公网 srflx，其次 host 局域网 IP */
const getIpByWebRTC = (): Promise<string> => new Promise((resolve) => {
  let hostIp = ''
  let pc: RTCPeerConnection | null = null
  const done = (ip: string) => {
    try { pc?.close() } catch (_) { /* ignore */ }
    clearTimeout(timer)
    resolve(ip)
  }
  const timer = setTimeout(() => done(hostIp), 2000)
  try {
    pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    pc.createDataChannel('')
    pc.onicecandidate = (e) => {
      if (!e.candidate?.candidate) return
      const match = /([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-f0-9:]{2,})/i.exec(e.candidate.candidate)
      if (!match) return
      const ip = match[1]
      if (e.candidate.candidate.includes('srflx')) {
        done(ip)
      } else if (!hostIp && e.candidate.candidate.includes('host')) {
        hostIp = ip
      }
    }
    pc.createOffer().then((offer) => pc && pc.setLocalDescription(offer)).catch(() => done(''))
  } catch (_) {
    done('')
  }
})

/** 获取当前用户公网/可用 IP（session 内缓存） */
export const getClientPublicIp = async(): Promise<string> => {
  const cached = sessionStorage.getItem(CLIENT_IP_CACHE_KEY)
  if (cached) return cached

  const sources: Array<() => Promise<string>> = [
    async() => {
      const res = await fetchWithTimeout('https://api.ipify.org?format=json')
      const data = await res.json()
      return String(data?.ip || '').trim()
    },
    async() => {
      const res = await fetchWithTimeout('https://ipv4.icanhazip.com')
      return (await res.text()).trim()
    },
    async() => {
      const res = await fetchWithTimeout('https://api.ip.sb/ip')
      return (await res.text()).trim()
    }
  ]

  for (const getIp of sources) {
    try {
      const ip = await getIp()
      if (ip && /^[\d.a-fA-F:]+$/.test(ip)) {
        sessionStorage.setItem(CLIENT_IP_CACHE_KEY, ip)
        return ip
      }
    } catch (_) { /* try next */ }
  }

  const rtcIp = await getIpByWebRTC()
  if (rtcIp) {
    sessionStorage.setItem(CLIENT_IP_CACHE_KEY, rtcIp)
    return rtcIp
  }
  return ''
}

export default getClientPublicIp
