# AGENTS.md

VLStream 多平台客户端集合仓库：核心是 `vue3-h5/`（Vue 3 H5 移动端，承载子项目 VLStreamCloud），经 Capacitor 8 打包为三端原生壳 —— `Android/android`（Capacitor 8）、`iOS/ios`（Capacitor 8，仅 macOS 可构建）、`HarmonyOS/`（openHarmony-capacitor 8，DevEco/hvigor）。`Windows/`、`Mac OS/`、`Linux/`、`Kylin OS/` 目前为空占位目录。所有前端开发、构建、依赖安装都在 `vue3-h5/` 子目录下进行。

> 根目录 `CLAUDE.md` 关于「平台目录均为 .gitkeep 占位」的描述已过时（早于三端壳架构），布局以本文件和 `README.md` 为准。

## 常用命令（在 vue3-h5/ 下）

```bash
pnpm install            # 包管理用 pnpm（自带 pnpm-lock.yaml）
pnpm start              # dev server → http://localhost:8080（绑 0.0.0.0，可局域网真机调试）
pnpm run lint           # ESLint 检查并自动 --fix（--max-warnings 0）
pnpm run build:VLStreamCloud   # 经 build.sh 写 NODE_BUILDTARGET 后 vite build → vue3-h5/dist
```

- **没有测试框架**：`package.json` 无 test 脚本，不要假设存在单元测试命令。
- 构建产物在 `vue3-h5/dist`，是三个原生壳共用的唯一离线包。
- `pnpm run build:VLStreamCloud` 有时会先触发 pnpm 的依赖校验（自动跑 `pnpm install`），而 `prepare` 里的 `husky install` 在 `vue3-h5/` 下找不到 `.git` 会失败；此时直接用 `sh ./build.sh VLStreamCloud`（内部就是 `npm run build`）绕过。类型检查用本地 `./node_modules/.bin/tsc --noEmit -p tsconfig.json`（仓库没装 vue-tsc，`npx vue-tsc` 会拉到不兼容版本）。

## 多项目机制

`vue3-h5` 是单页面、多项目集合代码库：

- `.env` 中 `VITE_PROJECT_DIR` 决定激活项目（当前为 `VLStreamCloud`），入口是 `src/pages/<项目名>/main.ts`（vite-plugin-html 注入）。
- 生产构建时 `build.sh` 把 `NODE_BUILDTARGET` 写入 `.env.production`，优先于 `VITE_PROJECT_DIR`。
- **每次切换项目后必须重新编译**。
- 新增项目需四处同名一致：`src/pages/` 目录 → `src/config/pageConfig.ts` → `.env` → `package.json` 的 `build:<name>` 脚本。

## 后端环境开关（multi / single）

- 两套后端：**multi=多租户生产**（业务网关 `https://workup.oortcloudsmart.com:2443`）、**single=单租户**（业务网关 `https://vlstream.oortcloudsmart.com:2443`）。域名预设表只有一处：`vue3-h5/src/config/index.js` 的 `VL_ENV_PRESETS` + `applyVlEnv()`，里面同时含 `authMode` / `authService` / `tenantId` / `bladeClientAuth` / `bladeAuthPublicKey`。
- **认证方式随环境变（不只是域名）**：multi 走 `apaas-sso`（RSA `sso/v1/getLoginCode` → 选租户 → `sso/v1/login`，业务请求前再 `sso/v1/exchangeToken` 换 VLStream JWT）；single 的 vlstream 集群不路由任何 `apaas-*`（nginx 404），登录是本地 BladeX `POST vls-server/blade-auth/token`，**参数是 query 不是 body，账号字段名是 `account` 不是 `username`，`grantType` 是驼峰**，租户固定 `000000`（服务端忽略客户端传值，只取 `tokenProperties.singleTenantId`），无验证码、无需 exchangeToken，返回的 accessToken 直接充当业务令牌与 wvp 的 `x-vlstream-token`。**密码必须 SM2 加密**（`sm-crypto` `sm2.doEncrypt(pwd, publicKey, 0)` = C1C2C3 hex，公钥在 `config.bladeAuthPublicKey`，与后端 `vlstream.auth.public-key` 配对；服务端 `BladePasswordDecoder` 解密后才和 BCrypt 比对，明文/MD5 提交一律「密码输入错误」，且 `Login:pwd_err_cnt:<account>` 累计 5 次锁 10 分钟）。令牌头服务端按 `Authorization` > `blade-auth` > `accesstoken` 优先级归一，任一个即可（`TokenHeaderResolver`，`Basic ` 值会被丢弃）；但 `sso/v1/getUserInfo`/`getUserTenants`/`refreshToken` 依赖 `/blade-auth/token` 写入的 Redis `BladeTokenUserStore`，令牌有效但 store 被清空也会失败。`authMode='local'` 分支见 `api/login/localAuth.ts`、`store/modules/useraPaas.ts` 的 `getLogin`、`LoginDev.vue`、`utils/vlstreamAuth.ts`、`utils/service.ts` 的 `blade-auth` 头）。探测服务端模式：`GET {URL}bus/vls-server/sso/v1/mode` → `{"tenantType":"single"}`；`vls-server/actuator/mappings` 可直接列出全部路由。
- 平台服务（验证码、租户、字典、区域、表单、fastdfs 上传、地图、`apaas-admin-platform` 应用信息）走 `config.platformURL`，只有多租户集群有；single 下这些功能不可用，`App.vue` 的 `loginSuccess` 因此改用壳注入的 `__VL_STATIC__.appInfo` 兜底，别把它改回强依赖 HTTP 应用信息。
- 切换变量优先级：原生壳注入的 `window.__VL_STATIC__.vlEnv` ＞ `.env`/命令行的 `VITE_VL_ENV`（`VITE_VL_ENV=multi pnpm start`）＞ 代码默认 `multi`。三端各自的环境常量分别是 Android `build.gradle` 的 `VL_ENV`、iOS `AppConfig.vlEnv`、HarmonyOS `APP_VL_ENV`；同一份 dist 可装进两种环境的壳。
- CameraRTC 信令地址按环境取 `config.cameraRtcSocketURL`（两套都是 `wss://vlstream.oortcloudsmart.com:2443/bus/camera-rtc`，该端口只做 TLS），不要按 `Config.URL` 反推。
- 壳侧仍保留 `DEFAULT_GATEWAY` / `AppConfig.gateway` / `APP_GATEWAY` 作为**可选**现场覆盖，默认空串（留空即沿用 H5 预设）。

