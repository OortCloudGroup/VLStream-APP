/*
 * @Author: lanjian
 * @Date: 2021-12-10 10:35:26
 * @LastEditors: lanjian
 * @LastEditTime: 2021-12-10 10:35:56
 * @FilePath: \cordava_utils\demo\src\config\index.js
 * @Description: Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
 */

let config = {
  headers: {},
  frontURLStr: '/front'
}
config.token = ''
config.gateWay = 'bus/'

// 播放器播放 摄像头的webSocket地址
config.webRTCSocketURL = 'ws://146.56.220.167:8082'

/**
 * 多租户生产(multi) / 单租户(single) 环境预设表，切换只改一个变量：
 *   - 纯浏览器/构建：.env 的 VITE_VL_ENV，或命令行 `VITE_VL_ENV=multi pnpm start`
 *   - 原生壳：注入 window.__VL_STATIC__.vlEnv（同一份 dist 可装到两种环境）
 * URL：VLStream 业务服务（apaas-vls-server / apaas-wvp-server）。
 * platformURL：aPaaS 平台服务（apaas-sso 登录与验证码、租户、字典、区域、表单、上传、地图）。
 * cameraRtcSocketURL：VLStream 协议设备实时预览的信令地址，该端口只做 TLS，必须用 wss。
 *
 * 两套环境的认证方式也不同（服务端 GET vls-server/sso/v1/mode 会告知 tenantType）：
 *   multi  authMode=platform：apaas-sso 拿平台 accessToken，再换 VLStream JWT（utils/vlstreamAuth）。
 *   single authMode=local：vlstream 集群不路由 apaas-*，登录走本地 BladeX
 *          `POST vls-server/blade-auth/token`（表单参数 account/password/grant_type/scope/type），
 *          返回的 accessToken 同时充当业务令牌与 wvp 的 x-vlstream-token，租户固定 000000，
 *          不需要 exchangeToken，也没有验证码。
 */
const VL_ENV_PRESETS = {
  multi: {
    URL: 'https://workup.oortcloudsmart.com:2443/',
    platformURL: 'https://workup.oortcloudsmart.com:2443/',
    cameraRtcSocketURL: 'wss://vlstream.oortcloudsmart.com:2443/bus/camera-rtc',
    authMode: 'platform',
    authService: 'apaas-sso',
    bladeClientAuth: '',
    tenantId: ''
  },
  single: {
    // 单租户自成一套集群：平台服务在该域名下不存在（nginx 404），
    // 故 platformURL 与 URL 同域，宁可就地失败也不把本地令牌发到多租户集群。
    URL: 'https://vlstream.oortcloudsmart.com:2443/',
    platformURL: 'https://vlstream.oortcloudsmart.com:2443/',
    cameraRtcSocketURL: 'wss://vlstream.oortcloudsmart.com:2443/bus/camera-rtc',
    authMode: 'local',
    authService: 'vls-server',
    // BladeX 公开客户端凭证（厂商 PC 端 bundle 里同样是明文常量）
    bladeClientAuth: 'Basic c2FiZXI6c2FiZXJfc2VjcmV0',
    tenantId: '000000'
  }
}

// 没有显式配置时按多租户生产，避免发布出去的包指向未验证的环境
const DEFAULT_VL_ENV = 'multi'

/**
 * 切换环境。名称不认识时保持当前环境不变（不把网关改成 undefined 让请求全挂）。
 * @param {string} name multi | single
 * @returns {string} 实际生效的环境名
 */
export function applyVlEnv(name) {
  const key = String(name || '').trim().toLowerCase()
  const preset = VL_ENV_PRESETS[key]
  if (preset) {
    config.vlEnv = key
    config.URL = preset.URL
    config.platformURL = preset.platformURL
    config.cameraRtcSocketURL = preset.cameraRtcSocketURL
    config.authMode = preset.authMode
    config.authService = preset.authService
    config.bladeClientAuth = preset.bladeClientAuth
    config.tenantId = preset.tenantId
  }
  return config.vlEnv
}

applyVlEnv(import.meta.env.VITE_VL_ENV || DEFAULT_VL_ENV)

export default config
