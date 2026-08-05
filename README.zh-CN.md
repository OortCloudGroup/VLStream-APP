# VLStream-APP

> VLStream 多端应用集合 —— 面向视频 / 位置流（Video & Location Stream）场景的跨平台客户端，当前以 H5 移动端（Vue 3）为核心。

[English](./README.md) | 简体中文

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646cff.svg)](https://vitejs.dev/)
[![Vant](https://img.shields.io/badge/Vant-4-ff6034.svg)](https://vant-ui.github.io/)

[![Capacitor](https://img.shields.io/badge/Capacitor-8-119eff.svg)](https://capacitorjs.com/)

---

## 目录

- [简介](#简介)
- [仓库结构](#仓库结构)
- [三端原生壳](#三端原生壳)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [多项目机制](#多项目机制)
- [构建与部署](#构建与部署)
- [代码规范](#代码规范)
- [相关文档](#相关文档)
- [License](#license)

---

## 简介

VLStream-APP 是一个**多平台客户端仓库**。核心是 Vue 3 H5 移动端（[`vue3-h5`](./vue3-h5)），承载子项目 **VLStreamCloud（VLStream 云平台）**。这套 H5 代码被打包成 **Android、iOS、鸿蒙** 三端原生应用——全部基于 [Capacitor](https://capacitorjs.com/) 8，共用一套桥接约定（`window.androidFunUtils` + `window.__VL_STATIC__`），因此 **H5 业务代码零平台分支**。

其余平台目录（`Windows/`、`Mac OS/`、`Linux/`、`Kylin OS/`）为 `.gitkeep` 占位，待后续补齐。

## 仓库结构

```
VLStream-APP/
├── vue3-h5/        # ✅ H5 移动端（Vue 3 + Vite）— 共享核心与构建入口
├── Android/        # ✅ Android 壳（Capacitor 8）           → Android/android
├── iOS/            # ✅ iOS 壳（Capacitor 8）               → iOS/ios
├── HarmonyOS/      # ✅ 鸿蒙壳（openHarmony-capacitor）     → HarmonyOS
├── Windows/        # Windows 客户端（规划中）
├── Mac OS/         # macOS 客户端（规划中）
├── Linux/          # Linux 客户端（规划中）
├── Kylin OS/       # 麒麟 OS 客户端（规划中）
├── docs/vls/       # 品牌 logo / 图标源素材
├── LICENSE
└── README.md
```

## 三端原生壳

三端壳加载同一份 `vue3-h5/dist` 离线包，通过一个自研 `NativeBridge` plugin（gateway / appInfo / tokenOverdue）+ 官方 Capacitor 插件（camera / app-exit / geolocation）暴露一致的原生能力。H5 侧（`vue3-h5/public/androidFunUtils.js`）对外签名跨平台不变。

| 平台 | 底座 | 壳目录 | 构建工具链 | 文档 |
| --- | --- | --- | --- | --- |
| Android | Capacitor 8（`@capacitor/android`）| [`Android/android`](./Android/android) | Android Studio / Gradle（JDK 21、AGP 8.13）| [`Android/README.md`](./Android/README.md) |
| iOS | Capacitor 8（`@capacitor/ios`）| [`iOS/ios`](./iOS/ios) | Xcode 16+ / SPM（仅 macOS）| [`iOS/README.md`](./iOS/README.md) |
| 鸿蒙 | openHarmony-capacitor 8 | [`HarmonyOS`](./HarmonyOS) | DevEco Studio 6.1+ / hvigor | [`HarmonyOS/README.md`](./HarmonyOS/README.md) |

> Android/iOS 的壳路径由 `vue3-h5/capacitor.config.json`（`android.path` / `ios.path`）指定；鸿蒙使用 `entry/src/main/resources/rawfile/www` 并手动同步 `dist`（无 `cap copy`）。

### 能力映射（H5 → 原生）

| H5（`window.androidFunUtils`）| 实现（三端一致）|
| --- | --- |
| `getGateway()`（同步）| `NativeBridge` 在 document-start 注入 `window.__VL_STATIC__.gateway` |
| `getAppInfo()` / `tokenOverdue()` | 自研 `NativeBridge` plugin |
| `appExit()` | 官方 `@capacitor/app` `exitApp()` |
| `takePhoto(params)` | 官方 `@capacitor/camera` |
| `FileTransfer` 上传 | H5 侧 XHR + FormData polyfill（与原生解耦）|
| `is_native_shell` 标志 | `NativeBridge` 注入 `window.global.is_native_shell = true` |

## 功能特性

- 🗺️ **地图与轨迹**：基于 Leaflet，支持轨迹回放（`leaflet-trackplayer`）、路径动画（`leaflet-ant-path`）、海量点聚合（`leaflet.markercluster`）。
- 🎬 **视频播放**：内置 `OPlayer` 视频播放组件。
- 📋 **事件管理**：事件（Event Management）业务模块。
- 📇 **通讯录**：组织 / 联系人树形组件（`contactTree`），常与弹窗组件配合使用。
- 🖼️ **图片与上传**：图片预览（函数式 + 组件式双形态）、文件上传组件。
- 📝 **动态表单**：基于 `vform3-mobile` 的移动端表单引擎。
- 🌍 **国际化**：基于 `vue-i18n` 的多语言支持。
- 📱 **移动端适配**：`postcss-px-to-viewport` 自动 px → vw 适配（设计稿宽度 360px）。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>` + JSX） |
| 构建工具 | Vite 4 |
| 语言 | TypeScript |
| UI 组件库 | Vant 4 |
| 状态管理 | Pinia 3 |
| 路由 | Vue Router 4 |
| 地图 | Leaflet + trackplayer + ant-path + markercluster |
| 网络请求 | axios |
| 表单 | vform3-mobile-builds |
| 国际化 | vue-i18n 11 |
| 工具库 | lodash-es、dayjs、moment、qs、mitt、jsencrypt、gcoord |
| **原生壳** | **Capacitor 8（Android / iOS）+ openHarmony-capacitor 8（鸿蒙）** |
| 代码规范 | ESLint + Husky + commitlint + lint-staged |
| 自动导入 | unplugin-auto-import、unplugin-vue-components |

## 快速开始

### 环境要求

- Node.js ≥ 16
- 包管理器：推荐 [pnpm](https://pnpm.io/)（项目已附带 `pnpm-lock.yaml`，也可使用 npm / yarn）

### 安装与启动

```bash
cd vue3-h5

# 安装依赖
pnpm install        # 或 npm install / yarn

# 启动开发服务器
pnpm start          # 等同于 vite
```

启动后访问 **http://localhost:8080** （开发服务器固定监听 `0.0.0.0:8080`，可同一局域网下用真机调试）。

> 默认运行的项目由 [`vue3-h5/.env`](./vue3-h5/.env) 中的 `VITE_PROJECT_DIR` 决定，当前为 `VLStreamCloud`。

## 多项目机制

`vue3-h5` 是一个**单页面多项目集合**工程：通过 `.env` 切换当前开发项目，通过 `package.json` 脚本 + `build.sh` 编译指定项目。每次切换项目后需重新编译运行。

- **开发切换**：编辑 [`vue3-h5/.env`](./vue3-h5/.env)，设置 `VITE_PROJECT_DIR=<项目名>`（对应 `src/pages/` 下的目录名）。
- **入口解析**：Vite 会以 `src/pages/<项目名>/main.ts` 作为该项目的入口。

```
vue3-h5/src/
├── api/          # 各项目网络请求
├── assets/       # 资源（字体 / 图片 / 公共样式）
├── components/   # 公共组件（通讯录、地图、弹窗、上传、表单等）
├── config/       # 项目配置（AppConfig / 环境与网络 / UI 配置 / pageConfig）
├── hooks/        # 组合式函数
├── lang/         # 国际化语言包
├── pages/        # 各项目代码（当前：VLStreamCloud）
├── store/        # Pinia 状态管理
├── types/        # TypeScript 类型定义
└── utils/        # 工具函数（http、bus 等）
```

完整目录说明与组件库文档见 [`vue3-h5/README.md`](./vue3-h5/README.md)。

## 构建与部署

### 1. 构建共享 H5 产物

三端原生壳都消费同一份 `vue3-h5/dist`：

```bash
cd vue3-h5
pnpm install
pnpm run build:VLStreamCloud      # 执行 build.sh → vite build → vue3-h5/dist
```

### 2. 构建各端原生客户端

<details>
<summary><b>Android</b>（JDK 21、Android SDK 36）</summary>

```bash
cd vue3-h5 && npx cap sync android     # 拷贝 dist + 登记官方插件
cd ../Android/android
./gradlew :app:assembleDebug           # → app/build/outputs/apk/debug/app-debug.apk
```
需要 JDK 21（工程已用 foojay 工具链解析器自动下载）。详见 [`Android/README.md`](./Android/README.md)。
</details>

<details>
<summary><b>iOS</b>（Xcode 16+，仅 macOS）</summary>

```bash
cd vue3-h5 && npx cap sync ios         # 拷贝 dist 到 iOS/ios/App/App/public
# 之后用 Xcode 打开 iOS/ios/App/App.xcodeproj，配置签名后 Run
```
`cap sync` 后需手动把 `"NativeBridgePlugin"` 加回 `iOS/ios/App/App/capacitor.config.json` 的 `packageClassList`（CLI 会丢掉自研 plugin）。详见 [`iOS/README.md`](./iOS/README.md)。
</details>

<details>
<summary><b>鸿蒙</b>（DevEco Studio 6.1+、hvigor）</summary>

```bash
# 手动同步 dist（openHarmony-capacitor 无 cap copy）：
rm -rf HarmonyOS/entry/src/main/resources/rawfile/www
mkdir -p HarmonyOS/entry/src/main/resources/rawfile/www
cp -r vue3-h5/dist/. HarmonyOS/entry/src/main/resources/rawfile/www/

# 命令行构建（先设 DEVECO_SDK_HOME）：
cd HarmonyOS
hvigorw assembleHap -p product=default --mode module -p module=entry@default
# → entry/build/default/outputs/default/entry-default-unsigned.hap
hdc install entry/build/default/outputs/default/entry-default-unsigned.hap
```
或用 DevEco Studio 打开 `HarmonyOS/` 目录后 Run。详见 [`HarmonyOS/README.md`](./HarmonyOS/README.md)。
</details>

> `vue3-h5/dist` 同时供 `moveTodepoly.sh` 做 Git 自动部署。

### 新增 H5 子项目

1. 在 `src/pages/` 下新建以项目名命名的文件夹（建议复制现有项目后修改）。
2. 在 `src/config/pageConfig.ts` 中增加该项目的配置。
3. 在 `.env` 中配置该项目的启动项。
4. 在 `package.json` 的 `scripts` 中新增对应的 `build:<项目名>` 配置。

> ⚠️ 项目名称在各处需保持完全一致。

## 代码规范

### Commit 规范

项目使用 [commitlint](https://commitlint.js.org/) 约束提交信息，仅允许以下类型（类型后需加冒号与空格，例如 `fix: 修复登录bug`）：

| 标识 | 说明 |
| --- | --- |
| `feat` | 新功能（feature） |
| `fix` | 修补 bug |
| `upd` | 更新某功能（既非 feat 也非 fix） |
| `docs` | 文档变更 |
| `style` | 格式调整（不影响代码运行） |
| `refactor` | 重构 |
| `revert` | 回滚 |
| `test` | 增加测试 |
| `chore` | 构建过程或辅助工具变动 |

### ESLint 规范

- `v-for` 必须绑定 `:key`。
- 值类型明确时优先使用全等 `===`。
- 未使用的变量 / import / 组件需移除或注释。
- 数组用 `[]`，对象用 `{}` 声明。
- 行尾逗号需去除。

详细规范可查阅 [`vue3-h5/.eslintrc.cjs`](./vue3-h5/.eslintrc.cjs) 与 [`vue3-h5/REFRENCE.md`](./vue3-h5/REFRENCE.md)。

## 相关文档

- [vue3-h5 详细说明（目录结构 / 组件库 / 开发流程）](./vue3-h5/README.md)
- [Android 壳（Capacitor）](./Android/README.md)
- [iOS 壳（Capacitor）](./iOS/README.md)
- [鸿蒙壳（openHarmony-capacitor）](./HarmonyOS/README.md)
- [代码风格参考](./vue3-h5/REFRENCE.md)
- [提交规范配置](./vue3-h5/commitlint.config.js)
- [Vite 构建配置](./vue3-h5/vite.config.ts)

## License

本项目基于 [MIT License](./LICENSE) 开源。
