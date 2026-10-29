# 设计：Perry 原生重写 — Windows 单端验证原型

- 日期：2026-08-02
- 状态：已批准（方案 C，原型范围锁定为 4 页）
- 关联项目：`vue3-h5-ts`（原 Vue 3 H5 应用，只读参考）
- 关联技能：`perry-pack-windows`

## 0. 背景与决策路径

`vue3-h5-ts` 是 Vue 3 + TypeScript 移动端 H5 应用，用户目标是"改造成可用 Perry 打包成多端（Windows/Android/iOS）的应用"。

经源码级探查（`F:\work\perry` 编译器仓库 + `vue3-h5-ts` 业务全貌）确认两条硬约束：

1. **Perry 是 AOT 编译，无内嵌 JS 引擎。** 它会拒绝依赖图里任何 `.js`/`.mjs` 模块。`vue3-h5-ts` 的 `api/` 层 `import axios`、入口 `import { createApp } from 'vue'` 都会拉进 JS 运行时而被拒。错误原文：`JavaScript runtime (V8) support has been removed. This build of Perry compiles TypeScript ahead-of-time only and cannot evaluate JavaScript modules at runtime.`
2. **`perry/ui` 是原生控件，明确 no-WebView（除受限 WebView 岛）。** README：`Native UI (no WebView) ✅ AppKit, UIKit, Android Views, Win32, GTK4`。`WebView` 组件自述（`types/perry/ui/index.d.ts:666-673`）为"browser tab embedded in native tree"，**非 Tauri/Electron 应用壳**，native target 不暴露 `postMessage`，通信靠 `webviewEvaluateJs`（推入）+ 导航拦截（拉出）。

结论：Perry 无法直接"打包"现有 Vue 应用。可行路线是**用 `perry/ui` 原生重写前端 + 复用纯 TS 业务逻辑**，地图等 Web 依赖页用受限 WebView 岛嵌入。

用户确认目标为"用 Perry 原生重写"，并选择**先做 Windows 单端验证原型（方案 C）**，验证 OK 后再按方案 A（渐进式混合）全面推进。本 spec 仅覆盖原型。

## 1. 原型目标：证伪/证实三个假设

原型不交付完整应用。唯一价值是用最小成本验证方案 A 全盘推进的三个技术前提。任何一个证伪，方案 A 需调整：

| # | 假设 | 验证方式 | 证伪后果 |
|---|------|---------|---------|
| H1 | Perry 原生 UI 能承载 vue3-h5-ts 主流页面（列表+表单+详情） | 用 perry/ui 重写「设备列表」页，接真实接口 | 不能 → 考虑退回 Tauri |
| H2 | vue3-h5-ts 的 `api/` 层能低成本迁移（axios → Perry fetch） | 写 `http` adapter，让 `device.ts` 的 `commonFunc` 跑通 | 难 → 重写代价超预期 |
| H3 | Perry 窄范围 WebView 能承载 Leaflet 地图页 + 必要通信 | 现有地图页 embed，验证加载 + `evaluateJs` | 不能 → 地图只能后端渲染/砍功能 |

### Definition of Done

一个 Windows `.exe`，能：（伪）登录 → 拉设备列表渲染 → 点设备进入详情 → 进入地图页看到带标注的 Leaflet 地图。四个动作跑通即原型成功，不论样式。

## 2. 项目结构

新建工程，不污染 `vue3-h5-ts`：

```
VLStream-APP/
├── vue3-h5-ts/          # 原项目，只读参考，不动
├── perry-app/           # 【新】Perry 原生重写工程
│   ├── main.ts          # Perry 入口（App + NavStack）
│   ├── http.ts          # ★ axios→Perry fetch adapter（H2 核心）
│   ├── config.ts        # URL/网关/token 存取（替代 sessionStorage）
│   ├── pages/
│   │   ├── login.ts     # 伪登录（写死/简化 SSO）
│   │   ├── deviceList.ts# 设备列表（LazyVStack，H1）
│   │   ├── deviceDetail.ts
│   │   └── map.ts       # WebView 地图岛（H3）
│   ├── api/             # 从 vue3-h5-ts 迁移，仅改 import 路径
│   │   └── device.ts    # 复用，commonFunc 不动
│   ├── types/           # 直接复用
│   └── web-assets/      # 地图页 HTML（Leaflet），--embed 进 exe
│       └── map.html
└── Windows/             # 产物输出目录
    └── VLStreamCloud.exe
```

关键原则：`perry-app/api/` 是从 `vue3-h5-ts` 拷贝的副本，`commonFunc` 逻辑不动，只把 `import { request } from '@/utils/service'` 换成 `import { request } from '../http'`。以此验证 H2 的迁移成本是否真的低。

## 3. 架构：三层