## 路径别名（vite.config.ts）

- `@` → `src/`
- `@@` → `src/pages/<当前项目>/`（随项目动态变化）
- `~@` → `src/components/VForm`
- 可省略后缀：`.js` `.vue` `.json` `.ts`

## 架构边界

- `src/pages/<project>/` — 项目独立代码，**项目间隔离**。
- `src/components/` — **跨项目共享组件**（contactTree、leafletmap、uploader、popup、VForm 等），改动会影响所有项目，需谨慎。
- `src/api/` — `api/VLStreamCloud/` 为项目接口，`api/login/` 为通用登录接口。新增 API 参考 `api/VLStreamCloud/device.ts` 的 `commonFunc<T, K>(interfaceName, data, method)` 模式，统一拼 `config.URL + config.gateWay + 'vls-server' + interfaceName`。
- `src/utils/service.ts` — axios 封装：请求拦截器对同一 method+url 有 800ms 节流；响应拦截器统一 toast 错误、处理 token 失效；`request` 默认注入 AccessToken 和 appId/secretKey headers。
- `src/config/index.js` 的网络/IP 配置在运行时被 `App.vue` 改写，勿静态引用。

## 三端原生壳（关键约定）

三端共用同一套桥接契约：`window.androidFunUtils`（封装在 `vue3-h5/public/androidFunUtils.js`）+ `window.__VL_STATIC__`（document-start 注入）。**H5 业务代码零平台分支**，改动桥接签名必须三端同步。

- **Android**（`Android/README.md`）：需 JDK 21（foojay resolver 已配置自动下载）；`cd vue3-h5 && npx cap sync android` 后在 `Android/android` 跑 `./gradlew :app:assembleDebug`。`local.properties` 勿提交。
- **iOS**（`iOS/README.md`）：仅 macOS + Xcode 16+ 可构建。⚠️ `npx cap sync ios` 后必须手动把 `"NativeBridgePlugin"` 重新加回 `iOS/ios/App/App/capacitor.config.json` 的 `packageClassList`（CLI 会丢弃自研插件登记）。
- **HarmonyOS**（`HarmonyOS/README.md`）：需 DevEco Studio 6.1+，hvigor 构建。⚠️ openHarmony-capacitor **没有 `cap copy`**，dist 要手动同步到 `HarmonyOS/entry/src/main/resources/rawfile/www/`（该目录 gitignore）。ArkTS ≠ TypeScript，静态检查必须用 DevEco 自带 arkts-check，系统 tsc 不认。CLI 构建需先设 `DEVECO_SDK_HOME`。

仓库根的 `_install.ps1`（adb 装 APK 到局域网测试机）和 `_logcat.ps1`（过滤抓取 logcat）是本机 Windows 开发辅助脚本。

## 代码规范

- **提交规范**（husky + commitlint 强制）：`<type>: <subject>`，冒号后必须有空格。允许 type：`feat` `fix` `upd` `docs` `style` `refactor` `test` `revert` `chore` 等；`upd` 是本项目特有的常用 type（既非 feat 也非 fix 的更新）。
- **ESLint**（pre-commit 由 lint-staged 自动 --fix）：无分号、单引号、无尾逗号、函数名与参数间无空格；`v-for` 必须有 `:key`；删除未使用的 import/变量/组件；多行属性首属性前必须换行。
- 详细 JS 风格参考 `vue3-h5/REFRENCE.md`（Airbnb 风格）；多数源文件头部带作者版权注释块，修改既有文件时遵循该风格。
- **移动端适配**：postcss-px-to-viewport 自动 px→vw，**设计稿宽度 360px**；`<1px` 不转换，类名含 `.ignore-` 前缀跳过。

## 关键技术细节

- Vue Router 用 **hash 模式**（适配混合应用）。
- Pinia 3 setup store；在 setup 外使用需 `useXxxStoreHook()` 包装（见 `store/modules/useraPaas.ts` 末尾）。
- `unplugin-auto-import` 自动导入 `vue` / `vue-router` API，无需手动 import ref/reactive/useRouter。
- 表单引擎 `vform3-mobile`（全局 `VmFormRender`，组件源码在 `components/VForm/`）；视频播放 `components/OPlayer.vue`；地图 Leaflet + trackplayer + ant-path + markercluster。
- 认证：Cordova 壳走 `deviceready` + `cordovatUtils` 取 token/网关；纯浏览器调试弹 `LoginDev` 面板。token 存 sessionStorage（`utils/cache.ts`）。
- SVG 图标经 `vite-plugin-svg-icons` 自动注册（`src/assets/img/svg/`），symbolId 格式 `icon-[dir]-[name]`。

## 改动前应读的文档

- `README.md` — 三端壳架构与构建总览（本仓库当前权威布局描述）
- `Android/README.md` / `iOS/README.md` / `HarmonyOS/README.md` — 各壳目录结构、能力映射、构建踩坑记录
- `vue3-h5/README.md` — 前端目录与组件库详解
