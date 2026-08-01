/*
 * 配置层：移植 vue3-h5-ts 的 config/index.ts + config/AppConfig.ts。
 * 原型去掉 Cordova 运行时注入，用写死值。
 */
interface AppConfig {
  headers: Record<string, any>
  frontURLStr: string
  URL: string
  token: string
  gateWay: string
  webRTCSocketURL: string
}

const config: AppConfig = {
  headers: {},
  frontURLStr: '/front'
}
config.URL = 'http://183.62.103.20:21410/'
config.token = ''
config.gateWay = 'bus/'
config.webRTCSocketURL = 'ws://146.56.220.167:8082'

export const APP_APPID = '747aa0fa18d047c8b526e242142e0a6c'
export const APP_SECRETKEY = '3a97f4f65b204a3a96071746fa42936a'
export const APP_REQUESTTYPE = 'app'

export default config
