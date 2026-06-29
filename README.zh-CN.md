# VLStream-APP

> VLStream 多端应用集合 —— 面向视频 / 位置流（Video & Location Stream）场景的跨平台客户端，当前以 H5 移动端（Vue 3）为核心。

[English](./README.md) | 简体中文

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646cff.svg)](https://vitejs.dev/)
[![Vant](https://img.shields.io/badge/Vant-4-ff6034.svg)](https://vant-ui.github.io/)

---

## 目录

- [简介](#简介)
- [仓库结构](#仓库结构)
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

VLStream-APP 是一个**多平台客户端仓库**，按目标平台拆分为独立目录。仓库采用「前端多项目集合」的设计思路：同一套工程可承载多个子项目，通过环境变量切换当前开发 / 构建的目标项目。

目前各原生平台目录为规划占位，**已实现并可用的是 H5 移动端 [`vue3-h5`](./vue3-h5)**，承载的子项目为 **VLStreamCloud（VLStream 云平台）**，是一个集地图轨迹、视频播放、事件管理、通讯录等功能于一体的移动端应用。

## 仓库结构

```
VLStream-APP/
├── Android/        # Android 客户端（规划中）
├── Harmony OS/     # 鸿蒙 HarmonyOS 客户端（规划中）
├── Kylin OS/       # 麒麟 OS 客户端（规划中）
├── Linux/          # Linux 客户端（规划中）
├── Mac OS/         # macOS 客户端（规划中）
├── Windows/        # Windows 客户端（规划中）
├── iOS/            # iOS 客户端（规划中）
├── vue3-h5/        # ✅ H5 移动端（Vue 3 + Vite），核心工程
├── LICENSE
└── README.md
```

> 说明：除 `vue3-h5` 外，其余平台目录暂以 `.gitkeep` 占位，将在后续迭代中补齐。

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

### 构建单个项目

通过 `build.sh` 传入项目名称进行生产构建（会自动写入 `.env.production` 的 `NODE_BUILDTARGET` 后执行 `vite build`）：

```bash
cd vue3-h5
sh ./build.sh VLStreamCloud
# 或使用预置脚本
pnpm run build:VLStreamCloud
```

构建产物输出至 `vue3-h5/dist`。仓库还提供 `moveTodepoly.sh` 用于将产物移动到部署目录以实现 Git 自动部署。

### 新增项目

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
- [代码风格参考](./vue3-h5/REFRENCE.md)
- [提交规范配置](./vue3-h5/commitlint.config.js)
- [Vite 构建配置](./vue3-h5/vite.config.ts)

## License

本项目基于 [MIT License](./LICENSE) 开源。
