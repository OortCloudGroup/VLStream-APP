# VLStream App 沉浸式状态栏（Edge-to-Edge）适配问题总结

> 整理日期：2026-11-02
> 适用范围：Android 壳（Capacitor 8.5.0）、iOS 壳（Capacitor 8.5.0 / SPM）、H5（vue3-h5，Vant）
> 验证设备：华为 Mate60（HarmonyOS / API 31）、Android 16 模拟器（Pixel_36_phone，API 36.1，WebView 134）、Android 17 模拟器（Pixel_17，API 37，WebView 145）

---

## 一、整体适配机制（背景知识）

本轮拉取远端代码后，Android 壳改为 **edge-to-edge 沉浸式设计**：

```
┌─────────────────────────────┐
│ 状态栏（透明，系统图标）        │ ← WebView 内容延伸到此（页面渐变背景透出）
├─────────────────────────────┤
│ WebView（全屏，含状态栏区域）   │ ← H5 用安全区高度自行留白
│ ...页面内容...                │
└─────────────────────────────┘
```

链路分工：

| 层 | 职责 | 关键文件 |
|---|---|---|
| Android 原生 | `WindowCompat.setDecorFitsSystemWindows(window, false)` 开启沉浸式；document-start 注入 `window.__safeAreaTop`（状态栏高度，CSS px）及 `__VL_STATIC__`、`is_native_shell` | `MainActivity.java`、`NativeBridgePlugin.java` |
| H5 工具层 | 启动时把 `__safeAreaTop` 写入 CSS 变量 `--vl-safe-top`（浏览器环境为 0） | `vue3-h5/src/utils/shellStatusBar.ts`（`syncShellSafeAreaCssVar()`）、`App.vue` |
| H5 页面层 | 页面头部 padding 写成 `calc(28px + var(--vl-safe-top, 0px))` | 各 tab 页 `.vue` |
| Capacitor 框架 | 内置 `SystemBars` 插件处理 insets：WebView ≥ 140 且页面有 `viewport-fit=cover` 时透传（内容全屏），否则在 API 35+ 兜底给容器加 `padding-top`（内容内缩） | `@capacitor/android` 内置 `plugin/SystemBars.java` |

> 由此引出下面的 4 个适配问题：1 个启动崩溃、1 个 H5 安全区缺失、1 个模拟器白条、1 个 iOS API 不兼容。

---

## 二、问题 1：Mate60 上启动即闪退（CalledFromWrongThreadException）

### 现象
- 安装新包后应用**启动即闪退**，桌面一闪而过；`logcat -b crash` 抓到：

```
android.view.ViewRootImpl$CalledFromWrongThreadException:
  Only the original thread that created a view hierarchy can touch its views.
  at com.oort.vlstream.NativeBridgePlugin.setStatusBar(NativeBridgePlugin.java:192)
```

### 根因
- 远端新增的 `NativeBridgePlugin.setStatusBar()` 在**插件 bridge 线程**直接调用了 `window.setStatusBarColor()`、`WindowInsetsControllerCompat.setAppearanceLightStatusBars()` 等只能 **UI 线程**调用的 Window API。
- Capacitor 插件方法默认跑在 bridge 线程，必须切到 UI 线程。
- 同名逻辑 iOS 侧有 `DispatchQueue.main.async` 包裹，Android 侧漏了。

### 修复
把三处直接操作 Window 的方法全部包进 `runOnUiThread`（已在 UI 线程时同步执行，无副作用）：
- `setStatusBar()` —— `window.setStatusBarColor()` / `setAppearanceLightStatusBars()`
- `setImmersiveMode()` —— 隐藏/恢复系统栏
- `exitImmersiveAndNotifyH5()` —— 恢复系统栏

### 涉及文件
- `Android/android/app/src/main/java/com/oort/vlstream/NativeBridgePlugin.java`

### 经验
> **Capacitor Android 插件方法里凡是碰 Window/View 的调用，一律 `runOnUiThread`。** Code review 时重点检查 `getWindow()` 的调用线程。

