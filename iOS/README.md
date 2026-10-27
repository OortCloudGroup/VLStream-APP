# VLStreamCloud iOS 壳（基于 Capacitor）

本目录是 VLStreamCloud 的 iOS 原生壳工程，以 [Capacitor](https://capacitorjs.com/) 8 为底座，加载 `vue3-h5` 离线包，用官方插件 + 一个自研业务 Plugin 提供 H5 所需的原生能力。与 Android 端（`../Android/android`）共用同一套 H5 桥接约定（`window.androidFunUtils` + `window.__VL_STATIC__`）。

> ⚠️ **必须在 macOS 上构建**。本工程由 `npx cap add ios` 在 Windows 上生成，但 Xcode/pod/xcodebuild 仅在 macOS 可用，Windows 无法编译/签名/打包 IPA。

## 目录结构

```
iOS/
└── ios/                                       # Capacitor 标准 iOS Xcode 工程
    ├── .gitignore                             # cap 生成
    ├── debug.xcconfig
    ├── capacitor-cordova-ios-plugins/         # cap 生成：cordova 插件兼容层（本工程未用 cordova 插件）
    └── App/
        ├── App.xcodeproj/                     # Xcode 工程（已登记 NativeBridgePlugin.swift / AppConfig.swift）
        ├── CapApp-SPM/                        # SPM 本地包：声明对 capacitor-swift-pm + 官方插件的依赖
        └── App/
            ├── AppDelegate.swift              # UIApplication 入口（UIScene）
            ├── SceneDelegate.swift            # rootViewController = CAPBridgeViewController
            ├── NativeBridgePlugin.swift       # 自研业务 Plugin（getGateway/getAppInfo/tokenOverdue + document-start 注入）
            ├── AppConfig.swift                # 环境名 vlEnv（multi/single）/ 可选网关覆盖 / appId/secret 常量（与 Android AppConfig 对齐）
            ├── Info.plist                     # 应用名 VLStream + 相机/相册/定位权限 + ATS 放行
            ├── capacitor.config.json          # cap 拷入（含 packageClassList，登记 NativeBridgePlugin）
            ├── Assets.xcassets/AppIcon.appiconset/  # 桌面图标（1024，来自 docs/vls/VLS2）
            └── public/                        # ← vue3-h5/dist 离线包（cap copy 拷入）
```

> 工程放在 `iOS/ios/` 而非前端根下，通过 `vue3-h5/capacitor.config.json` 的 `ios.path: "../iOS/ios"` 指定（见 `capacitor.config.ts:267` 对 `ios.path` 的支持）。

## 能力映射（与 Android 端一致）

H5 侧统一封装在 `vue3-h5/public/androidFunUtils.js`（挂 `window.androidFunUtils`，**接口签名与旧版 / Android 端完全一致**，业务代码无需改动）：

| H5 能力 | iOS 实现 | Android 对应 |
|---|---|---|
| `getGateway()` 同步 | 自研 `NativeBridgePlugin` document-start 注入 `window.__VL_STATIC__.gateway`（仅覆盖时使用） | 同 |
| 后端环境切换 | `AppConfig.vlEnv = "multi" / "single"` → 注入 `window.__VL_STATIC__.vlEnv`，域名由 H5 预设表决定 | 同（Android `BuildConfig.VL_ENV`） |
| `getAppInfo()` | 自研 `NativeBridgePlugin`（注入 + `@objc` 兜底）| 同 |
| `tokenOverdue()` | 自研 `NativeBridgePlugin`（`bridge.eval` 清 sessionStorage + reload）| 同 |
| `appExit()` | 官方 `@capacitor/app` `exitApp()` | 同 |
| `takePhoto(params)` | 官方 `@capacitor/camera`（`getPhoto` / `pickImages`）| 同 |
| `FileTransfer` 上传 | H5 侧 XHR+FormData polyfill（与原生解耦）| 同 |
| `is_native_shell` 标志 | `NativeBridgePlugin` document-start 注入 | 同 |

## 环境要求

- **macOS**（Xcode 仅在 macOS 运行）
- **Xcode 16+**（Capacitor 8 / Swift 5.9，iOS 15+ deployment target）
- **CocoaPods** 或 SPM（本工程用 SPM，依赖经 `CapApp-SPM/Package.swift` 声明）
- **Node 18+ / pnpm**（前端构建与 cap CLI）

## 构建（macOS）

### 1. 构建并同步 H5 离线包

```bash
cd vue3-h5
pnpm install
pnpm build:VLStreamCloud          # 产物在 vue3-h5/dist
npx cap copy ios                  # 拷 dist/* 到 iOS/ios/App/App/public/
# 装了新的官方插件时改用：npx cap sync ios
```

> ⚠️ **维护提示**：`npx cap sync ios`（或 `copy`）会重写 `App/App/capacitor.config.json` 的 `packageClassList`，**会把自研的 `NativeBridgePlugin` 丢掉**（CLI 只扫描 node_modules 里的插件，app target 内的自研 plugin 扫不到）。每次 `cap sync` 后需手动把 `"NativeBridgePlugin"` 加回 `packageClassList` 数组首位：
> ```json
> "packageClassList": ["NativeBridgePlugin", "AppPlugin", "CAPCameraPlugin", "GeolocationPlugin"]
> ```
> 漏加会导致 H5 调 `window.androidFunUtils.getGateway()` 等业务能力时 plugin 未注册、返回空。

### 2. 用 Xcode 打开并构建

```bash
cd iOS/ios/App
pod install                       # 若用 CocoaPods（本工程默认 SPM，可跳过）
open App.xcodeproj                # 在 Xcode 中打开
# 或命令行：
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release -archivePath build/App.xcarchive archive
xcodebuild -exportArchive -archivePath build/App.xcarchive -exportPath build/ipa -exportOptionsPlist ExportOptions.plist
```

> 首次在 Xcode 打开需设置 **Signing & Capabilities**：选择你的 Apple 开发者 Team，Bundle Identifier `com.oort.vlstream.app`（如与已有 App 冲突需改名）。Debug 跑模拟器/真机直接 `Cmd+R`。

## 开发期联调（连 dev server）

在 `vue3-h5/capacitor.config.json` 的 `server` 加 `url` 指向 Mac 局域网 dev server：

```json
"server": { "iosScheme": "capacitor", "url": "http://192.168.x.x:8080" }
```

然后 `npx cap run ios`（或 `npx cap copy ios` 后 Xcode 重跑）。dev server 需 `pnpm start`（绑定 0.0.0.0:8080），Mac 与设备/模拟器同局域网。

## JS 注入时序

`NativeBridgePlugin.load()` 用 `WKUserScript(injectionTime: .atDocumentStart)` 在 **document start** 注入 `window.__VL_STATIC__` 与 `window.global.is_native_shell`，保证它们早于 `index.html` 里的业务脚本执行——从而 H5 的 `getGateway()` 能保持**同步**语义（`App.vue` 无需改 async）。与 Android 端的 `WebViewCompat.addDocumentStartJavaScript` 对齐。

## 与 vue3-h5 的耦合点

与 Android 端完全相同：迁移未改动任何 vue3-h5 业务代码，耦合仅限于 `capacitor.config.json`（新增 `ios.path`）与 `public/androidFunUtils.js`（内部实现已同时适配 Android/iOS，对外签名不变）。浏览器/PC 调试（`pnpm start`）下 `Capacitor.isNative=false`，行为与迁移前一致。
