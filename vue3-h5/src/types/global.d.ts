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
  /** 原生壳注入的 Capacitor 运行时（document-start，非 npm 包） */
  Capacitor?: {
    /** 旧版壳的运行环境标志（标准 Capacitor 桥为 isNativePlatform()） */
    isNative?: boolean
    /** 标准 Capacitor 运行时检测（鸿蒙 native-bridge.js 只提供这个） */
    isNativePlatform?: () => boolean
    Plugins?: {
      /** 自研 NativeBridge plugin 暴露给 H5 的桥接面（三端壳按能力选择性实现） */
      NativeBridge?: {
        /** 动态设置状态栏背景/前景色，使其与状态栏下方的 H5 内容融为一体 */
        setStatusBar?: (options: { color: string, contentColor: string }) => Promise<void>
        /** 全屏视频沉浸式：隐藏/恢复系统状态栏与导航栏（仅鸿蒙壳实现） */
        setImmersiveMode?: (options: { enabled: boolean }) => Promise<void>
      }
    }
  }
}
