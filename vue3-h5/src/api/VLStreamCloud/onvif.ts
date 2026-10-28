/*
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { request } from '@/utils/service'
import config from '@/config'

// ONVIF 云台控制走 WVP 原生服务 wvp-server，接口、参数、协议与 PC 管理端完全一致。
// 鉴权由 utils/service.ts 请求拦截器注入 x-vlstream-token / x-wvp-auth-source。
function commonFunc<T, K>(interfaceName: string, data: T, method = 'get') {
  return request<K>({
    url: config.URL + config.gateWay + 'wvp-server' + interfaceName,
    method,
    params: data
  })
}

/**
 * ONVIF 设备列表，data 为数组，云台控制用记录里的 id / ip / userName / password / channel
 */
export function getOnvifDeviceList(params = {}) {
  return commonFunc('/onvif/device/deviceList', params, 'get')
}

/**
 * 云台能力检查：{ status: supported|unsupported|unknown, reason, continuousPanTilt, presets, profileToken }
 */
export function getPtzCapabilities(params) {
  return request<any>({
    url: `${config.URL}${config.gateWay}wvp-server/onvif/service/ptzCapabilities`,
    method: 'get',
    params,
    timeout: 30 * 1000
  })
}

/**
 * 开始持续转动：direction 取 upper / below / left / right，controSpeed 0.1~1
 */
export function onvifPtzStart(params) {
  return commonFunc('/onvif/service/onvifPZTStart', params, 'get')
}

/**
 * 停止转动
 */
export function onvifPtzStop(params) {
  return commonFunc('/onvif/service/onvifPZTEnd', params, 'get')
}

/**
 * 预置点列表，data 为 [{ token, name }]
 */
export function getOnvifPresets(params) {
  return commonFunc('/onvif/service/getPresets', params, 'get')
}

export function addOnvifPreset(params) {
  return commonFunc('/onvif/service/addPreset', params, 'get')
}

export function gotoOnvifPreset(params) {
  return commonFunc('/onvif/service/gotoPreset', params, 'get')
}

export function removeOnvifPreset(params) {
  return commonFunc('/onvif/service/removePreset', params, 'get')
}
