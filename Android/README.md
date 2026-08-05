# VLStreamCloud Android 壳（基于 Capacitor）

本目录是 VLStreamCloud 的 Android 原生壳工程，以 [Capacitor](https://capacitorjs.com/) 8 为底座，加载 `vue3-h5` 离线包，用官方插件 + 一个自研业务 Plugin 提供 H5 所需的原生能力。取代了早期的 AgentWeb + 自研 JS Bridge 方案（旧代码已归档到仓库根 `.archive/agentweb-shell-backup/`）。

## 目录结构

```
Android/
└── android/                                  # Capacitor 标准 Android 工程（由 npx cap add 生成 + 自研文件）
    ├── build.gradle / settings.gradle / variables.gradle / gradle.properties
    ├── gradle/wrapper/                       # Gradle Wrapper（cap 生成，Gradle 8.x）
    ├── capacitor.settings.gradle             # cap 自动生成：引用 node_modules 里的 capacitor-android/官方插件
    ├── capacitor-cordova-android-plugins/    # cap 自动生成：cordova 插件兼容层（本工程未用 cordova 插件）
    ├── local.properties                      # sdk.dir（不要提交）
    └── app/
        ├── build.gradle                      # :app 模块；buildConfigField 注入 DEFAULT_GATEWAY；签名引用 keystore/debug.jks
        ├── keystore/debug.jks                # debug 占位签名（沿用旧壳）
        └── src/main/
            ├── AndroidManifest.xml           # INTERNET / CAMERA / READ_MEDIA_* / 定位权限；FileProvider；cleartext
            ├── assets/
            │   ├── capacitor.config.json     # cap 拷入的运行时配置
            │   ├── capacitor.plugins.json     # cap 自动登记的官方插件
            │   └── public/                    # ← vue3-h5/dist 离线包（cap copy 拷入）
            ├── res/xml/{file_paths,network_security_config}.xml
            └── java/com/oort/vlstream/app/
                ├── MainActivity.java          # extends BridgeActivity，注册 NativeBridgePlugin
                ├── AppConfig.java             # 网关 BuildConfig 读取
                └── NativeBridgePlugin.java    # 自研业务 Plugin（gateway/appInfo/tokenOverdue + 启动期注入）
```

> Capacitor 工程放在 `Android/android/` 而非前端根下，通过 `vue3-h5/capacitor.config.json` 的 `android.path: "../Android/android"` 指定（见 `capacitor.config.ts:211` 对 `android.path` 的支持）。

## 环境要求

- **JDK 21**（编译 `capacitor-android` 用——其源码 `compileOptions` 锁 `VERSION_21`；本机默认 `JAVA_HOME` 若是 JDK 17 会导致 `:capacitor-android:compileDebugJavaWithJavac` 报 `无效的源发行版: 21`）。
  - 已在 `settings.gradle` 配 `org.gradle.toolchains.foojay-resolver-convention`，Gradle 会自动下载 JDK 21 到 `~/.gradle/jdks/`；并在 `gradle.properties` 用 `org.gradle.java.home` 显式指向该路径。换机器构建时：
    - 若本机已装正式 JDK 21（如 `C:/Program Files/Eclipse Adoptium/jdk-21...`），把 `gradle.properties` 里的 `org.gradle.java.home` 改成正式路径即可，无需 foojay 下载。
    - 若走 foojay 自动下载，首次构建需联网，下载完后后续构建离线可用。
- **Android SDK**：compileSdk/targetSdk 36，minSdk 24（`local.properties` 的 `sdk.dir` 已配置，勿提交）。
- **Node 18+ / pnpm**（前端构建与 cap CLI）。

> 构建踩坑记录：详见上面两条——`capacitor-android` 要 JDK 21（非运行 `JAVA_HOME` 的 17），且 `app/build.gradle` 需补 `androidx.webkit:webkit` 依赖（`NativeBridgePlugin` 用 `WebViewCompat.addDocumentStartJavaScript` 做 document-start 注入；`cap add` 生成的模板默认不带此依赖，缺它会报 `找不到符号 WebViewCompat/WebViewFeature`）。

## 能力映射（H5 → 原生）

H5 侧统一封装在 `vue3-h5/public/androidFunUtils.js`（挂 `window.androidFunUtils`，**接口签名与旧版完全一致**，业务代码无需改动）：

| H5 能力 | 实现 |
|---|---|
| `getGateway()` 同步 | 自研 `NativeBridgePlugin` 启动期注入 `window.__VL_STATIC__.gateway` |
| `getAppInfo()` | 自研 `NativeBridgePlugin`（注入 `__VL_STATIC__.appInfo` + `@PluginMethod` 兜底）|
| `tokenOverdue()` | 自研 `NativeBridgePlugin`（清 sessionStorage + reload）|
| `appExit()` | 官方 `@capacitor/app` `exitApp()` |
| `takePhoto(params)` | 官方 `@capacitor/camera`（`getPhoto` / `pickImages`）|
| `FileTransfer` 上传 | H5 侧 XHR+FormData polyfill（与原生解耦，保留不变）|
| `is_native_shell` 标志 | `NativeBridgePlugin` 启动期注入 `window.global.is_native_shell=true` |
| 定位（二期）| 官方 `@capacitor/geolocation` |
| 安全区（二期）| `@capacitor/status-bar` / safe-area-inset |

## 构建

### 1. 构建并同步 H5 离线包

```bash
cd vue3-h5
pnpm install
pnpm build:VLStreamCloud          # 产物在 vue3-h5/dist
npx cap copy android              # 拷 dist/* 到 Android/android/app/src/main/assets/public/
# 装了新的官方插件时改用：npx cap sync android
```

### 2. 构建 APK

```bash
cd Android/android
./gradlew :app:assembleDebug      # debug APK：app/build/outputs/apk/debug/app-debug.apk
./gradlew :app:assembleRelease    # release APK（已配置 debug.jks 占位签名）
```

## 开发期联调（连 dev server）

在 `vue3-h5/capacitor.config.json` 临时加 `server.url` 指向 PC 局域网 dev server：

```json
"server": { "androidScheme": "https", "url": "http://192.168.x.x:8080" }
```

然后 `npx cap run android`（或 `npx cap copy android` 后重装 APK）。dev server 需 `pnpm start`（绑定 0.0.0.0:8080），PC 与手机同局域网。

## JS 注入时序

`NativeBridgePlugin.load()` 用 `androidx.webkit` 的 `WebViewCompat.addDocumentStartJavaScript` 在 **document start** 注入 `window.__VL_STATIC__` 与 `window.global.is_native_shell`，保证它们早于 `index.html` 里的业务脚本（`androidFunUtils.js` 等）执行——从而 H5 的 `getGateway()` 能保持**同步**语义（`App.vue` 无需改 async）。`DOCUMENT_START_SCRIPT` 不支持时回退到 `Bridge.eval`。

## 与 vue3-h5 的耦合点

迁移未改动任何 vue3-h5 业务代码，耦合仅限于：
- `vue3-h5/public/androidFunUtils.js`：内部实现切换到 Capacitor（对外签名不变）
- `vue3-h5/capacitor.config.json`：新增，声明 appId/webDir=dist/android.path
- `vue3-h5/package.json`：新增 `@capacitor/{core,cli,android,app,camera,geolocation}` 依赖

浏览器/PC 调试（`pnpm start`）下 `Capacitor.isNative=false`，`androidFunUtils` 内部不触发任何 plugin 调用，行为与迁移前一致。
