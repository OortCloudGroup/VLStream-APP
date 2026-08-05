package com.oort.vlstream.app;

import android.os.Bundle;
import android.webkit.WebView;

import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
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
     * 系统返回键处理：
     * - WebView 有历史页时（已 push 过路由），先回退一页；
     * - 回到历史栈底时，直接退出 App（与 H5 导航栏「退出」按钮的 appExit 效果一致），
     *   避免用户连按返回无反应。
     *
     * 不依赖 @capacitor/app 默认的 backButton 监听——那套会把返回事件派发给 JS，
     * H5 未处理时默认行为是「不响应」，导致用户按返回键 App 不退出。
     */
    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        WebView webView = getBridge() != null ? getBridge().getWebView() : null;
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        // 栈底：退出 App
        finishAffinity();
    }
}
