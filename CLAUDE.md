# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

VLStream-APP 是一个**多平台客户端集合仓库**，按目标平台分目录。除 `vue3-h5` 外，`Android/`、`iOS/`、`Windows/`、`Mac OS/`、`Linux/`、`Harmony OS/`、`Kylin OS/` 目前均为 `.gitkeep` 占位符。**所有实际代码都在 `vue3-h5/`（Vue 3 H5 移动端）**，未来其他平台客户端将在各自目录中开发。

所有开发、构建、依赖安装都在 `vue3-h5/` 子目录下进行。

## Common Commands

```bash
cd vue3-h5

pnpm install          # 安装依赖（项目自带 pnpm-lock.yaml；npm/yarn 也可）
pnpm start            # 启动 dev server，访问 http://localhost:8080（绑定 0.0.0.0:8080，支持同局域网真机调试）

pnpm run lint:eslint  # ESLint 检查并 --fix（含 vue/js/ts/tsx）
pnpm run lint         # 等价于 lint:eslint

pnpm run build:VLStreamCloud   # 生产构建当前项目（经 build.sh 写入 .env.production 的 NODE_BUILDTARGET 后执行 vite build）
# 或手动: sh ./build.sh <项目名>
```

- **没有测试框架**：`package.json` 无 test 脚本，`vite.config.ts` 里的 `test` 字段为空。不要假设存在单元测试命令。
- **构建产物**输出到 `vue3-h5/dist`；`moveTodepoly.sh` 用于把产物移到部署目录以支持 git 自动部署。

## Core Architecture

### 多项目机制（multi-project collection）

`vue3-h5` 是**单页面、多项目集合**代码库。核心约定：

1. 当前激活项目由 `.env` 中的 `VITE_PROJECT_DIR` 决定（当前为 `VLStreamCloud`）。
2. **入口解析**：Vite 通过 `vite-plugin-html` 把 `index.html` 的 `injectScript` 注入为 `/src/pages/<VITE_PROJECT_DIR>/main.ts`。该项目的 `main.ts` 是真实应用入口（注册 Vant、VForm、i18n、Pinia、Router 并 `mount('#app')`）。
3. **构建覆盖**：生产构建时 `build.sh` 会把 `NODE_BUILDTARGET` 写入 `.env.production`，`vite.config.ts` 中 `NODE_BUILDTARGET` 优先于 `VITE_PROJECT_DIR`。
4. **每次切换项目后必须重新编译**。

**添加新项目**（项目名必须在四处保持一致）：在 `src/pages/` 下建同名目录（建议复制现有项目）→ 在 `src/config/pageConfig.ts` 加配置 → 在 `.env` 配置入口 → 在 `package.json` 的 `scripts` 加 `build:<name>`。

### 路径别名（vite.config.ts）

- `@` → `src/`
- `@@` → `src/pages/<当前项目>/`（**随当前项目动态变化**，用于引用项目内文件）
- `~@` → `src/components/VForm`（表单组件库）
- `vant/es`、`vant/lib` → 显式指向 node_modules（解决按需引入路径问题）

可省略后缀：`.js`、`.vue`、`.json`、`.ts`。

### 目录职责（vue3-h5/src）

- `pages/<project>/` — 每个项目的独立代码（`main.ts` 入口、`App.vue`、`router/`、`page/` 路由页面、业务组件）。**项目间代码隔离**。
- `api/` — 网络请求。顶层 `api/VLStreamCloud/` 是 VLStreamCloud 项目的接口集合；`api/login/` 等为通用登录类接口。
- `components/` — **跨项目共享组件**，修改需谨慎以免影响其他项目（如 `popup/oort_popup`、`contactTree/`、`leafletmap/`、`imagePreview/`、`uploader/`、`navHeaderBanner/`、`VForm/`）。
- `config/` — `AppConfig.js`（各项目 appId/secretKey/requestType）、`index.js`（网络/IP/webRTC 配置，运行时被 `App.vue` 改写）、`pageConfig.ts`（每项目注入的扩展 JS 库，如 vconsole）。
- `store/` — Pinia（setup store 风格），`modules/` 下含 `useraPaas.ts`（认证核心）、`mapConfig.ts`、`featureConfig.ts`。
- `utils/` — `service.ts`（axios 封装，见下）、`bus.js`（mitt 事件总线）、`cache.ts`（token 的 sessionStorage 存取）、`cordovatUtils.js`（Cordova 桥接）。
- `lang/` — vue-i18n 语言包（zh/en/ar）。

