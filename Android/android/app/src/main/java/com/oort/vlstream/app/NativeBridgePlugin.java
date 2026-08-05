package com.oort.vlstream.app;

import android.webkit.WebView;

import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;

/**
 * VLStreamCloud 自研业务 Plugin。
 * <p>
 * 提供 H5 旧桥接约定里「非通用」、无现成 Capacitor 官方插件可替代的能力：
 * <ul>
 *   <li>{@link #getGateway} —— 返回后端网关地址。</li>
 *   <li>{@link #getAppInfo} —— 返回应用信息（包名/appId/secret/版本）。</li>
 *   <li>{@link #tokenOverdue} —— 清 H5 会话并 reload 重登。</li>
 * </ul>
 * 通用能力（拍照/相册、退出 App、定位）由官方插件提供：
 * @capacitor/camera、@capacitor/app、@capacitor/geolocation。
 * <p>
 * 此外，{@link #load()} 通过 {@code WebViewCompat.addDocumentStartJavaScript}
 * 在「document start」时机注入同步静态变量 {@code window.__VL_STATIC__}
 * （gateway / appInfo）、运行环境标志 {@code window.global.is_native_shell=true}，
 * 以及沉浸式状态栏安全区高度 {@code window.__safeAreaTop}（CSS px），
 * 保证它们在任何业务脚本（index.html 的 &lt;script&gt;）之前就绪——从而
 * H5 侧 androidFunUtils.js 能用「同步调用」拿到网关（App.vue 不必改成 async），
 * LoginDev / workbench 能精确留出状态栏空间（与旧 AgentWeb 壳一致）。
 */
@CapacitorPlugin(name = "NativeBridge")
public class NativeBridgePlugin extends Plugin {

    /** JS 全局对象名：window.__VL_STATIC__ */
    private static final String JS_STATIC_VAR = "__VL_STATIC__";
    /** Capacitor 默认 androidScheme=https，应用 origin 为 https://localhost */
    private static final String LOCAL_ORIGIN = "https://localhost";

    @Override
    public void load() {
        super.load();
        registerDocumentStartInjection();
    }

    private String bootScript() {
        return "(function(){try{"
                + "window.global=window.global||{};"
                + "window.global.is_native_shell=true;"
                + "window.global.is_cordova=false;"
                + "window.global.is_phone=true;"
                + "window.global.is_harmony=false;"
                + "window." + JS_STATIC_VAR + "=" + buildStaticJson() + ";"
                + "window.__safeAreaTop=" + getStatusBarHeightCss() + ";"
                + "}catch(e){console.error('[NativeBridgePlugin] inject failed',e);}})();";
    }

    /**
     * 用 androidx.webkit 的 document-start 通道注入，保证脚本在每次页面加载的
     * 文档开始阶段（早于 index.html 的业务脚本）执行。
     * 回退到 Bridge.eval（仅对已加载页面有效，reload 后仍生效）。
     */
    private void registerDocumentStartInjection() {
        if (getBridge() == null) return;
        WebView webView = getBridge().getWebView();
        if (webView == null) return;
        String script = bootScript();
        try {
            if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
                WebViewCompat.addDocumentStartJavaScript(
                        webView, script, Collections.singleton(LOCAL_ORIGIN));
                return;
            }
        } catch (Throwable t) {
            // 降级到 eval
        }
        getBridge().eval(script, null);
    }

    /**
     * 取状态栏高度并换算为 CSS px（H5 视口坐标系）。
     * WebView 的 layout viewport 与 CSS px 一致，这里按 density 换算。
     * 与旧 AgentWeb 壳 BaseAgentWebActivity#getStatusBarHeightCss 对齐。
     */
    private int getStatusBarHeightCss() {
        try {
            int resId = getContext().getResources().getIdentifier("status_bar_height", "dimen", "android");
            if (resId > 0) {
                float px = getContext().getResources().getDimension(resId); // 物理像素
                float density = getContext().getResources().getDisplayMetrics().density; // dp→px
                return Math.round(px / density);
            }
        } catch (Throwable ignore) {
        }
        return 0;
    }

    private String buildStaticJson() {
        JSObject o = new JSObject();
        o.put("gateway", AppConfig.getGateway());
        o.put("appInfo", appInfoObject());
        return o.toString();
    }

    private JSObject appInfoObject() {
        JSObject info = new JSObject();
        info.put("apppackage", getContext().getPackageName());
        info.put("app_id", "747aa0fa18d047c8b526e242142e0a6c");
        info.put("app_secret", "3a97f4f65b204a3a96071746fa42936a");
        info.put("applabel", "VLStreamCloud");
        info.put("version", "1.0.0");
        return info;
    }

    /**
     * 返回网关地址。H5 侧 androidFunUtils.getGateway() 已在启动期同步拿到
     * （window.__VL_STATIC__.gateway），该方法作为兜底/显式查询入口。
     */
    @PluginMethod
    public void getGateway(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("gateway", AppConfig.getGateway());
        call.resolve(ret);
    }

    /** 返回应用信息。 */
    @PluginMethod
    public void getAppInfo(PluginCall call) {
        call.resolve(appInfoObject());
    }

    /**
     * Token 失效：清掉 H5 sessionStorage 里的 token/tempObj/tenantId/autoLogin，
     * 复位路由并 reload。
     */
    @PluginMethod
    public void tokenOverdue(PluginCall call) {
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.evaluateJavascript(
                    "javascript:(function(){try{"
                    + "sessionStorage.removeItem('token');"
                    + "sessionStorage.removeItem('tempObj');"
                    + "sessionStorage.removeItem('tenantId');"
                    + "sessionStorage.removeItem('autoLogin');"
                    + "}catch(e){}"
                    + "window.location.hash='';"
                    + "location.replace(location.href.split('#')[0]);"
                    + "})();",
                    null);
        }
        call.resolve();
    }
}