---

## 三、问题 2：视频 / 事件 / 我的 三个 tab 页顶部被状态栏遮挡

### 现象
- Mate60 上，工作台页正常，但**视频、事件、我的**三个 tab 页顶部标题被状态栏（时间/电量）盖住。

### 根因
- edge-to-edge 下 WebView 延伸到状态栏下方，H5 必须用 `window.__safeAreaTop` 自行留白。
- 老页面里只有 `workbench.vue`、`LoginDev.vue` 做过适配；三个 tab 页头部还是写死的 `padding-top: 28px`。

### 修复（统一走 CSS 变量，三端壳通用）
1. `src/utils/shellStatusBar.ts` 新增 `syncShellSafeAreaCssVar()`：
   - 原生壳内取 `window.__safeAreaTop`，浏览器取 0；
   - 写入 `document.documentElement` 的 CSS 变量 `--vl-safe-top`；
   - 在 `App.vue` setup 中调用一次。
2. 三个页面头部 padding 改为 `calc(28px + var(--vl-safe-top, 0px))`：

| 页面 | 修改的样式类 |
|---|---|
| `video.vue` | `.top-bar` |
| `event.vue` | `.event-header` |
| `my.vue` | `.my-header` |

3. 浏览器/PC 端变量为 0，显示效果不变；鸿蒙/iOS 壳走同一注入约定，无需另行修改。

### 涉及文件
- `vue3-h5/src/utils/shellStatusBar.ts`
- `vue3-h5/src/pages/VLStreamCloud/App.vue`
- `vue3-h5/src/pages/VLStreamCloud/page/index/{video,event,my}.vue`

### 经验
> **新增页面一律使用 `calc(基础间距 + var(--vl-safe-top, 0px))` 作为头部 top padding，禁止写死。** 原生壳注入的 `__safeAreaTop` 已在 document-start 就绪，不依赖 WebView 版本。

---

## 四、问题 3：模拟器上顶部出现白色条（Mate60 没有）

### 现象
- Android 16 / 17 模拟器上，页面最顶部（状态栏区域）有一条**纯白条**（含系统时间/电量图标），白条下面才是页面内容；Mate60 上没有。
- 像素级测量：模拟器 y=0~142px 全白（RGB 255,255,255），y=142 才开始页面渐变背景；Mate60 y=0 即页面背景色。
- `uiautomator dump` 关键证据：窗口全屏 `[0,0][1080,2424]`，但 **WebView 边界是 `[0,142][1080,2361]`** —— WebView 被内缩了。

### 根因（三层叠加）
1. Capacitor 8 内置 `SystemBars` 插件（`plugin/SystemBars.java` → `initWindowInsetsListener()`）的逻辑：
   - **透传分支**（内容全屏、insets 交给 H5 CSS 变量）：要求 `WebView 主版本 ≥ 140` **且** 页面 meta viewport 含 `viewport-fit=cover`；
   - **兜底分支**（API 35+）：不满足上述条件时，给 WebView 容器 `setPadding(top=状态栏insets高度)`，并把发给 WebView 的 insets 清零。
2. 我们的 H5 `index.html` 的 viewport **缺少 `viewport-fit=cover`**。
3. Android 16 模拟器的系统 WebView 是 **134（< 140）**，即使补了 cover 也走兜底分支；Android 17 的 WebView 145 补 cover 后即可透传。
4. 兜底内缩后，容器与状态栏之间露出的是主题 `windowBackground`（`AppTheme` 白色）——即白条。而 Mate60 是 API 31，`Build.VERSION.SDK_INT >= VANILLA_ICE_CREAM(35)` 不成立，**根本走不到 padding 分支**，所以真机没有白条。

