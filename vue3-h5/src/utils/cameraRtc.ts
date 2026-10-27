/*
* @Created by: Qoder
* @Date: 2026-10-27
* @Copyright aPaaS-front-team. All rights reserved.
*/

// CameraRTC 播放器：WVP 中 VLStream 协议推送设备的实时预览通道。
// 设备呼叫地址由 /vlstream/device/{id}/preview 返回的 url 解析出 cameraId。
// 信令地址按环境取 config.cameraRtcSocketURL（见 src/config/index.js 的预设表）：
// 网关主机不一定路由 /bus/camera-rtc，所以不能按 Config.URL 反推。
// 该端口只做 TLS，明文 ws 握手不通，页面即使在 http 源下也要用 wss。
import Config from '@/config'

const DEFAULT_DISCONNECT_GRACE_MS = 8000
const DEFAULT_CALL_TIMEOUT_MS = 25000
const DEFAULT_RETRY_DELAY_MS = 1000
const DEFAULT_MAX_RETRY_DELAY_MS = 8000
const DEFAULT_HEARTBEAT_INTERVAL_MS = 20000

export interface CameraRtcTarget {
  cameraId: string
  socketUrl: string
}

function toArr(value: any): any[] {
  return Array.isArray(value) ? value : (value ? [value] : [])
}

function parseJson(value: any) {
  if (!value) return null
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch (e) {
    return null
  }
}

function isHostname(value: string) {
  return !!value && !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value) && !value.includes(':')
}

// turn:x?transport=udp 在受限网络下不可达，按 udp → tcp → turns:5349 依次降级
function turnVariants(url: string): string[] {
  const value = String(url || '').trim()
  if (!value) return []
  const list = [value]
  if (!/^turn:/i.test(value) || !/[?&]transport=udp(?:&|$)/i.test(value)) return list
  list.push(value.replace(/([?&]transport=)udp(?=&|$)/i, '$1tcp'))
  const matched = value.match(/^turn:([^:?/]+)(?::\d+)?(?:\?.*)?$/i)
  if (matched && isHostname(matched[1])) {
    list.push(`turns:${matched[1]}:5349?transport=tcp`)
  }
  return list
}

function buildIceStrategies(createData: any, extraTurnUrls: string[]) {
  const sources = [createData?.iceServers, createData?.domainnameiceServers, createData?.domainnameIceServers]
    .map(parseJson)
    .filter(cfg => Array.isArray(cfg?.iceServers) && cfg.iceServers.length)
  const strategies: any[] = []
  const seen = new Set<string>()
  const push = (cfg: any) => {
    const cloned = JSON.parse(JSON.stringify(cfg))
    const key = JSON.stringify(cloned)
    if (!seen.has(key)) {
      seen.add(key)
      strategies.push(cloned)
    }
  }
  sources.forEach(push)
  sources.forEach(cfg => {
    cfg.iceServers.forEach((server: any) => {
      toArr(server.urls).forEach((url: string) => {
        turnVariants(url).slice(1).forEach((variant: string) => {
          push({
            iceServers: [{ ...server, urls: variant }],
            iceTransportPolicy: cfg.iceTransportPolicy || 'all',
            iceCandidatePoolSize: Number(cfg.iceCandidatePoolSize || 0)
          })
        })
      })
    })
  })
  const credentialSource = sources.flatMap(cfg => cfg.iceServers).find((server: any) => server?.username || server?.credential) || {}
  extraTurnUrls.forEach(url => {
    push({
      iceServers: [{ urls: url, username: credentialSource.username, credential: credentialSource.credential }],
      iceTransportPolicy: 'all',
      iceCandidatePoolSize: 0
    })
  })
  return strategies.length ? strategies : [{ iceServers: [] }]
}

function uuid(runtime: any) {
  if (runtime?.crypto?.randomUUID) return runtime.crypto.randomUUID().toUpperCase()
  const part = () => ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1)
  return `${part()}${part()}-${part()}-4${part().substring(0, 3)}-${part()}-${part()}${part()}`.toUpperCase()
}

export interface CameraRtcOptions {
  videoElement: HTMLVideoElement
  deviceId: string
  socketUrl: string
  extraTurnUrls?: string[]
  disconnectGraceMs?: number
  callTimeoutMs?: number
  retryDelayMs?: number
  maxRetryDelayMs?: number
  heartbeatIntervalMs?: number
  onStatus?: (status: { state: string; message: string; retryCount: number }) => void
}

