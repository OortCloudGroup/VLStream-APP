package com.oort.vlstream;

import android.os.Bundle;
import android.os.SystemClock;
import android.view.View;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {

    /** 距上次主页返回键按下时间（双击退后台判定窗口 2s） */
    private long lastBackPressTime = 0L;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 隐私合规兜底：正常启动路径由 PrivacyConsentActivity(Launcher) 拦截，
        // 但若外部经 intent 直接拉起 MainActivity（如 deep link / adb），此处补一道校验，
        // 未同意前不加载任何 H5 内容，转回隐私同意页。
        if (!PrivacyConsentActivity.isAgreed(this)) {
            PrivacyConsentActivity.launch(this);
            finish();
            return;
        }
        // 自研业务 plugin 必须在 super.onCreate 之前注册
        registerPlugin(NativeBridgePlugin.class);
        super.onCreate(savedInstanceState);
        // 沉浸式 edge-to-edge：让 WebView 内容延伸到状态栏下方，
        // 状态栏背景由 H5 顶部界面透出（配合 window.__safeAreaTop 留白）。
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        // 显式接管系统栏背景并置透明：API<35（如 Mate60 的 HarmonyOS/EMUI）上，
        // 若窗口未声明 FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS，系统会用主题 colorPrimary
        // 给状态栏铺一层底色，盖住透出的 H5 顶部渐变（表现为状态栏区域一块纯蓝，
        // 与 API35+ 的「透明+页面渐变透出」不一致）。声明接管并置透明后，
        // 状态栏/导航栏在各版本上均为全透明，视觉统一为真沉浸式。
        getWindow().addFlags(android.view.WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        // 注意不能设为完全透明（0x00000000）：EMUI/HarmonyOS 对「显式透明」的状态栏
        // 会由 SystemUI 自行铺一层主题 colorPrimary 保护底色（表现为工作台等未调用
        // H5 setStatusBar 联动的页面，状态栏区域一条纯蓝硬边，与 API35+ 真沉浸不一致；
        // 无刘海的模拟器/原生 Android 复现不了）。用 alpha=0x01 的黑：视觉上等同
        // 透明（0.4% 不透明度不可感知），但 EMUI 认为「应用已指定颜色」而不再铺保护色；
        // H5 的 NativeBridge.setStatusBar 联动仍可随时覆盖此值。
        getWindow().setStatusBarColor(0x01000000);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
        // 声明内容延伸进刘海/挖孔区：EMUI 对「默认刘海模式 + 透明状态栏」的窗口
        // 会在挖孔/状态栏区域铺一层主题 colorPrimary 保护底色（表现为状态栏一条
        // 纯蓝，盖住透出的 H5 渐变；无刘海设备与 API35+ 复现不了）。SHORT_EDGES
        // 是沉浸式的标准要求，声明后 EMUI 不再铺保护色。
        getWindow().getAttributes().layoutInDisplayCutoutMode =
                android.view.WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        // Capacitor 内置 SystemBars 插件在「旧 WebView(<140) + API35+」下会兜底给
        // WebView 容器加 padding-top=状态栏高度，导致 WebView 被压到状态栏下方，
        // 顶部露出白色窗口背景（模拟器/低版本 WebView 设备可见，与真机表现不一致）。
        // 本应用 H5 统一用 NativeBridge 注入的 window.__safeAreaTop 自行留白，
        // 不依赖 WebView 版本与 env(safe-area-inset)，因此这里无条件接管 insets：
        // 顶部不内缩，仅保留键盘弹出时的底部避让。
        if (getBridge() != null && getBridge().getWebView() != null) {
            View contentView = (View) getBridge().getWebView().getParent();
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
                Insets imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime());
                boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());
                v.setPadding(0, 0, 0, keyboardVisible ? imeInsets.bottom : 0);
                return insets;
            });
        }
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