### 修复（两处，双保险）
1. **H5 补 viewport**：`vue3-h5/index.html`
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
   ```
   → 新 WebView（≥140）设备走 Capacitor 透传分支（其行为：容器顶部 padding=0，仅键盘弹出时垫底部 IME 高度，并通过 `--safe-area-inset-*` CSS 变量注入安全区）。
2. **原生无条件接管 insets**：`MainActivity.onCreate` 在 `super.onCreate()` 之后重设 WebView 容器的 `OnApplyWindowInsetsListener`：
   ```java
   View contentView = (View) getBridge().getWebView().getParent();
   ViewCompat.setOnApplyWindowInsetsListener(contentView, (v, insets) -> {
       Insets imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime());
       boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());
       v.setPadding(0, 0, 0, keyboardVisible ? imeInsets.bottom : 0);
       return insets; // 不消费
   });
   ```
   → **顶部永不内缩**（H5 用 `__safeAreaTop` 自留白，不依赖 WebView 版本与 `env(safe-area-inset)`），同时保留键盘底部避让。这样即使 WebView < 140 也不会再内缩。
   > 前提已确认：H5 业务源码**没有使用** `env(safe-area-inset-*)`（这正是 Capacitor 对旧 WebView 消费 insets 的原因，见 chromium issue 40699457），接管是安全的。

### 验证
| 检查项 | Android 16（WebView 134） | Android 17（WebView 145） | Mate60 |
|---|---|---|---|
| WebView 边界 | `[0,0][1080,2424]` ✅ | `[0,0][1080,2424]` ✅ | 全屏 ✅ |
| 顶部 y=0 像素 | 页面渐变色 ✅ | 页面渐变色 ✅ | 页面渐变色 ✅ |
| 四个 tab 顶部无遮挡 | ✅ | ✅ | ✅ |
| 键盘弹出避让 | ✅（表单上移，按钮可见） | ✅ | ✅ |

### 经验
> - **Capacitor 8 的 SystemBars 对旧 WebView（<140）有"内缩兜底"**，会让 edge-to-edge 设计退化。若项目统一用自注入的 `__safeAreaTop` 留白，应在原生层接管 insets listener，不依赖 WebView 版本。
> - 排查这类问题的高效手段：`uiautomator dump` 看 WebView bounds 是否全屏；`adb exec-out screencap` 原始 RGBA + Python 逐像素分析顶部颜色；`adb forward tcp:9222 + CDP`（`/json`、`Runtime.evaluate`）读 `__safeAreaTop`、CSS 变量、路由与 localStorage。
> - 三端表现不一致时，先按「API 级别 × WebView 版本 × viewport meta」三个维度排查壳层行为差异，而不是先怀疑 H5。

---

## 五、问题 4（iOS）：`NativeBridgePlugin.swift` 编译失败（getBoolean 不存在）

### 现象
- `xcodebuild` 编译报错：`value of type 'CAPPluginCall' has no member 'getBoolean'`（`NativeBridgePlugin.swift:186`）。

### 根因
- 远端新代码用了 `call.getBoolean("enabled")`，而 Capacitor 8.5.0 Swift 侧 `CAPPluginCall` 的 API 是 **`getBool`**（`getBool(_:) -> Bool?` / `getBool(_:_:) -> Bool`）；`getBoolean` 只剩一个带默认值的 `@objc` 变体，单参调用不成立。
- 从 `Capacitor.xcframework` 的 `swiftinterface` 确认了正确签名。

### 修复
```swift
// 修改前
let enabled = call.getBoolean("enabled") ?? false
// 修改后
let enabled = call.getBool("enabled") ?? false
```

### 涉及文件
- `iOS/ios/App/App/NativeBridgePlugin.swift`

### 经验
> - iOS 侧同名 JS 逻辑（状态栏颜色/沉浸式）已有 `DispatchQueue.main.async` 包裹，线程模型正确，无需修改。
> - Capacitor Swift 插件 API 与 Android 侧命名不对称（Android `getBoolean` / Swift `getBool`），跨端移植代码时逐一核对。

---

## 六、三端一致性与验证矩阵

| 适配点 | Android 壳 | iOS 壳 | 鸿蒙壳 | 浏览器 |
|---|---|---|---|---|
| 内容延伸到状态栏下 | ✅ edge-to-edge | ✅ | ✅ 同约定 | N/A |
| 安全区高度注入 | `__safeAreaTop`（document-start） | 同约定 | 同约定 | `--vl-safe-top`=0 |
| H5 留白方式 | `calc(28px + var(--vl-safe-top))` | 同左 | 同左 | 同左（变量为 0） |
| 状态栏颜色联动 | `setStatusBar`（UI 线程） | `DispatchQueue.main` | — | N/A |
| 全屏视频沉浸式 | `setImmersiveMode` + 返回键退出 | 同约定 | — | fullscreen API |
| `viewport-fit=cover` | 已补（必需） | 建议保留 | 建议保留 | 无影响 |

---

## 七、遗留事项与建议

1. **未提交的改动**（功能已验证，建议尽快提交）：
   - `Android/.../NativeBridgePlugin.java`（UI 线程修复）
   - `Android/.../MainActivity.java`（insets 接管）
   - `iOS/.../NativeBridgePlugin.swift`（getBool）
   - `vue3-h5/index.html`（viewport-fit=cover）
   - `vue3-h5/src/utils/shellStatusBar.ts`、`App.vue`、三个 tab 页（安全区 CSS 变量）
   - stash 合并结果（`aboutPage.vue`、`my.vue`：隐私政策入口/注销账号 + 远端 i18n 合并）
   - 处理完可 `git stash drop` 清理原 stash。
2. **`Android/android/gradle.properties` 第 17 行硬编码 Windows JDK 路径**（`C:/Users/OORT/...`），macOS/CI 上必须用 `-Dorg.gradle.java.home=...` 覆盖才能编译，建议改为注释掉或按平台判断。
3. **登录后偶现 toast「没有访问权限，请联系管理员授权」**：来自登录后的某个权限接口报错，不影响登录与使用，建议排查服务端该账号/接口权限配置。
4. `vue3-h5/.npmrc` 曾指向本机失效代理 `127.0.0.1:53622`，已临时清空 proxy；npx 走代理仍可能失败，本地调用 Capacitor CLI 建议直接用 `./node_modules/.bin/cap`。
5. 国际源 `services.gradle.org` 走代理仅 ~17KB/s，Gradle 分发版建议用阿里/腾讯镜像预下载放入 `~/.gradle/wrapper/dists/gradle-8.14.3-all/<hash>/`。

---

## 八、追加问题：Mate60 工作台状态栏出现纯蓝色块（已解决）

> 2026-11-02 追加。前七章解决后，真机验证时发现 Mate60 工作台顶部仍是蓝色，
> 而 Android16/17 模拟器是沉浸式，本文记录完整定位过程与最终结论。

### 8.1 问题现象

- Mate60（HarmonyOS/EMUI，API 31）：登录后进入工作台，**顶部状态栏区域一条纯蓝色**，
  与下方「工作台」标题区的蓝色渐变连成一片，观感像一块蓝色色块「盖」在顶部。
- Android16（WebView 134）/ Android17（WebView 145）模拟器：同为工作台，状态栏是
  **浅蓝渐变沉浸式**（bg.png 顶部透出），两者一致。
- 登录页在 Mate60 上却又是透明的（正常），只有工作台异常——排除纯系统层问题。

### 8.2 排查过程（关键实验）

1. **第一轮修复（MainActivity）**：`setStatusBarColor(0x01000000)`（近透明黑）
   + `SHORT_EDGES` 刘海模式 + `FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS`。
   验证结果：**登录页修复**（状态栏透出浅色渐变），但工作台依旧蓝色。
   → 说明蓝色不（只）来自 EMUI 保护色。
2. **CDP 探测 DOM**：工作台顶部存在 `.top-bg` 元素（`top:-16px`，背景为
   `bg-5ed9eeb7.png` 渐变图）。
3. **对照实验（决定性）**：CDP `document.querySelector('.top-bg').style.visibility='hidden'`
   后截屏 —— **状态栏立刻变白**。证明蓝色就是 H5 页面自身的渐变图透出，
   属于沉浸式的正确表现。
4. **定位真正的差异来源**：`NativeBridgePlugin.setStatusBar` 原实现会把 H5 传入的
   `color`（工作台路由 afterEach 传 `#306AF8` 纯蓝）调 `window.setStatusBarColor()`
   染到状态栏。**API 35+ 强制 edge-to-edge，系统忽略该调用**，所以 16/17 模拟器
   看不到；**API 31 的 Mate60 仍然生效**，把本应透出渐变的状态栏染成了纯色蓝。