export class CameraRtcPlayer {
  videoElement: HTMLVideoElement
  deviceId: string
  socketUrl: string
  extraTurnUrls: string[]
  disconnectGraceMs: number
  callTimeoutMs: number
  retryDelayMs: number
  maxRetryDelayMs: number
  heartbeatIntervalMs: number
  onStatus: (status: { state: string; message: string; retryCount: number }) => void

  socket: WebSocket | null
  peerConnection: RTCPeerConnection | null
  dataChannel: RTCDataChannel | null
  sessionId: string
  clientId: string
  iceStrategies: any[]
  iceConfiguration: any
  pendingRemoteCandidates: any[]
  remoteDescriptionReady: boolean

  retryCount: number
  generation: number
  stopped: boolean
  disconnectTimer: number | null
  retryTimer: number | null
  callTimer: number | null
  heartbeatTimer: number | null

  constructor(options: CameraRtcOptions) {
    this.videoElement = options.videoElement
    this.deviceId = options.deviceId
    this.socketUrl = String(options.socketUrl || '').replace(/\/+$/, '')
    this.extraTurnUrls = options.extraTurnUrls || []
    this.disconnectGraceMs = options.disconnectGraceMs ?? DEFAULT_DISCONNECT_GRACE_MS
    this.callTimeoutMs = options.callTimeoutMs ?? DEFAULT_CALL_TIMEOUT_MS
    this.retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS
    this.maxRetryDelayMs = options.maxRetryDelayMs ?? DEFAULT_MAX_RETRY_DELAY_MS
    this.heartbeatIntervalMs = options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS
    this.onStatus = options.onStatus || (() => {})

    this.socket = null
    this.peerConnection = null
    this.dataChannel = null
    this.sessionId = ''
    this.clientId = ''
    this.iceStrategies = []
    this.iceConfiguration = { iceServers: [] }
    this.pendingRemoteCandidates = []
    this.remoteDescriptionReady = false

    this.retryCount = 0
    this.generation = 0
    this.stopped = true
    this.disconnectTimer = null
    this.retryTimer = null
    this.callTimer = null
    this.heartbeatTimer = null
  }

  start() {
    if (!this.videoElement || !this.deviceId || !this.socketUrl) {
      this.setStatus('failed', 'CameraRTC 播放参数不完整')
      return
    }
    this.stopped = false
    this.retryCount = 0
    this.openSocket()
  }

  stop() {
    if (this.stopped) return
    this.sendDisconnect()
    this.stopped = true
    this.generation += 1
    this.clearTimers()
    this.cleanupPeerConnection()
    this.cleanupSocket()
    this.setStatus('idle', '')
  }

  private openSocket() {
    if (this.stopped) return
    this.cleanupSocket()
    this.setStatus('connecting', '正在连接 CameraRTC 信令服务…')
    this.clientId = uuid(window)
    const socket = new WebSocket(`${this.socketUrl}/wswebclient/${this.clientId}`)
    this.socket = socket
    socket.onopen = () => {
      if (this.stopped || socket !== this.socket) return
      this.startHeartbeat()
      this.connectToDevice()
    }
    socket.onmessage = event => this.handleSocketMessage(event)
    socket.onclose = () => {
      if (socket !== this.socket) return
      this.socket = null
      if (!this.stopped) this.scheduleReconnect('信令连接中断')
    }
  }

  private connectToDevice() {
    if (this.stopped || !this.isSocketOpen()) return
    this.generation += 1
    this.cleanupPeerConnection()
    this.clearAttemptTimers()
    this.sessionId = `PCWEB-${uuid(window)}`
    this.pendingRemoteCandidates = []
    this.remoteDescriptionReady = false
    this.setStatus('connecting', '正在连接设备…')
    this.send('__connectto', { to: this.deviceId })
    this.armCallTimeout()
  }

  private async handleSocketMessage(event: MessageEvent) {
    let payload: any
    try {
      payload = JSON.parse(event.data)
    } catch (e) {
      return
    }
    const data = payload?.data || {}
    if (data.sessionId !== this.sessionId) return
    switch (payload.eventName) {
      case '_create':
        this.handleCreate(data)
        break
      case '_offer':
        await this.handleOffer(data)
        break
      case '_ice_candidate':
        await this.handleRemoteCandidate(data)
        break
      case '_session_failed':
        this.scheduleReconnect(data.message === 'call time out' ? '设备呼叫超时' : '设备会话失败')
        break
      case '_session_disconnected':
        this.scheduleReconnect('设备结束了播放会话')
        break
      default:
        break
    }
  }

