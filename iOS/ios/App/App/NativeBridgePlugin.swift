import Foundation
import Capacitor
import WebKit

/**
 * VLStreamCloud 自研业务 Plugin（iOS 版，与 Android 端 NativeBridgePlugin 对齐）。
 *
 * 提供 H5 旧桥接约定里「非通用」、无现成 Capacitor 官方插件可替代的能力：
 *   - getGateway  —— 返回后端网关地址
 *   - getAppInfo  —— 返回应用信息（包名/appId/secret/版本）
 *   - tokenOverdue —— 清 H5 会话并 reload 重登
 *   - setStatusBar —— 动态设置状态栏前景色明暗（H5 按页面内容联动）
 *   - setImmersiveMode —— 全屏视频沉浸式：隐藏/恢复系统状态栏
 *
 * 通用能力（拍照/相册、退出 App、定位）由官方插件提供：
 * @capacitor/app、@capacitor/camera、@capacitor/geolocation。
 *
 * 此外，load() 通过 WKUserScript 在 document-start 时机注入同步静态变量
 * window.__VL_STATIC__（gateway / appInfo）、运行环境标志
 * window.global.is_native_shell=true，以及状态栏安全区高度
 * window.__safeAreaTop（CSS px），保证它们在任何业务脚本之前就绪——
 * 从而 H5 侧 androidFunUtils.js 能用「同步调用」拿到网关（App.vue 不必改成 async），
 * LoginDev / workbench 能精确留出状态栏空间（与鸿蒙/Android 壳一致）。
 *
 * 注意：jsName 为 "NativeBridge"，与 Android 端 @CapacitorPlugin(name="NativeBridge") 一致，
 * H5 侧通过 Capacitor.Plugins.NativeBridge 统一访问。
 */