```
┌─────────────────────────────────────────┐
│  原生壳（perry/ui）  Windows 上 = Win32  │  ← H1
│  NavStack 导航 + VStack/List/Text/Button │
├─────────────────────────────────────────┤
│  共享 TS 核心（复用）                    │  ← H2
│  api/ · types/ · http adapter · config  │
├─────────────────────────────────────────┤
│  WebView 岛（地图 only）                 │  ← H3
│  --embed map.html · evaluateJs 通信      │
└─────────────────────────────────────────┘
```

## 4. 三个必须改造的适配点

（以下结论由实测探针在 Windows host 上锁定，非文档推断。）

1. **HTTP（H2 核心）**：Perry 全局 `fetch` 在 Windows **编译通过但运行时挂起**（探针 `typeof fetch = function`，`fetch()` 返回 Promise，但 `await` 后进程静默无输出、无 crash）。改用 **`node:https` / `node:http`**（实测可用，`typeof https.get = function`）。写 `http.ts`，用 `node:https` 实现 `request()`，保留原 `service.ts` 拦截器语义：注入 `AccessToken` header、统一处理 `code!==200`、无效 token 跳登录。`commonFunc` 签名不变。
2. **存储**：Perry 的 keychain/preferences 在 Windows 是 **stub**（编译期 `Generating stubs for 5 missing symbols`：keychain_save/get/delete、preferences_set/get，运行时无效）。`node:fs` **实测可用**（writeFileSync/readFileSync/existsSync）。token/tenantId 改用 `node:fs` 文件持久化（路径 `./perry-app-data/state.json`）。
3. **认证**：原型用伪登录（写死 token 或简化 SSO），不碰 RSA 加密/Cordova 壳——那块在全面推进时再适配。

## 4a. 地图岛实现（H3，因 `--embed` 不可用而调整）

原设计用 `--embed` 把 Leaflet HTML 打进 exe。**实测 `--embed` 在 Windows host 报错**（`currently supported only on Unix-like hosts`）。调整为：
- 运行时用 `node:fs` 把 Leaflet 地图 HTML（含 `<script>` 引 CDN Leaflet）写到磁盘临时文件 `./perry-app-data/map.html`。
- WebView 组件 `url` 指向该本地文件路径（WebView2 支持 `file://`）。
- 通信：`webviewEvaluateJs(handle, js, cb)` 推数据进地图（如标注坐标）；导航拦截 `onShouldNavigate` 拉数据出。

## 5. perry/ui 关键能力对照（实测）

| 需求 | perry/ui（Windows 实测） | 原型处置 |
|------|----------|---------|
| 列表 | `LazyVStack(count, render)` + `lazyvstackUpdate` | 用 |
| 表单输入 | `TextField`/`SecureField`/`Picker` | 用 |
| 导航 | `NavStack(active: State<string>, routes)` + `State.set()` 切页 | 用 |
| 底部 Tab | `TabBar` 在 Windows 是 no-op stub（`index.d.ts:603-607`） | 原型避开，用 NavStack |
| 地图 | 仅基础 Map 标注 | 走 WebView 岛（`node:fs` 写盘 + `file://`） |
| 状态 | `State<T>`（`.value`/`.get()`/`.set()`）+ `ForEach`/`setText` | 用 |
| 样式 | `widgetSetBackgroundColor/Opacity/BorderWidth/CornerRadius` 等（无 CSS，命令式 setter） | 用 |
| i18n | `perry i18n` | 原型先写死中文，i18n 不进 |
| Toast | `showToast` | 用 |
| 存储 | keychain/preferences = Windows stub；用 `node:fs` | 文件持久化 |
| HTTP | `fetch` 挂起；用 `node:https` | 自写 adapter |

## 6. 验证（不写单测，靠运行）

原型无测试框架。验证 = 跑 exe + 人工核对四个动作 + 检查产物体积（目标 < 8 MB）。如实报告每个假设的验证结果，包括失败的。

## 7. 风险与回退

- 风险最高的是 H3（WebView 窄范围 + Leaflet + 通信）。若 `webviewEvaluateJs` 推不进数据或地图加载失败，地图页降级为「纯展示静态地图截图」，不阻塞 H1/H2 结论。
- 若 H2 证明 `api/` 迁移成本远超预期（如拦截器语义无法用 fetch 等价表达），记录具体阻塞点，方案 A 调整为"api 层也重写"。
- 产物体积超标不判失败，仅记录。

## 8. 非目标（YAGNI）

明确不做：Android/iOS 打包、真 SSO/RSA 登录、Vant 组件库移植、VForm 表单引擎、ECharts、vue-router 完整迁移、Pinia 迁移、vue-i18n、轨迹回放/聚合/动画路径。这些都在原型验证通过后的方案 A 阶段处理。
