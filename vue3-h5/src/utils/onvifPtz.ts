/*
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
*/

// ONVIF 云台能力与持续转动控制，口径与 PC 管理端 utils/onvifPtzCapabilities.js、
// utils/onvifPtzHold.js 一致：方向值是 upper/below/left/right，速度按 controSpeed 传。

export interface PtzCapabilities {
  status: 'checking' | 'supported' | 'unsupported' | 'unknown'
  reason: string
  continuousPanTilt: boolean
  presets: boolean
  profileToken: string
}

const UNKNOWN_REASON = '无法确认云台能力，请检查设备网络、账号或协议兼容性后重新检查'

export function normalizePtzCapabilities(data: any, fallbackProfile = ''): PtzCapabilities {
  const status = ['supported', 'unsupported', 'unknown'].includes(data?.status) ? data.status : 'unknown'
  return {
    status,
    reason: typeof data?.reason === 'string' && data.reason.trim()
      ? data.reason
      : status === 'unsupported' ? '该设备不支持云台控制' : status === 'unknown' ? UNKNOWN_REASON : '',
    continuousPanTilt: status === 'supported' && data?.continuousPanTilt === true,
    presets: status === 'supported' && data?.presets === true,
    profileToken: typeof data?.profileToken === 'string' && data.profileToken.trim()
      ? data.profileToken
      : typeof fallbackProfile === 'string' ? fallbackProfile : ''
  }
}

export function checkingCapabilities(reason = '正在检查云台能力，请稍候'): PtzCapabilities {
  return { status: 'checking', reason, continuousPanTilt: false, presets: false, profileToken: '' }
}

export function unsupportedCapabilities(reason: string): PtzCapabilities {
  return { status: 'unsupported', reason, continuousPanTilt: false, presets: false, profileToken: '' }
}

export function canUsePtzMovement(capabilities: PtzCapabilities | null) {
  return capabilities?.status === 'supported' && capabilities.continuousPanTilt === true
}

export function canUsePtzPresets(capabilities: PtzCapabilities | null) {
  return capabilities?.status === 'supported' && capabilities.presets === true
}

export const PTZ_DIRECTIONS: Record<string, string> = {
  up: 'upper',
  down: 'below',
  left: 'left',
  right: 'right'
}

interface HoldOptions {
  startRequest: (params: { id: string | number; direction: string; controSpeed: number }) => Promise<any>
  stopRequest: (params: { id: string | number }) => Promise<any>
  onError?: (error: any) => void
}

// 串行化 start/stop，避免迟到的 start 落在 stop 之后让云台一直转。
export function createPtzHoldController({ startRequest, stopRequest, onError = () => {} }: HoldOptions) {
  let active: any = null
  let tail: Promise<any> = Promise.resolve()
  const enqueue = (job: () => Promise<any>) => {
    const result = tail.then(job)
    tail = result.catch(onError)
    return tail
  }
  const move = (context: any) => enqueue(async() => {
    if (!context.pressed) return
    context.sent = true
    try {
      await startRequest({ id: context.id, direction: context.direction, controSpeed: context.speed })
    } catch (error) {
      context.pressed = false
      if (active === context) active = null
      await stopRequest({ id: context.id }).catch(() => {})
      throw error
    }
    if (context.pressed) context.timer = setTimeout(() => move(context), 700)
  })
  const stop = () => {
    const context = active
    if (!context) return tail
    active = null
    context.pressed = false
    clearTimeout(context.timer)
    return enqueue(() => context.sent ? stopRequest({ id: context.id }) : Promise.resolve())
  }
  const start = ({ id, direction, speed }: { id: string | number; direction: string; speed: number }) => {
    stop()
    if (id === null || id === undefined || id === '') return tail
    const context = { id, direction, speed, pressed: true, sent: false, timer: 0 }
    active = context
    return move(context)
  }
  return { start, stop, settled: () => tail }
}
