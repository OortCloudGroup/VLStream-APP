# VLStreamCloud 鸿蒙壳（基于 openHarmony-capacitor）

本目录是 VLStreamCloud 的 HarmonyOS 原生壳工程，以 [openHarmony-capacitor](https://gitcode.com/CPF-Ionic/openHarmony-capacitor)（Capacitor 8 的鸿蒙化版本）为底座，加载 `vue3-h5` 离线包，用官方插件 + 一个自研业务 Plugin 提供 H5 所需的原生能力。与 Android/iOS 端共用同一套 H5 桥接约定（`window.androidFunUtils` + `window.__VL_STATIC__`）。

> ⚠️ **必须在装有 DevEco Studio 6.0+ 的 Windows/macOS 上构建**。本工程无法用 gradle/xcodebuild 编译，必须用 DevEco 的 hvigor + HarmonyOS SDK。ArkTS 静态检查也必须用 DevEco 自带 `arkts-check`（ArkTS ≠ TypeScript，系统 tsc 不认）。

## 目录结构

```
HarmonyOS/
├── AppScope/
│   ├── app.json5                          # 应用级配置（bundleName/version/icon/label）
│   └── resources/base/
│       ├── element/string.json            # app_name = VLStream
│       └── media/app_icon.png             # 应用图标（VLS logo，白底）
├── entry/                                 # 主入口 HAP 模块
│   ├── build-profile.json5 / oh-package.json5 / hvigorfile.ts
│   └── src/main/
│       ├── module.json5                   # abilities + 权限（INTERNET/CAMERA/相册/定位）
│       ├── ets/
│       │   ├── entryability/EntryAbility.ets   # UIAbility：WebView 引擎初始化 + 沉浸式状态栏（AppStorage 传值）
│       │   ├── pages/Index.ets                  # @Entry 页面：挂 MainPage + 注册 NativeBridge plugin
│       │   └── plugins/NativeBridgePlugin.ets   # 自研 ArkTS 业务 plugin
│       └── resources/
│           ├── base/{element,media,profile}/    # 字符串/图标/页面路由
│           └── rawfile/
│               ├── capacitor.config.json        # 框架配置（含 packageClassList）
│               ├── capacitor.plugins.json        # 已登记 App/Camera/Geolocation 三个官方插件
│               └── www/                          # ← vue3-h5/dist 离线包（gitignore，手动同步）
├── capacitor/                             # openHarmony-capacitor HAR 模块（已集成 3 个官方插件源码）
│   ├── libs/{arm64-v8a,x86_64}/           # openssl 动态库（libssl.so.3 / libcrypto.so.3）
│   ├── src/main/cpp/                      # C++ 层：capacitor 核心 + App/Camera/Geolocation 插件 + openssl 头
│   └── src/main/ets/components/           # ArkTS 层：capacitor 核心 + 官方插件 ets
├── hvigor/hvigor-config.json5            # hvigor 配置（modelVersion 5.0.1）
├── build-profile.json5                    # 工程级：products + modules（entry + capacitor）+ strictMode
├── oh-package.json5                       # 工程级依赖（harmony-capacitor）
└── hvigorfile.ts                          # appTasks
```

## 集成的官方插件（鸿蒙版）

从 gitcode `CPF-Ionic` 克隆后，按各自 `plugin.xml` 的指引，把 cpp/ets 源码并入 `capacitor` 模块：

| 官方插件 | H5 能力 | cpp 位置 | ets 位置 |
|---|---|---|---|
| `@capacitor-ohos/app` | `appExit()` | `capacitor/src/main/cpp/App/` | `capacitor/src/main/ets/components/App/App.ets` |
| `@capacitor-ohos/camera` | `takePhoto()` | `capacitor/src/main/cpp/Camera/` | `ImageCompress/*` + `MediaAction/*` |
| `@capacitor-ohos/geolocation` | 定位（二期）| `capacitor/src/main/cpp/Geolocation/` | `Geolocation/Geolocation.ets` |

集成三步（已在工程内完成，记录在此供升级参考）：
1. **cpp**：拷 `App/Camera/Geolocation` 三个目录到 `capacitor/src/main/cpp/`，在 `capacitor/src/main/cpp/CMakeLists.txt` 的 `#START_ADD_SUBDIRECTORY` 段加 `add_subdirectory(...)`，并在 `target_link_libraries(capacitor PUBLIC "-Wl,--whole-archive" ...)` 里加插件名。
2. **ets**：拷插件 ets 到 `capacitor/src/main/ets/components/`，在 `capacitor/build-profile.json5` 的 `arkOptions.runtimeOnly.sources` 数组登记每个 ets 路径。
3. **capacitor.plugins.json**：`entry/src/main/resources/rawfile/` 里登记 `{"pkg":"@capacitor/app","classpath":"App"}` 等（已含 3 条）。

## openssl 依赖（必须）

capacitor 的 C++ 层强依赖 openssl 3.5。本工程已把 [openharmony-capacitor-openssl3.5](https://gitcode.com/li_in/openharmony-capacitor-openssl3.5) 的产物分发到位（CMake 预期路径）：
- 头文件：`capacitor/src/main/cpp/openssl/<arch>/include/`（CMake `include_directories` 引用）
- 动态库：`capacitor/libs/<arch>/libssl.so.3` / `libcrypto.so.3`（CMake `OPENSSL_LIB_PATH` 引用）

两个架构 `arm64-v8a`（真机）/ `x86_64`（模拟器）都已就位，**无需再手动集成 openssl**。

## 能力映射（与 Android/iOS 一致）

H5 侧封装在 `vue3-h5/public/androidFunUtils.js`（挂 `window.androidFunUtils`，**接口签名跨平台一致**）：

| H5 能力 | 鸿蒙实现 | Android/iOS 对应 |
|---|---|---|
| `getGateway()` 同步 | 自研 `NativeBridgePlugin` `handleOnPageStart` 注入 `window.__VL_STATIC__.gateway` | 同 |
| `getAppInfo()` | 自研 `NativeBridgePlugin`（注入 + `registerMethod` 兜底）| 同 |
| `tokenOverdue()` | 自研 `NativeBridgePlugin`（`runJavaScript` 清 sessionStorage + reload）| 同 |
| `appExit()` | 官方 `@capacitor-ohos/app` `exitApp()` | 同 |
| `takePhoto(params)` | 官方 `@capacitor-ohos/camera` | 同 |
| `FileTransfer` 上传 | H5 侧 XHR+FormData polyfill（与原生解耦）| 同 |
| `is_native_shell` 标志 | `NativeBridgePlugin` `handleOnPageStart` 注入 | 同 |

## 构建与运行（DevEco Studio）

### 1. 构建并同步 H5 离线包

```bash
cd vue3-h5
pnpm install
pnpm build:VLStreamCloud          # 产物在 vue3-h5/dist
# 手动同步到鸿蒙 rawfile（openHarmony-capacitor 无 cap copy，需手动）：
rm -rf "../HarmonyOS/entry/src/main/resources/rawfile/www"
mkdir -p "../HarmonyOS/entry/src/main/resources/rawfile/www"
cp -r dist/. "../HarmonyOS/entry/src/main/resources/rawfile/www/"
```

### 2. 用 DevEco Studio 打开构建

1. DevEco Studio → Open → 选 `HarmonyOS/` 目录（识别为 HarmonyOS 工程）。
2. 等待 `ohpm install` / `hvigor` 同步（首次会下载 `@ohos/hvigor-ohos-plugin` 等）。
3. 配置签名：File → Project Structure → Signing Configs（选 Automatic 或手动证书）。
4. 选设备（模拟器 x86_64 / 真机 arm64-v8a）→ Run。

或命令行（需先设 `DEVECO_SDK_HOME` 指向 DevEco 的 sdk 目录）：
```bash
cd HarmonyOS
hvigorw assembleHap -p product=default --mode module -p module=entry@default
# 产物 entry/build/default/outputs/default/entry-default-unsigned.hap
hdc install entry/build/default/outputs/default/entry-default-unsigned.hap
hdc shell aa start -a EntryAbility -b com.oort.vlstream.app
```

### 3. 沉浸式状态栏

`EntryAbility.onWindowStageCreate` 调 `getMainWindowSync()` 取避让区高度（px→vp，经 `display.densityPixels` 换算）存入 `AppStorage('__safeAreaTop')`，并调 `setWindowLayoutFullScreen(true)` 开启沉浸式；`NativeBridgePlugin.handleOnPageStart` 从 `AppStorage` 读出并通过 `runJavaScript` 注入 H5 的 `window.__safeAreaTop`，供 LoginDev/workbench 顶部留白（与 Android 端 edge-to-edge 一致）。

> 状态栏高度经 `AppStorage` 传递（替代 `globalThis`，规避 ArkTS `arkts-no-any-unknown` 约束）。

## 开发期联调（连 dev server）

临时把 `entry/src/main/resources/rawfile/capacitor.config.json` 的 `server.url` 指向 PC 局域网 dev server，并在 `Index.ets` 的 `MainPage` 传 `indexPage: 'http://192.168.x.x:8080'`。dev server 需 `pnpm start`（绑定 0.0.0.0:8080），PC 与设备同局域网。

## 与 vue3-h5 的耦合点

与 Android/iOS 相同：迁移未改动 vue3-h5 业务代码，`public/androidFunUtils.js` 内部实现已同时适配三端（对外签名不变）。浏览器/PC 调试（`pnpm start`）下 `Capacitor.isNative=false`，行为不变。

## 已知约束

- ArkTS 静态检查严格：禁 `any`/动态加属性；改 `NativeBridgePlugin.ets` / `Index.ets` 后需用 DevEco 的 `arkts-check` 验证（系统 tsc 不认）。
- `handleOnPageStart` 用 `runJavaScript` 注入（晚于 document-start，但早于 H5 业务脚本的实际执行，因 webview 先触发 onPageStart 再跑业务 JS）。若发现首屏 `__VL_STATIC__` 未就绪，可在 H5 `androidFunUtils.js` 增加 plugin 兜底调用。
- 状态栏 `__safeAreaTop` 当前从 `globalThis` 读（EntryAbility 注入）；如需更精确的避让区，可在 plugin 内用 `@ohos.arkui.UIContext` 取 `getWindowAvoidArea`。
