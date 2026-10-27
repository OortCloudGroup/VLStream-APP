/**
 * 原生壳桥接层（public/androidFunUtils.js）在 window 上挂载的全局对象。
 * 三端壳共用同一份签名，见 Android/iOS/HarmonyOS 的 NativeBridgePlugin。
 */
interface AndroidFunUtils {
  getGateway: () => string
  getToken: () => Promise<string>
  getAppInfo: () => Promise<string>
  tokenOverdue: () => Promise<boolean>
  appExit: () => Promise<boolean>
  takePhoto: (params?: Record<string, any>) => Promise<string>
}

interface Window {
  androidFunUtils: AndroidFunUtils
  /** 原生壳 document-start 注入的同步静态变量 */
  __VL_STATIC__?: {
    /** 后端网关地址，空则沿用 H5 构建时的环境预设 */
    gateway?: string
    /** 环境名：multi=多租户生产 / single=单租户，见 src/config/index.js 预设表 */
    vlEnv?: string
    appInfo?: Record<string, string>
  }
  /** 沉浸式状态栏安全区高度（CSS px / vp） */
  __safeAreaTop?: number
  /** 原生壳运行环境标志 */
  global: {
    is_native_shell?: boolean
    is_cordova?: boolean
    is_phone?: boolean
    is_harmony?: boolean
  }
  /** 地图弹窗按钮的全局回调（Leaflet popup 的 HTML 字符串内联调用） */
  mapBtnClick?: (type: string, ...args: any[]) => void
  accessToken?: string
}
