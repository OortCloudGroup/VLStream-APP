package com.oort.vlstream;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.method.LinkMovementMethod;
import android.text.style.ClickableSpan;
import android.text.style.ForegroundColorSpan;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

/**
 * 首启隐私政策同意页（华为应用市场审核要求）。
 *
 * <p>作为 Launcher Activity：用户同意前不创建 WebView、不加载任何 H5 页面内容，
 * 与 HarmonyOS 壳 PrivacyConsentDialog 的行为保持一致。同意状态持久化到
 * SharedPreferences，只有已同意才进入 {@link MainActivity}。
 *
 * <p>协议链接通过系统浏览器打开，用户可完整阅读后再决定是否同意。
 */
public class PrivacyConsentActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "vlstream_privacy";
    private static final String KEY_AGREED = "privacy_agreed";
    private static final String PRIVACY_POLICY_URL = "https://oortcloudsmart.com/privacypolicy_vlstream.html";

    /** 是否已同意隐私政策（供 MainActivity 做外部启动兜底校验）。 */
    public static boolean isAgreed(Context context) {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .getBoolean(KEY_AGREED, false);
    }

    /** 跳转到隐私同意页（供 MainActivity 兜底调用）。 */
    public static void launch(Context context) {
        Intent intent = new Intent(context, PrivacyConsentActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        context.startActivity(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 已同意则直接进主界面（如从同意页跳转后系统重建等情况）
        if (isAgreed(this)) {
            launchMain();
            return;
        }

        setContentView(R.layout.activity_privacy_consent);
        setupStatusBar();
        setupPrivacyText();

        Button disagreeButton = findViewById(R.id.btn_privacy_disagree);
        disagreeButton.setOnClickListener(v -> onDisagree());

        Button agreeButton = findViewById(R.id.btn_privacy_agree);
        agreeButton.setOnClickListener(v -> onAgree());
    }

    /** 白底页面配深色状态栏图标，避免透明状态下图标不可见。 */
    private void setupStatusBar() {
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(Color.WHITE);
        getWindow().setNavigationBarColor(Color.WHITE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            View decor = getWindow().getDecorView();
            decor.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }
    }

    /** 文案中《用户协议和隐私政策》可点击跳转系统浏览器。 */
    private void setupPrivacyText() {
        String linkText = "《用户协议和隐私政策》";
        String fullText = "感谢您使用VLStream。在您开始使用本应用前，请仔细阅读并充分理解"
                + linkText
                + "的全部内容。为了向您提供设备管理、实时视频预览与录像回放等服务，"
                + "我们将在您使用过程中收集和处理必要的设备信息、音视频数据等信息。"
                + "未经您的同意，我们不会收集或使用上述信息。\n\n"
                + "如您同意以上协议内容，请点击\"同意并继续\"开始使用本应用。";

        SpannableString spannable = new SpannableString(fullText);
        int start = fullText.indexOf(linkText);
        int end = start + linkText.length();
        if (start >= 0) {
            spannable.setSpan(new ForegroundColorSpan(Color.parseColor("#2F69F8")),
                    start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
            spannable.setSpan(new ClickableSpan() {
                @Override
                public void onClick(View widget) {
                    openPrivacyPolicy();
                }
            }, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        }

        TextView contentText = findViewById(R.id.tv_privacy_content);
        contentText.setText(spannable);
        contentText.setMovementMethod(LinkMovementMethod.getInstance());
        // 去掉点击链接时的默认高亮底色
        contentText.setHighlightColor(Color.TRANSPARENT);
    }

    private void openPrivacyPolicy() {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(PRIVACY_POLICY_URL));
            startActivity(intent);
        } catch (Exception ignored) {
            // 设备未安装浏览器时忽略，用户仍可看到协议标题与说明
        }
    }

    private void onDisagree() {
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
                .putBoolean(KEY_AGREED, false).apply();
        // 不同意则退出应用（关闭整个任务栈，避免残留主界面）
        finishAffinity();
    }

    private void onAgree() {
        getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
                .putBoolean(KEY_AGREED, true).apply();
        launchMain();
    }

    private void launchMain() {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(intent);
        finish();
    }
}