### 8.3 最终修复

`NativeBridgePlugin.setStatusBar` 改为「只管图标明暗，不管背景色」：

- 删除 `window.setStatusBarColor(background)`，固定为 `0x01000000`（与 MainActivity
  初始值一致，防 EMUI 对显式透明铺保护色）；
- 保留 `setAppearanceLightStatusBars(lightIcons)`（图标黑/白切换继续联动）；
- H5 侧 `shellStatusBar.ts` 的 `pushStatusBar/setRootStatusBar` 调用**无需改动**：
  参数仍传（鸿蒙壳等非沉浸壳仍依赖 color），Android 壳只是忽略背景色。

### 8.4 修复后验证（像素级）

`screencap` + PNG filter 还原采样（屏幕中线，相对高度 0.5%~7%）：

| 设备 | y=0.5% | y=3% | y=7% |
|---|---|---|---|
| Mate60 (API31) | RGB(157,185,251) | RGB(175,198,251) | RGB(200,214,253) |
| Android16 | RGB(162,189,252) | RGB(180,201,252) | RGB(204,217,253) |

差异 <10/255，**三端（Mate60/Android16/Android17）状态栏表现一致**，
均为 bg.png 浅蓝渐变透出的真沉浸式。

### 8.5 经验教训

1. **「蓝色」要区分两种来源**：EMUI 主题色保护底（系统层，隐藏 H5 元素不变）
   vs H5 顶部渐变透出（页面层，隐藏 `.top-bg` 即消失）。对照实验（隐藏元素）
   是区分二者的最快手段。
