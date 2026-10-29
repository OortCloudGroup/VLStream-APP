import Foundation

/**
 * VLStreamCloud iOS 端应用配置（与 Android 端 AppConfig.java 对齐）。
 *
 * 环境切换：vlEnv 决定后端环境（multi/single），gateway 仅在需要覆盖 H5 预设时填写。
 * app_id/app_secret/applabel 为业务侧固定值，version 默认 1.0.0
 * （运行期 getAppInfo / __VL_STATIC__ 会用 Bundle.main 的真实 bundleId 与版本覆盖）。
 */
enum AppConfig {
    /// 后端环境名：multi=多租户生产 / single=单租户。各服务域名预设表在 H5（vue3-h5/src/config/index.js）。
    static let vlEnv = "single"

    /// 业务网关覆盖地址（含端口，不带末尾斜杠）。留空表示沿用 H5 的环境预设，仅现场部署需要覆盖时才填。
    static let gateway = ""

    /// 业务网关前缀（与 H5 config.gateWay 一致）。
    static let gateWayPrefix = "bus/"

    /// 应用包名（默认占位，运行期取 Bundle.main.bundleIdentifier）。
    static let appPackage = "com.oort.vlstream"

    static let appId = "747aa0fa18d047c8b526e242142e0a6c"
    static let appSecret = "3a97f4f65b204a3a96071746fa42936a"
    static let appLabel = "VLStreamCloud"
    static let version = "1.0.0"
}