  private handleCreate(data: any) {
    if (!['online', 'sleep'].includes(data.state)) {
      this.scheduleReconnect('设备当前离线')
      return
    }
    this.iceStrategies = buildIceStrategies(data, this.extraTurnUrls)
    const index = this.retryCount <= 1 ? 0 : (this.retryCount - 1) % this.iceStrategies.length
    this.iceConfiguration = this.iceStrategies[index]
    this.setStatus('negotiating', '正在协商媒体通道…')
    this.send('__call', {
      to: this.deviceId,
      datachannel: 'true',
      audio: 'recvonly',
      video: 'recvonly',
      user: 'admin',
      pwd: '123456',
      mode: 'live',
      source: 'MainStream',
      iceservers: JSON.stringify(this.iceConfiguration)
    })
    this.armCallTimeout()
  }

  private async handleOffer(data: any) {
    const generation = this.generation
    try {
      const peer = this.createPeerConnection(generation)
      await peer.setRemoteDescription({ type: 'offer', sdp: data.sdp })
      if (!this.isCurrentPeer(peer, generation)) return
      this.remoteDescriptionReady = true
      await this.flushRemoteCandidates(peer, generation)
      const answer = await peer.createAnswer()
      if (!this.isCurrentPeer(peer, generation)) return
      await peer.setLocalDescription(answer)
      if (!this.isCurrentPeer(peer, generation)) return
      this.send('__answer', { to: this.deviceId, type: answer.type, sdp: answer.sdp })
      this.setStatus('negotiating', '正在建立视频通道…')
    } catch (e) {
      this.scheduleReconnect('媒体协商失败')
    }
  }

  private createPeerConnection(generation: number) {
    const pending = this.pendingRemoteCandidates
    this.cleanupPeerConnection()
    this.pendingRemoteCandidates = pending
    const peer = new RTCPeerConnection(this.iceConfiguration)
    this.peerConnection = peer
    if (typeof peer.createDataChannel === 'function') {
      try {
        this.dataChannel = peer.createDataChannel('mydatachannel')
      } catch (e) {
        this.dataChannel = null
      }
    }
    peer.ontrack = (event) => {
      if (!this.isCurrentPeer(peer, generation)) return
      const stream = event.streams?.[0] || new MediaStream([event.track])
      this.videoElement.srcObject = stream
      stream.getAudioTracks().forEach(track => {
        track.enabled = true
      })
      const playing = this.videoElement.play()
      if (playing?.then) {
        playing.then(() => {
          this.videoElement.muted = false
        }).catch(() => {
          this.videoElement.controls = true
        })
      }
      this.setStatus('playing', '播放中')
    }
    peer.onicecandidate = (event) => {
      if (!event.candidate || !this.isCurrentPeer(peer, generation)) return
      this.send('__ice_candidate', {
        to: this.deviceId,
        candidate: JSON.stringify({
          candidate: event.candidate.candidate,
          sdpMid: event.candidate.sdpMid,
          sdpMLineIndex: event.candidate.sdpMLineIndex
        })
      })
    }
    peer.oniceconnectionstatechange = () => {
      if (this.isCurrentPeer(peer, generation)) this.handleIceConnectionState(peer.iceConnectionState)
    }
    return peer
  }

  private async handleRemoteCandidate(data: any) {
    let candidate: any
    try {
      candidate = typeof data.candidate === 'string' ? JSON.parse(data.candidate) : data.candidate
    } catch (e) {
      return
    }
    if (!candidate) return
    if (!this.peerConnection || !this.remoteDescriptionReady) {
      this.pendingRemoteCandidates.push(candidate)
      return
    }
    try {
      await this.peerConnection.addIceCandidate(candidate)
    } catch (e) {
      // 候选过期或被拒绝时忽略，重连兜底
    }
  }

  private async flushRemoteCandidates(peer: RTCPeerConnection, generation: number) {
    const list = this.pendingRemoteCandidates.splice(0)
    for (const candidate of list) {
      if (!this.isCurrentPeer(peer, generation)) return
      try {
        await peer.addIceCandidate(candidate)
      } catch (e) {
        // 同上
      }
    }
  }

  private handleIceConnectionState(state: string) {
    if (['connected', 'completed'].includes(state)) {
      this.clearDisconnectTimer()
      this.clearCallTimer()
      this.retryCount = 0
      this.setStatus('playing', '播放中')
      return
    }
    if (state === 'disconnected') {
      if (this.disconnectTimer) return
      this.setStatus('recovering', `网络波动，等待 ${Math.ceil(this.disconnectGraceMs / 1000)} 秒自动恢复…`)
      const peer = this.peerConnection
      this.disconnectTimer = window.setTimeout(() => {
        this.disconnectTimer = null
        if (peer === this.peerConnection && peer?.iceConnectionState === 'disconnected') {
          this.scheduleReconnect('媒体连接中断')
        }
      }, this.disconnectGraceMs)
      return
    }
    if (state === 'failed') {
      this.clearDisconnectTimer()
      this.scheduleReconnect('媒体连接失败')
    }
  }