2. **`setStatusBarColor` 的跨版本语义已分裂**：API 35+ 忽略之（edge-to-edge 强制），
   API <35 仍生效。壳已改为沉浸式后，H5→原生的状态栏背景色联动必须在新旧版本上
   都收敛为「不染色」，否则低版本会出现纯色硬边。
3. 之前章节「隐藏 .top-bg 后蓝色仍在」的旧结论是在旧 APK 上测得的，修复后该现象
   不再成立——**排查结论要跟着代码版本走**，旧实验结论需在每次修改后重新验证。

---

## 九、追加问题：二级页面导航栏顶进状态栏（已解决）

> 2026-11-02 追加。第八章修复后，二级页面（NavHeaderBanner 型）暴露新问题。

### 9.1 问题现象

Mate60 上进入「关于」等二级页面：**标题「关于」和返回箭头顶进状态栏**，
与系统时间、电池图标重叠，深蓝导航区只剩状态栏一条的高度。

### 9.2 根因

`navHeaderBanner/index.vue` 的 `.nav_banner_container_nor` / `.nav_banner`
**固定 `height: 48px`**。旧壳（WebView 从状态栏下方开始）48px 全部可见；
edge-to-edge 后 WebView 从屏幕顶部开始，这 48px 的上半部分（状态栏高度，
Mate60 为 40px）被系统状态栏覆盖。该组件被 20+ 个二级页面引用
（关于/联系我们/版本/工单/事件详情/设备详情等），属全局性缺陷。

### 9.3 修复

`.nav_banner_container_nor` 高度加 safe-top，`.nav_banner` 加
`padding-top: var(--vl-safe-top)` + `box-sizing: border-box`：
深蓝背景延伸进状态栏区域（状态栏透出同色，视觉连续），标题/返回箭头
下移到状态栏之下的 48px 内容区。`_full`（视频全屏，状态栏隐藏）保持不变。

