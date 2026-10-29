package com.oort.vlstream.app;

import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {

    /** 距上次主页返回键按下时间（双击退后台判定窗口 2s） */
    private long lastBackPressTime = 0L;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 自研业务 plugin 必须在 super.onCreate 之前注册
        registerPlugin(NativeBridgePlugin.class);
        super.onCreate(savedInstanceState);
        // 沉浸式 edge-to-edge：让 WebView 内容延伸到状态栏下方，
        // 状态栏背景由 H5 顶部界面透出（配合 window.__safeAreaTop 留白）。
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    }

    /**
     * 系统返回键处理（与鸿蒙壳 onBackPress 三层语义对齐）：
     * <ol>
     *   <li>沉浸式全屏视频中：先恢复系统栏并通知 H5 退出全屏；</li>
     *   <li>WebView 有历史页时（已 push 过路由）：回退一页；</li>
     *   <li>历史栈底：2s 内再按一次退到后台；首次按下派发 vl-exit-hint，
     *       由 H5 按当前语言弹「再按一次退出」toast（原生不持有文案）。</li>
     * </ol>
     * 不依赖 @capacitor/app 默认的 backButton 监听——那套会把返回事件派发给 JS，
     * H5 未处理时默认行为是「不响应」，导致用户按返回键 App 不退出。
     */
    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        NativeBridgePlugin plugin = getNativeBridge();
        // 1. Immersive fullscreen video: back first leaves fullscreen
        if (plugin != null && plugin.isImmersiveActive()) {
            plugin.exitImmersiveAndNotifyH5();
            return;
        }
        // 2. Forward the back gesture to the H5 (goes back one page when history exists)
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        // 3. Stack bottom: double-press to background, first press shows the exit hint
        long now = SystemClock.elapsedRealtime();
        if (now - lastBackPressTime < 2000) {
            lastBackPressTime = 0L;
            moveTaskToBack(true);
        } else {
            lastBackPressTime = now;
            if (plugin != null) {
                plugin.notifyExitHint();
            }
        }
    }

    /** 取自研 NativeBridge 插件实例（注册于 onCreate，供返回键三层逻辑查询）。 */
    private NativeBridgePlugin getNativeBridge() {
        if (getBridge() == null) return null;
        PluginHandle handle = getBridge().getPlugin("NativeBridge");
        if (handle == null) return null;
        Object instance = handle.getInstance();
        return instance instanceof NativeBridgePlugin ? (NativeBridgePlugin) instance : null;
    }
}