  private scheduleReconnect(message: string) {
    if (this.stopped || this.retryTimer) return
    this.clearAttemptTimers()
    this.sendDisconnect()
    this.cleanupPeerConnection()
    const count = ++this.retryCount
    const steps = Math.max(0, Math.ceil(Math.log2(this.maxRetryDelayMs / this.retryDelayMs)))
    const delay = Math.min(this.retryDelayMs * 2 ** Math.min(count - 1, steps), this.maxRetryDelayMs)
    this.setStatus('retrying', `${message}，${Math.max(1, Math.ceil(delay / 1000))} 秒后重连（第 ${count} 次）`)
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = null
      if (this.stopped) return
      if (this.isSocketOpen()) this.connectToDevice()
      else this.openSocket()
    }, delay)
  }

  private armCallTimeout() {
    this.clearCallTimer()
    this.callTimer = window.setTimeout(() => {
      this.callTimer = null
      this.scheduleReconnect('设备呼叫超时')
    }, this.callTimeoutMs)
  }

  private startHeartbeat() {
    this.clearHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      if (!this.stopped && this.sessionId && this.isSocketOpen()) {
        this.send('__ping', { to: this.deviceId })
      }
    }, this.heartbeatIntervalMs)
  }

  private send(eventName: string, extra: any = {}) {
    if (!this.isSocketOpen()) return false
    this.socket!.send(JSON.stringify({
      eventName,
      data: {
        sessionId: this.sessionId,
        sessionType: 'IE',
        messageId: uuid(window),
        from: this.clientId,
        ...extra
      }
    }))
    return true
  }

  private sendDisconnect() {
    if (!this.sessionId || !this.isSocketOpen()) return
    this.send('__disconnected', { to: this.deviceId })
  }

  private isSocketOpen() {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN
  }

  private isCurrentPeer(peer: RTCPeerConnection, generation: number) {
    return !this.stopped && peer === this.peerConnection && generation === this.generation
  }

  private cleanupPeerConnection() {
    const peer = this.peerConnection
    this.peerConnection = null
    this.remoteDescriptionReady = false
    this.pendingRemoteCandidates = []
    const channel = this.dataChannel
    this.dataChannel = null
    if (channel) {
      channel.onopen = null
      channel.onclose = null
      channel.onerror = null
      if (channel.readyState !== 'closed') channel.close()
    }
    if (peer) {
      peer.ontrack = null
      peer.onicecandidate = null
      peer.oniceconnectionstatechange = null
      if (peer.signalingState !== 'closed') peer.close()
    }
    const stream = this.videoElement?.srcObject as MediaStream | null
    if (stream?.getTracks) stream.getTracks().forEach(track => track.stop())
    if (this.videoElement) this.videoElement.srcObject = null
  }

  private cleanupSocket() {
    this.clearHeartbeat()
    const socket = this.socket
    this.socket = null
    if (socket) {
      socket.onopen = null
      socket.onmessage = null
      socket.onclose = null
      if (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'player closed')
      }
    }
  }

  private clearAttemptTimers() {
    this.clearDisconnectTimer()
    this.clearCallTimer()
  }

  private clearDisconnectTimer() {
    if (this.disconnectTimer) {
      window.clearTimeout(this.disconnectTimer)
      this.disconnectTimer = null
    }
  }

  private clearCallTimer() {
    if (this.callTimer) {
      window.clearTimeout(this.callTimer)
      this.callTimer = null
    }
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private clearTimers() {
    this.clearAttemptTimers()
    if (this.retryTimer) {
      window.clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
  }

  private setStatus(state: string, message: string) {
    this.onStatus({ state, message, retryCount: this.retryCount })
  }
}

/**
 * 解析预览地址中的 CameraRTC 呼叫目标。
 * WVP 返回形如 http://146.56.220.167:8082/videocall/AETY-00-2N27-58QA-00000006，
 * 其中只有最后一段设备 ID 有意义，信令服务地址固定走网关 camera-rtc 路由。
 */
export function parseCameraRtcTarget(url: string): CameraRtcTarget | null {
  const value = String(url || '').trim()
  if (!value) return null
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch (e) {
    return null
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) return null
  const segments = parsed.pathname.split('/').filter(Boolean)
  const index = segments.findIndex(segment => segment.toLowerCase() === 'videocall')
  const cameraId = index >= 0 ? segments[index + 1] : ''
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(cameraId)) return null
  return { cameraId, socketUrl: Config.cameraRtcSocketURL }
}