```scss
.nav_banner_container_nor {
  height: calc(48px + var(--vl-safe-top, 0px));
  justify-content: flex-end;
  .nav_banner {
    height: calc(48px + var(--vl-safe-top, 0px));
    padding-top: var(--vl-safe-top, 0px);
    box-sizing: border-box;
  }
}
```

### 9.4 验证

- Mate60 关于页：`--vl-safe-top=40px`，banner 总高 88px，标题/箭头位于
  状态栏下方，无重叠；状态栏区域透出深蓝与导航栏连成一体。
- 返回「我的」tab 页：浅色渐变沉浸式正常，无残留。
- Android16 模拟器登录页正常（公共组件同一机制，表现必然一致）。

### 9.5 构建链注意事项（macOS）

- `build.sh` 的 `sed -i ''` 在本机失效：PATH 中的 `sed` 是 toybox shim
  （WorkBuddy brokered-bin），不支持 BSD 空后缀写法。绕过方式：
  手动确认 `.env.production` 首行后直接 `./node_modules/.bin/vite build`。
- vite `emptyOutDir` 的 rmSync 会被安全沙盒拦截，构建前手动删除 `dist`。
- 同步：`cd vue3-h5 && ./node_modules/.bin/cap copy android` → gradle 打包。

### 9.6 模拟器补充验证（新 APK 装机后实测）

CDP 探测 `.nav_banner_container` 布局（登录后进入关于页）：

| 设备 | safeTop | banner 高 | 标题位置 | 结论 |
|---|---|---|---|---|
| Mate60 (API31) | 40px | 88px | 状态栏下方，无重叠 | ✅ |
| Android16 (WebView 145) | 52px | 107px | top=64，状态栏下方 | ✅ |
| Android17 (WebView 145) | 52px | 107px | top=64，状态栏下方 | ✅ |
| Android13 (WebView 109) | 49px | 104px | top=61，状态栏下方 | ✅ |

四端全部通过：深蓝背景延伸进状态栏、标题/返回箭头无遮挡。

排错备注：多应用模拟器上 `webview_devtools_remote` socket 有多个，
按 `head -1` 盲选会连到其他 App（如本例连到「奥陌陌」壳），
必须用 `pidof com.oort.vlstream` 得到 pid 后精确选
`webview_devtools_remote_<pid>`。

### 9.7 本次修改对 iOS / 鸿蒙端的影响评估

改动分两类，影响面不同：

**① Android 壳改动（MainActivity.java / NativeBridgePlugin.java）**
纯 Android 代码，iOS（NativeBridgePlugin.swift）与鸿蒙（NativeBridgePlugin.ets）
各有独立实现，完全不受影响。

**② H5 改动（viewport-fit=cover / --vl-safe-top 留白 / navHeaderBanner 修复）**
打进各端壳的 assets，三端共享。核对三端壳后结论：

- **iOS：正向，无风险。** iOS 壳本来就是 WKWebView 全屏铺满（沉浸式），
  `setStatusBar` 实现（swift:171）**只设置图标明暗、不染背景色**，与本次
  Android 修复后的行为天然一致；`__safeAreaTop` 注入非 0。二级页固定 48px
  导航栏在 iOS 刘海机上同样会被状态栏遮挡——本次 navHeaderBanner 修复
  对 iOS 是**顺带修复**。需重新 `cap copy ios` + 打包才能吃到新 H5。
- **鸿蒙：H5 部分正向，但壳有一处遗留问题。** 鸿蒙壳也是沉浸式
  （`setWindowLayoutFullScreen(true)`）+ 注入非 0 safeTop，二级页修复同样
  生效。但 `NativeBridgePlugin.ets` 的 `setStatusBar`（ets:127）**仍会把 H5
  传来的 color 染到状态栏**（`statusBarColor: color`）——即 Mate60 同款
  「工作台状态栏纯蓝硬边」问题在鸿蒙端**仍然存在**（工作台路由联动传
  #306AF8 纯蓝，盖住透出的渐变）。建议按 Android 修法对齐：忽略 color、
  仅使用 contentColor。本次未改鸿蒙代码（本机无鸿蒙验证手段）。
