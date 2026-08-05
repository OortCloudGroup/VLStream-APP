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
 *
 * 通用能力（拍照/相册、退出 App、定位）由官方插件提供：
 * @capacitor/app、@capacitor/camera、@capacitor/geolocation。
 *
 * 此外，load() 通过 WKUserScript 在 document-start 时机注入同步静态变量
 * window.__VL_STATIC__（gateway / appInfo）与运行环境标志
 * window.global.is_native_shell=true，保证它们在任何业务脚本之前就绪——
 * 从而 H5 侧 androidFunUtils.js 能用「同步调用」拿到网关（App.vue 不必改成 async）。
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
        CAPPluginMethod(name: "tokenOverdue", returnType: CAPPluginReturnPromise)
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
        let script = Self.bootScript(gateway: AppConfig.gateway,
                                     appId: AppConfig.appId,
                                     appSecret: AppConfig.appSecret,
                                     appLabel: AppConfig.appLabel,
                                     version: AppConfig.version,
                                     packageName: AppConfig.appPackage)
        let userScript = WKUserScript(source: script,
                                      injectionTime: .atDocumentStart,
                                      forMainFrameOnly: true)
        webView.configuration.userContentController.addUserScript(userScript)
    }

    /// 构造启动注入脚本（运行环境标志 + 同步静态变量）。
    private static func bootScript(gateway: String,
                                   appId: String,
                                   appSecret: String,
                                   appLabel: String,
                                   version: String,
                                   packageName: String) -> String {
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
        window.\(jsStaticVar)={"gateway":\(Self.quote(gateway)),"appInfo":\(appInfoJson)};
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
