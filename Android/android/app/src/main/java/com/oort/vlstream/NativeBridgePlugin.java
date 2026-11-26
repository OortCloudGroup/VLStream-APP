package com.oort.vlstream;

import android.app.Activity;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.text.TextUtils;
import android.util.Base64;
import android.view.Window;
import android.webkit.WebView;

import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Iterator;

/**
 * VLStreamCloud 自研业务 Plugin。
 * <p>
 * 提供 H5 旧桥接约定里「非通用」、无现成 Capacitor 官方插件可替代的能力：
 * <ul>
 *   <li>{@link #getGateway} —— 返回后端网关地址。</li>
 *   <li>{@link #getAppInfo} —— 返回应用信息（包名/appId/secret/版本）。</li>
 *   <li>{@link #tokenOverdue} —— 清 H5 会话并 reload 重登。</li>
 *   <li>{@link #setStatusBar} —— 动态设置状态栏图标明暗（H5 按页面内容联动；背景在
 *       edge-to-edge 壳下恒为透明，由 H5 顶部界面透出）。</li>
 *   <li>{@link #setImmersiveMode} —— 全屏视频沉浸式：隐藏/恢复系统状态栏与导航栏。</li>
 * </ul>
 * 通用能力（拍照/相册、退出 App、定位）由官方插件提供：
 * @capacitor/camera、@capacitor/app、@capacitor/geolocation。
 * <p>
 * 此外，{@link #load()} 通过 {@code WebViewCompat.addDocumentStartJavaScript}
 * 在「document start」时机注入同步静态变量 {@code window.__VL_STATIC__}
 * （vlEnv / gateway / appInfo）、运行环境标志 {@code window.global.is_native_shell=true}，
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

    /** Whether an immersive fullscreen video is currently active (set by setImmersiveMode) */
    private boolean immersiveActive = false;

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
        // 只下发环境名，各服务域名由 H5 的预设表决定；
        // DEFAULT_GATEWAY 仅在现场部署需要覆盖预设时才填，留空表示不覆盖。
        o.put("vlEnv", AppConfig.getVlEnv());
        String gateway = AppConfig.getGateway();
        if (gateway != null && !gateway.isEmpty()) {
            o.put("gateway", gateway);
        }
        o.put("appInfo", appInfoObject());
        return o.toString();
    }

    private JSObject appInfoObject() {
        JSObject info = new JSObject();
        info.put("apppackage", getContext().getPackageName());
        info.put("app_id", "747aa0fa18d047c8b526e242142e0a6c");
        info.put("app_secret", "3a97f4f65b204a3a96071746fa42936a");
        info.put("applabel", "VLStreamCloud");
        info.put("version", appVersionName());
        return info;
    }

    /** 安装包真实版本号（build.gradle versionName），保证 H5「关于」页与应用版本一致。 */
    private String appVersionName() {
        try {
            PackageInfo pi = getContext().getPackageManager()
                    .getPackageInfo(getContext().getPackageName(), 0);
            if (pi.versionName != null && !pi.versionName.isEmpty()) return pi.versionName;
        } catch (Exception ignore) {
            // fall through to the default
        }
        return "1.0.0";
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

    /**
     * 原生 multipart 文件上传：绕开 WebView CORS。后端网关不支持 OPTIONS 预检
     * （返回 405 且无 CORS 头），WebView 内 XHR 带 accessToken/appId 等自定义
     * header 会被预检拦死（http_status=0）。原生直传与旧 cordova-plugin-file-transfer
     * 行为一致。
     * 参数：serverUrl / fileKey / fileName / headers / params，
     * 文件内容二选一：base64（dataURL 或裸 base64）或 filePath（webPath/file 路径）。
     * resolve：{ status, body }；失败 reject code=3（对齐 FileTransferError）。
     */
    @PluginMethod
    public void uploadFile(PluginCall call) {
        final String serverUrl = call.getString("serverUrl");
        final String fileKey = orDefault(call.getString("fileKey"), "file");
        final String fileName = orDefault(call.getString("fileName"), "file");
        final JSObject headers = call.getObject("headers");
        final JSObject params = call.getObject("params");

        byte[] fileData = null;
        String base64 = call.getString("base64");
        if (!TextUtils.isEmpty(base64)) {
            try {
                String b64 = base64.contains(",") ? base64.substring(base64.indexOf(',') + 1) : base64;
                fileData = Base64.decode(b64, Base64.DEFAULT);
            } catch (Throwable t) {
                fileData = null;
            }
        }
        if ((fileData == null || fileData.length == 0) && !TextUtils.isEmpty(call.getString("filePath"))) {
            fileData = readWebPathFile(call.getString("filePath"));
        }

        if (TextUtils.isEmpty(serverUrl)) {
            call.reject("uploadFile: invalid serverUrl");
            return;
        }
        final byte[] data = fileData;
        if (data == null || data.length == 0) {
            call.reject("uploadFile: file content unavailable (base64/filePath missing or unreadable)");
            return;
        }

        final String urlStr = serverUrl;
        new Thread(() -> {
            String boundary = "vlupload" + System.currentTimeMillis();
            HttpURLConnection conn = null;
            try {
                ByteArrayOutputStream buf = new ByteArrayOutputStream();
                if (params != null) {
                    Iterator<String> keys = params.keys();
                    while (keys.hasNext()) {
                        String k = keys.next();
                        buf.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
                        buf.write(("Content-Disposition: form-data; name=\"" + k + "\"\r\n\r\n").getBytes(StandardCharsets.UTF_8));
                        buf.write((params.optString(k, "") + "\r\n").getBytes(StandardCharsets.UTF_8));
                    }
                }
                buf.write(("--" + boundary + "\r\n").getBytes(StandardCharsets.UTF_8));
                buf.write(("Content-Disposition: form-data; name=\"" + fileKey + "\"; filename=\"" + fileName + "\"\r\n").getBytes(StandardCharsets.UTF_8));
                buf.write(("Content-Type: " + mimeFor(fileName) + "\r\n\r\n").getBytes(StandardCharsets.UTF_8));
                buf.write(data);
                buf.write(("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8));
                byte[] body = buf.toByteArray();

                URL url = new URL(urlStr);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(60000);
                conn.setDoOutput(true);
                conn.setUseCaches(false);
                conn.setFixedLengthStreamingMode(body.length);
                conn.setRequestProperty("Content-Type", "multipart/form-data; boundary=" + boundary);
                if (headers != null) {
                    Iterator<String> keys = headers.keys();
                    while (keys.hasNext()) {
                        String k = keys.next();
                        conn.setRequestProperty(k, headers.optString(k, ""));
                    }
                }
                try (OutputStream os = conn.getOutputStream()) {
                    os.write(body);
                    os.flush();
                }
                int status = conn.getResponseCode();
                InputStream is = (status >= 200 && status < 300) ? conn.getInputStream() : conn.getErrorStream();
                ByteArrayOutputStream resp = new ByteArrayOutputStream();
                if (is != null) {
                    byte[] chunk = new byte[8192];
                    int n;
                    while ((n = is.read(chunk)) > 0) resp.write(chunk, 0, n);
                    try { is.close(); } catch (Throwable ignore) {}
                }
                JSObject ret = new JSObject();
                ret.put("status", status);
                ret.put("body", new String(resp.toByteArray(), StandardCharsets.UTF_8));
                call.resolve(ret);
            } catch (Throwable t) {
                call.reject("uploadFile: " + (t.getMessage() == null ? t.getClass().getSimpleName() : t.getMessage()), "3");
            } finally {
                if (conn != null) conn.disconnect();
            }
        }).start();
    }

    private static String orDefault(String v, String fallback) {
        return TextUtils.isEmpty(v) ? fallback : v;
    }

    /** 把 takePhoto 的 webPath（https://localhost/_capacitor_file_/… 或 file://…）转为 POSIX 路径并读取。 */
    private static byte[] readWebPathFile(String webPath) {
        try {
            String path = webPath;
            int idx = path.indexOf("_capacitor_file_");
            if (idx >= 0) {
                path = path.substring(idx + "_capacitor_file_".length());
            }
            if (path.startsWith("file://")) {
                path = path.substring("file://".length());
            }
            String decoded = URLDecoder.decode(path, "UTF-8");
            File f = new File(decoded);
            if (!f.exists() || !f.isFile()) return null;
            FileInputStream fis = new FileInputStream(f);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] chunk = new byte[8192];
            int n;
            while ((n = fis.read(chunk)) > 0) out.write(chunk, 0, n);
            fis.close();
            return out.toByteArray();
        } catch (Throwable t) {
            return null;
        }
    }

    /** 按文件名后缀给 Content-Type（覆盖业务常用类型，其余 octet-stream）。 */
    private static String mimeFor(String fileName) {
        String lower = fileName == null ? "" : fileName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".mp4")) return "video/mp4";
        if (lower.endsWith(".pdf")) return "application/pdf";
        return "application/octet-stream";
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
        evalJs(
                "javascript:(function(){try{"
                + "sessionStorage.removeItem('token');"
                + "sessionStorage.removeItem('tempObj');"
                + "sessionStorage.removeItem('tenantId');"
                + "sessionStorage.removeItem('autoLogin');"
                + "}catch(e){}"
                + "window.location.hash='';"
                + "location.replace(location.href.split('#')[0]);"
                + "})();");
        call.resolve();
    }

    /**
     * 动态设置状态栏图标明暗（前景色），使图标与紧邻其下的 H5 内容对比度一致。
     * 参数：color（背景，仅为兼容旧 H5 调用保留，Android 壳已忽略）、
     * contentColor（图标/文字，默认 #000000）。
     * <p>
     * 本壳为 edge-to-edge 沉浸式：WebView 延伸到状态栏下方，状态栏背景由 H5
     * 顶部界面透出，因此 H5 传入的背景色不再染到状态栏——否则在 API&lt;35
     * （如 Mate60 的 HarmonyOS/EMUI）上会把状态栏染成页面顶色，形成一条与
     * API35+（系统强制忽略 {@code setStatusBarColor}，天然沉浸）不一致的纯色硬边。
     * 这里仅保留图标明暗（{@code setAppearanceLightStatusBars}）联动，并把状态栏
     * 背景重置为与 {@link MainActivity} 初始值一致的近透明黑（防止 EMUI 对显式
     * 透明铺主题色保护底）。
     */
    @PluginMethod
    public void setStatusBar(PluginCall call) {
        String contentColor = call.getString("contentColor", "#000000");
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("no-activity");
            return;
        }
        Window window = activity.getWindow();
        // setAppearanceLightStatusBars(true) = 浅色状态栏 + 深色图标：#000000 图标 -> true，#FFFFFF 图标 -> false。
        boolean darkIcons = !isLightColor(contentColor);
        // Window/View API 必须在 UI 线程调用（Capacitor 插件方法默认运行在 bridge 线程）。
        activity.runOnUiThread(() -> {
            // Edge-to-edge：背景固定近透明黑（H5 内容透出），各 API 版本视觉统一。
            window.setStatusBarColor(0x01000000);
            WindowInsetsControllerCompat controller =
                    new WindowInsetsControllerCompat(window, window.getDecorView());
            controller.setAppearanceLightStatusBars(darkIcons);
            call.resolve();
        });
    }

    /**
     * 全屏视频沉浸式开关。
     * enabled=true：隐藏系统状态栏/导航栏（滑动手势可短暂呼出）；
     * enabled=false：恢复系统栏显示。
     */
    @PluginMethod
    public void setImmersiveMode(PluginCall call) {
        Boolean enabledObj = call.getBoolean("enabled", false);
        boolean enabled = enabledObj != null && enabledObj;
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("no-activity");
            return;
        }
        Window window = activity.getWindow();
        // 系统栏显隐同样依赖 View 层，须在 UI 线程执行。
        activity.runOnUiThread(() -> {
            WindowInsetsControllerCompat controller =
                    new WindowInsetsControllerCompat(window, window.getDecorView());
            controller.setSystemBarsBehavior(
                    WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            if (enabled) {
                controller.hide(WindowInsetsCompat.Type.systemBars());
            } else {
                controller.show(WindowInsetsCompat.Type.systemBars());
            }
            call.resolve();
        });
        immersiveActive = enabled;
    }

    /** Whether an immersive fullscreen video is currently active. */
    public boolean isImmersiveActive() {
        return immersiveActive;
    }

    /**
     * 返回手势落在沉浸式全屏视频上时：恢复系统栏，并通知 H5 退出全屏
     * （document.exitFullscreen + vl-exit-fullscreen 事件，覆盖 API 全屏与 CSS 兜底全屏）。
     */
    public void exitImmersiveAndNotifyH5() {
        immersiveActive = false;
        Activity activity = getActivity();
        if (activity != null) {
            Window window = activity.getWindow();
            activity.runOnUiThread(() -> {
                WindowInsetsControllerCompat controller =
                        new WindowInsetsControllerCompat(window, window.getDecorView());
                controller.show(WindowInsetsCompat.Type.systemBars());
            });
        }
        evalJs(
                "javascript:(function(){try{"
                + "if(document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen();}"
                + "document.dispatchEvent(new Event(\"vl-exit-fullscreen\"));"
                + "}catch(e){}})();");
    }

    /**
     * 主页双击返回退出提示：仅派发 vl-exit-hint 事件，toast 文案由 H5 按当前语言渲染
     * （原生不持有文案，保证中英文体验一致）。
     */
    public void notifyExitHint() {
        evalJs(
                "javascript:(function(){try{"
                + "document.dispatchEvent(new Event(\"vl-exit-hint\"));"
                + "}catch(e){}})();");
    }

    /** 在 WebView 里执行 JS（插件方法均在主线程被调用，可直接 evaluateJavascript）。 */
    private void evalJs(String script) {
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null) {
            webView.evaluateJavascript(script, null);
        }
    }

    /** 解析 #RRGGBB / #AARRGGBB 颜色，非法输入返回兜底色。 */
    private static int parseColorSafely(String hex, int fallback) {
        try {
            return Color.parseColor(hex);
        } catch (Throwable t) {
            return fallback;
        }
    }

    /** 相对亮度（0..1）：>0.5 视为浅色。 */
    private static boolean isLightColor(String hex) {
        int color = parseColorSafely(hex, Color.BLACK);
        double luminance = (0.299 * Color.red(color)
                + 0.587 * Color.green(color)
                + 0.114 * Color.blue(color)) / 255.0;
        return luminance > 0.5;
    }
}