### 网络请求封装（utils/service.ts）

- 导出 `service`（axios 实例）和 `request`（请求方法）。
- **请求拦截器**内置节流：同一 `method+url` 在 800ms 内重复触发会被丢弃（`whiteApi` 白名单豁免）。
- **响应拦截器**统一处理：`code !== 200` 时 toast 提示；遇到「无效的 accessToken」会清 token + `location.reload()` 或经 `useGoWhere` 跳转。
- `request` 默认注入 `AccessToken` header（从 `cache.ts` 取）和 `Config.headers`（含 appId/secretKey/tenantid）。

**新增 API 的标准模式**（参考 `api/VLStreamCloud/device.ts`）：每个文件定义一个 `commonFunc<T, K>(interfaceName, data, method='post', isParams=false)`，统一拼接 `config.URL + config.gateWay + 'vls-server' + interfaceName`（`gateWay` 默认 `'bus/'`），GET/DELETE 自动转 `params`。

### 认证流程

混合应用，支持两种环境：
- **Cordova 原生壳**（`window.cordova` 存在）：监听 `deviceready` → 通过 `cordovatUtils` 取 `accessToken` 和网关地址 → 写入 `Config.URL`。
- **纯浏览器/PC 调试**：弹出 `LoginDev` 登录面板。

token 通过 SSO（`loginSSO`）换取，密码用 `JSEncrypt` + 内置 RSA 公钥加密。token 存于 sessionStorage（兼容 pcweb2.0 的 `tempObj`）。租户切换时 `tenantId` 持久化到 sessionStorage。

### 移动端适配

`postcss-px-to-viewport` 自动把 px 转 vw，**设计稿宽度 360px**。`<1px` 不转换，类名含 `.ignore-` 前缀的也跳过。

## Code Conventions

### 提交规范（commitlint，由 husky 强制）

格式：`<type>: <subject>`（冒号后**必须有空格**，type 必填，subject 必填）。允许的 type：`upd`（既非 feat 也非 fix 的更新）、`feat`、`fix`、`perf`、`docs`、`style`、`refactor`、`test`、`revert`、`type`、`chore`、`wip`。注意 `upd` 是本项目特有的常用 type。

### ESLint（lint-staged 在 pre-commit 自动 --fix）

- 无分号（`semi: never`），单引号，无尾逗号。
- 函数名与参数间无空格（`space-before-function-paren: never`）。
- `v-for` 必须有 `:key`；类型已知时用 `===`；声明用 `[]`/`{}`；删除未使用的 import/变量/组件。
- 多行属性首属性前必须换行，单行最多 10 个属性。

### 代码风格参考

详细 JS 风格见 `vue3-h5/REFRENCE.md`（Airbnb 风格指南）。多数源文件头部带 `兰舰` 的版权/修改时间注释块，修改既有文件时遵循该注释风格。

## Key Technical Details

- **Vue Router 用 hash 模式**（`createWebHashHistory`），适配混合应用环境。
- **状态管理**用 Pinia 3 setup store（`defineStore('name', () => {...})`），需在 setup 外使用时通过 `useXxxStoreHook()` 包装（传入 store 实例，见 `useraPaas.ts` 末尾）。
- **事件总线**：`@/utils/bus.js` 基于 mitt，提供 `$on/$off/$emit/$register`（`$register` 会把事件登记到组件实例字段以便批量解绑）。
- **表单引擎**：`vform3-mobile`，全局注册为 `VmFormRender`，组件源码在 `components/VForm/`。
- **视频播放**：`components/OPlayer.vue`。
- **地图**：Leaflet + `leaflet-trackplayer`（轨迹回放）+ `leaflet-ant-path`（动画路径）+ `leaflet.markercluster`（聚合）。
- **SVG 图标**：`vite-plugin-svg-icons` 自动注册 `src/assets/img/svg/`，symbolId 格式 `icon-[dir]-[name]`。
- **自动导入**：`unplugin-auto-import` 自动导入 `vue` 和 `vue-router` API（无需手动 import ref/reactive/useRouter 等）。