@objc(NativeBridgePlugin)
public class NativeBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeBridgePlugin"
    public let jsName = "NativeBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getGateway", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getAppInfo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "tokenOverdue", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setStatusBar", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "setImmersiveMode", returnType: CAPPluginReturnPromise)
    ]

    /// JS 全局对象名：window.__VL_STATIC__
    private static let jsStaticVar = "__VL_STATIC__"

    // MARK: - Lifecycle

    public override func load() {
        super.load()
        injectDocumentStartScript()
    }

    /// 在 WKWebView 上注入 document-start 脚本（早于业务脚本执行）。
    /// 注：Capacitor 默认 scheme=capacitor（capacitor://localhost），
    /// 在此处通过 userContentController 追加 WKUserScript。
    private func injectDocumentStartScript() {
        guard let webView = self.bridge?.webView else { return }
        let script = Self.bootScript(vlEnv: AppConfig.vlEnv,
                                     gateway: AppConfig.gateway,
                                     appId: AppConfig.appId,
                                     appSecret: AppConfig.appSecret,
                                     appLabel: AppConfig.appLabel,
                                     version: AppConfig.version,
                                     packageName: AppConfig.appPackage,
                                     safeAreaTop: statusBarHeightCssPx())
        let userScript = WKUserScript(source: script,
                                      injectionTime: .atDocumentStart,
                                      forMainFrameOnly: true)
        webView.configuration.userContentController.addUserScript(userScript)
    }

    /// 状态栏高度（CSS px = pt）。WKWebView 全屏铺满、状态栏透明，
    /// H5 用注入的 window.__safeAreaTop 顶部留白（与 Android/鸿蒙一致）。
    private func statusBarHeightCssPx() -> CGFloat {
        if let windowScene = UIApplication.shared.connectedScenes.first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene,
           let height = windowScene.statusBarManager?.statusBarFrame.height,
           height > 0 {
            return height
        }
        if let frame = self.bridge?.viewController?.view.window?.windowScene?.statusBarManager?.statusBarFrame, frame.height > 0 {
            return frame.height
        }
        return self.bridge?.viewController?.view.safeAreaInsets.top ?? 0
    }

    /// 构造启动注入脚本（运行环境标志 + 同步静态变量 + 安全区高度）。
    private static func bootScript(vlEnv: String,
                                   gateway: String,
                                   appId: String,
                                   appSecret: String,
                                   appLabel: String,
                                   version: String,
                                   packageName: String,
                                   safeAreaTop: CGFloat) -> String {
        var appInfo: [String: Any] = [
            "apppackage": packageName,
            "app_id": appId,
            "app_secret": appSecret,
            "applabel": appLabel,
            "version": version
        ]
        if let bundleId = Bundle.main.bundleIdentifier {
            appInfo["apppackage"] = bundleId
        }
        if let infoDict = Bundle.main.infoDictionary,
           let shortVersion = infoDict["CFBundleShortVersionString"] as? String {
            appInfo["version"] = shortVersion
        }
        // appInfo → JSON 字符串（简单拼接，避免引入额外 JSON 依赖）
        let appInfoJson = Self.toJsonObject(appInfo)
        return """
        (function(){try{
        window.global=window.global||{};
        window.global.is_native_shell=true;
        window.global.is_cordova=false;
        window.global.is_phone=true;
        window.global.is_harmony=false;
        window.\(jsStaticVar)={"vlEnv":\(Self.quote(vlEnv)),"gateway":\(Self.quote(gateway)),"appInfo":\(appInfoJson)};
        window.__safeAreaTop=\(safeAreaTop);
        }catch(e){console.error('[NativeBridgePlugin] inject failed',e);}})();
        """
    }

    // MARK: - Plugin Methods

    /// 返回网关地址。H5 侧已在启动期同步拿到（window.__VL_STATIC__.gateway），
    /// 该方法作为兜底/显式查询入口。
    @objc func getGateway(_ call: CAPPluginCall) {
        call.resolve([
            "gateway": AppConfig.gateway
        ])
    }

    /// 返回应用信息。
    @objc func getAppInfo(_ call: CAPPluginCall) {
        var info: [String: Any] = [
            "apppackage": AppConfig.appPackage,
            "app_id": AppConfig.appId,
            "app_secret": AppConfig.appSecret,
            "applabel": AppConfig.appLabel,
            "version": AppConfig.version
        ]
        if let bundleId = Bundle.main.bundleIdentifier {
            info["apppackage"] = bundleId
        }
        if let infoDict = Bundle.main.infoDictionary,
           let shortVersion = infoDict["CFBundleShortVersionString"] as? String {
            info["version"] = shortVersion
        }
        call.resolve(info)
    }

    /// Token 失效：清掉 H5 sessionStorage 里的 token/tempObj/tenantId/autoLogin，
    /// 复位路由并 reload。
    @objc func tokenOverdue(_ call: CAPPluginCall) {
        let js = """
        (function(){try{
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('tempObj');
        sessionStorage.removeItem('tenantId');
        sessionStorage.removeItem('autoLogin');
        }catch(e){}
        window.location.hash='';
        location.replace(location.href.split('#')[0]);
        })();
        """
        self.bridge?.eval(js: js)
        call.resolve()
    }

    /// 动态设置状态栏前景色明暗，使状态栏图标/文字与紧邻其下的 H5 内容对比一致。
    /// 参数：color（背景，iOS 状态栏透明由 H5 内容透出，仅作兼容保留）、
    /// contentColor（图标/文字颜色，默认 #000000）。
    @objc func setStatusBar(_ call: CAPPluginCall) {
        let contentColor = call.getString("contentColor") ?? "#000000"
        // Light content color (e.g. white icons on a dark page) → lightContent icons;
        // dark content color → darkContent icons (iOS 13+).
        let style: UIStatusBarStyle = Self.isLightColor(contentColor) ? .lightContent : .darkContent
        DispatchQueue.main.async { [weak self] in
            self?.bridge?.statusBarStyle = style
        }
        call.resolve()
    }

    /// 全屏视频沉浸式开关。
    /// enabled=true：隐藏系统状态栏，视频铺满整屏；
    /// enabled=false：恢复状态栏显示。
    @objc func setImmersiveMode(_ call: CAPPluginCall) {
        let enabled = call.getBoolean("enabled") ?? false
        DispatchQueue.main.async { [weak self] in
            self?.bridge?.statusBarVisible = enabled ? false : true
        }
        call.resolve()
    }

    // MARK: - Color helpers

    /// 解析 #RRGGBB / #AARRGGBB 并判断相对亮度（>0.5 视为浅色），非法输入按深色处理。
    private static func isLightColor(_ hex: String) -> Bool {
        var normalized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        if normalized.hasPrefix("#") { normalized.removeFirst() }
        guard normalized.count == 6 || normalized.count == 8,
              let value = UInt64(normalized, radix: 16) else {
            return false
        }
        // Both #RRGGBB and #AARRGGBB: red/green/blue sit in the low 24 bits.
        let r = CGFloat((value >> 16) & 0xFF)
        let g = CGFloat((value >> 8) & 0xFF)
        let b = CGFloat(value & 0xFF)
        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0
        return luminance > 0.5
    }

    // MARK: - JSON helpers

    /// 把 [String: Any] 序列化为 JSON 字符串（顶层为对象）。
    private static func toJsonObject(_ dict: [String: Any]) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: dict, options: []),
              let str = String(data: data, encoding: .utf8) else {
            return "{}"
        }
        return str
    }

    /// 给字符串加 JSON 引号并转义。
    private static func quote(_ s: String) -> String {
        guard let data = try? JSONSerialization.data(withJSONObject: [s], options: []),
              let str = String(data: data, encoding: .utf8) else {
            return "\"\""
        }
        // [s] 序列化为 ["..."]，去掉首尾方括号
        let trimmed = str.dropFirst().dropLast()
        return String(trimmed)
    }
}
