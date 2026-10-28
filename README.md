# VLStream-APP

> VLStream multi-platform application suite — a single Vue 3 H5 codebase packaged as native clients for Android, iOS, and HarmonyOS via Capacitor.

English | [简体中文](./README.zh-CN.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-646cff.svg)](https://vitejs.dev/)
[![Vant](https://img.shields.io/badge/Vant-4-ff6034.svg)](https://vant-ui.github.io/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119eff.svg)](https://capacitorjs.com/)

---

## Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [The Three Native Shells](#the-three-native-shells)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Multi-Project Mechanism](#multi-project-mechanism)
- [Backend Environment Switch](#backend-environment-switch)
- [Build & Deployment](#build--deployment)
- [Code Conventions](#code-conventions)
- [Related Documentation](#related-documentation)
- [License](#license)

---

## Overview

VLStream-APP is a **multi-platform client repository**. The core is a Vue 3 H5 mobile client ([`vue3-h5`](./vue3-h5)) hosting the sub-project **VLStreamCloud (VLStream Cloud Platform)**. This single H5 codebase is packaged into native apps for three platforms — **Android, iOS, and HarmonyOS** — all built on [Capacitor](https://capacitorjs.com/) 8 and sharing one bridge contract (`window.androidFunUtils` + `window.__VL_STATIC__`), so the H5 business code has **zero platform branches**.

The remaining platform directories (`Windows/`, `Mac OS/`, `Linux/`, `Kylin OS/`) are `.gitkeep` placeholders for future native clients.

## Repository Structure

```
VLStream-APP/
├── vue3-h5/        # ✅ H5 mobile client (Vue 3 + Vite) — shared core & build entry
├── Android/        # ✅ Android shell (Capacitor 8)          → Android/android
├── iOS/            # ✅ iOS shell (Capacitor 8)              → iOS/ios
├── HarmonyOS/      # ✅ HarmonyOS shell (openHarmony-capacitor) → HarmonyOS
├── Windows/        # Windows client (planned)
├── Mac OS/         # macOS client (planned)
├── Linux/          # Linux client (planned)
├── Kylin OS/       # Kylin OS client (planned)
├── docs/vls/       # Brand logo & icon source assets
├── LICENSE
└── README.md
```

## The Three Native Shells

All three shells load the same `vue3-h5/dist` offline package and expose an identical set of native capabilities through one self-developed `NativeBridge` plugin (gateway / appInfo / tokenOverdue) plus official Capacitor plugins (camera / app-exit / geolocation). The H5 side (`vue3-h5/public/androidFunUtils.js`) keeps a stable signature across platforms.

| Platform | Base | Shell dir | Build toolchain | Docs |
| --- | --- | --- | --- | --- |
| Android | Capacitor 8 (`@capacitor/android`) | [`Android/android`](./Android/android) | Android Studio / Gradle (JDK 21, AGP 8.13) | [`Android/README.md`](./Android/README.md) |
| iOS | Capacitor 8 (`@capacitor/ios`) | [`iOS/ios`](./iOS/ios) | Xcode 16+ / SPM (macOS only) | [`iOS/README.md`](./iOS/README.md) |
| HarmonyOS | openHarmony-capacitor 8 | [`HarmonyOS`](./HarmonyOS) | DevEco Studio 6.1+ / hvigor | [`HarmonyOS/README.md`](./HarmonyOS/README.md) |

> The shell path for Android/iOS is configured via `vue3-h5/capacitor.config.json` (`android.path` / `ios.path`); HarmonyOS uses `entry/src/main/resources/rawfile/www` and a manual `dist` sync (no `cap copy`).

### Capability mapping (H5 → native)

| H5 (`window.androidFunUtils`) | Implementation (identical across all 3 platforms) |
| --- | --- |
| `getGateway()` (sync) | `NativeBridge` injects `window.__VL_STATIC__.gateway` at document-start |
| `getAppInfo()` / `tokenOverdue()` | Self-developed `NativeBridge` plugin |
| `appExit()` | Official `@capacitor/app` `exitApp()` |
| `takePhoto(params)` | Official `@capacitor/camera` |
| `FileTransfer` upload | H5 XHR + FormData polyfill (decoupled from native) |
| `is_native_shell` flag | `NativeBridge` injects `window.global.is_native_shell = true` |

## Features

- 🗺️ **Map & Trajectory**: Built on Leaflet, with trajectory playback (`leaflet-trackplayer`), animated paths (`leaflet-ant-path`), and marker clustering (`leaflet.markercluster`).
- 🎬 **Video Playback**: Built-in `OPlayer` video player component.
- 📋 **Event Management**: Event Management business module.
- 📇 **Contacts**: Organization / contact tree component (`contactTree`), often used together with the popup component.
- 🖼️ **Images & Upload**: Image preview (both functional and component forms) and file uploader components.
- 📝 **Dynamic Forms**: Mobile form engine based on `vform3-mobile`.
- 🌍 **Internationalization**: Multi-language support via `vue-i18n`.
- 📱 **Mobile Adaptation**: Automatic px → vw conversion via `postcss-px-to-viewport` (design width 360px).

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Vue 3.5 (`<script setup>` + JSX) |
| Build Tool | Vite 4 |
| Language | TypeScript |
| UI Library | Vant 4 |
| State Management | Pinia 3 |
| Routing | Vue Router 4 |
| Maps | Leaflet + trackplayer + ant-path + markercluster |
| HTTP | axios |
| Forms | vform3-mobile-builds |
| i18n | vue-i18n 11 |
| Utilities | lodash-es, dayjs, moment, qs, mitt, jsencrypt, gcoord |
| **Native Shell** | **Capacitor 8 (Android / iOS) + openHarmony-capacitor 8 (HarmonyOS)** |
| Code Quality | ESLint + Husky + commitlint + lint-staged |
| Auto Import | unplugin-auto-import, unplugin-vue-components |

## Getting Started

### Prerequisites

- Node.js ≥ 16
- Package manager: [pnpm](https://pnpm.io/) recommended (the project ships a `pnpm-lock.yaml`; npm / yarn also work)

### Install & Run

```bash
cd vue3-h5

# Install dependencies
pnpm install        # or: npm install / yarn

# Start the dev server
pnpm start          # equivalent to: vite
```

Then open **http://localhost:8080** (the dev server is bound to `0.0.0.0:8080`, so you can debug on a real device over the same LAN).

> The project launched by default is determined by `VITE_PROJECT_DIR` in [`vue3-h5/.env`](./vue3-h5/.env) — currently `VLStreamCloud`.

## Multi-Project Mechanism

`vue3-h5` is a **single-page, multi-project collection** codebase: switch the active project via `.env`, and compile a specific project via the `package.json` scripts + `build.sh`. A recompile is required after each switch.

- **Switch in development**: edit [`vue3-h5/.env`](./vue3-h5/.env) and set `VITE_PROJECT_DIR=<project-name>` (matching a directory under `src/pages/`).
- **Entry resolution**: Vite uses `src/pages/<project-name>/main.ts` as the entry for that project.

```
vue3-h5/src/
├── api/          # Network requests per project
├── assets/       # Assets (fonts / images / shared styles)
├── components/   # Shared components (contacts, map, popup, uploader, form, etc.)
├── config/       # Project config (AppConfig / env & network / UI config / pageConfig)
├── hooks/        # Composables
├── lang/         # i18n language packs
├── pages/        # Per-project code (currently: VLStreamCloud)
├── store/        # Pinia state management
├── types/        # TypeScript type definitions
└── utils/        # Utilities (http, bus, etc.)
```

For the full directory layout and component library docs, see [`vue3-h5/README.md`](./vue3-h5/README.md).

## Backend Environment Switch

One codebase serves two backend environments. Everything about them lives in one preset table, so a switch never touches business code:

| Environment | Name | Business services (`apaas-vls-server` / `apaas-wvp-server`) | Login (`authMode`) | CameraRTC signaling |
| --- | --- | --- | --- | --- |
| Multi-tenant production | `multi` | `https://workup.oortcloudsmart.com:2443` | `platform` — `apaas-sso`: RSA `sso/v1/getLoginCode` → tenant pick → `sso/v1/login`, then `sso/v1/exchangeToken` for the VLStream JWT | `wss://vlstream.oortcloudsmart.com:2443/bus/camera-rtc` |
| Single-tenant | `single` | `https://vlstream.oortcloudsmart.com:2443` | `local` — BladeX `vls-server/blade-auth/token` (**query params** `account` / `password` / `grantType=password` / `tenantId=000000`; the password is **SM2 ciphertext**, C1C2C3 hex via `sm-crypto` mode `0` with `bladeAuthPublicKey`), no captcha and no token exchange | `wss://vlstream.oortcloudsmart.com:2443/bus/camera-rtc` |

- **Presets**: [`vue3-h5/src/config/index.js`](./vue3-h5/src/config/index.js) (`VL_ENV_PRESETS` + `applyVlEnv`) — hosts *and* service/auth differences (`authMode`, `authService`, `tenantId`, `bladeClientAuth`, `bladeAuthPublicKey`).
- **Service names differ, not just hosts.** The single-tenant cluster does not route any `apaas-*` vhost (nginx 404); its login/auth lives inside `vls-server` (`blade-auth/token`, `sso/v1/getUserInfo`, `blade-auth/logout`, `sso/v1/mode`). `GET {URL}bus/vls-server/sso/v1/mode` reports `{"tenantType":"single","multiTenant":false}` — the same probe the vendor PC console uses.
- **Single-tenant login is SM2, not plaintext.** `BladePasswordDecoder` decrypts `password` with the key pair behind `vlstream.auth.public-key` / `private-key` (the public key is the backend default, which is also what the vendor PC console ships) and only then compares against the stored BCrypt hash — sending plaintext or an MD5 always yields 「密码输入错误」. Each wrong answer increments `Login:pwd_err_cnt:<account>` in Redis; the 5th locks the account for 10 minutes, and a request made while locked is rejected *before* the password check, so it costs nothing. Token headers are normalized with precedence `Authorization` > `blade-auth` > `accesstoken` (`TokenHeaderResolver`, which drops `Basic ` values), so any one of them works; `sso/v1/getUserInfo`, `getUserTenants` and `refreshToken`, however, read the Redis `BladeTokenUserStore` entry written only by `/blade-auth/token`, so a flushed store breaks them even with an otherwise valid Sa-Token.
- **Where `authMode` is consumed**: [`api/login/localAuth.ts`](./vue3-h5/src/api/login/localAuth.ts) (local endpoints), [`store/modules/useraPaas.ts`](./vue3-h5/src/store/modules/useraPaas.ts) (`getLogin` branches), [`components/commonpage/LoginDev.vue`](./vue3-h5/src/components/commonpage/LoginDev.vue) (one-step login, no captcha/tenant UI), [`utils/vlstreamAuth.ts`](./vue3-h5/src/utils/vlstreamAuth.ts) (local token *is* the business token → skip `exchangeToken`), [`utils/service.ts`](./vue3-h5/src/utils/service.ts) (sends the local token in the `blade-auth` header, one of the three names the server accepts).
- **aPaaS platform services** (captcha, tenants, dicts, regions, forms, fastdfs upload, map, app-info) are called on `config.platformURL`. They exist only on the multi-tenant cluster; under `single` that host has no such routes, so those features are unavailable there and [`App.vue`](./vue3-h5/src/pages/VLStreamCloud/App.vue) falls back to the shell-injected `__VL_STATIC__.appInfo` instead of `apaas-admin-platform`.
- **Switch points**, highest precedence first:
  1. Native shell: `window.__VL_STATIC__.vlEnv` injected at document start — `VL_ENV` in `Android/android/app/build.gradle`, `AppConfig.vlEnv` in `iOS/ios/App/App/AppConfig.swift`, `APP_VL_ENV` in `HarmonyOS/entry/src/main/ets/plugins/NativeBridgePlugin.ets`. One built H5 bundle can therefore be shipped into either environment.
  2. Build/dev: `VITE_VL_ENV` in `vue3-h5/.env`, or per command — `VITE_VL_ENV=multi pnpm start`, `VITE_VL_ENV=multi pnpm run build:VLStreamCloud`.
  3. Fallback default: `multi`.
- Each shell also has an optional raw gateway override (Android `DEFAULT_GATEWAY`, iOS `AppConfig.gateway`, HarmonyOS `APP_GATEWAY`). Leave it empty to use the preset; set it only for on-site deployments with a custom host. A raw override changes hosts only — `authMode` still comes from the environment name.
- Unknown environment names are ignored — the current environment stays active instead of blanking the gateway.

## Build & Deployment

### 1. Build the shared H5 bundle

Every native shell consumes the same `vue3-h5/dist`:

```bash
cd vue3-h5
pnpm install
pnpm run build:VLStreamCloud      # runs build.sh → vite build → vue3-h5/dist
```

### 2. Build each native client

<details>
<summary><b>Android</b> (JDK 21, Android SDK 36)</summary>

```bash
cd vue3-h5 && npx cap sync android     # copy dist + register official plugins
cd ../Android/android
./gradlew :app:assembleDebug           # → app/build/outputs/apk/debug/app-debug.apk
```
Requires JDK 21 (the project uses a foojay toolchain resolver to auto-download it). See [`Android/README.md`](./Android/README.md).
</details>

<details>
<summary><b>iOS</b> (Xcode 16+, macOS only)</summary>

```bash
cd vue3-h5 && npx cap sync ios         # copies dist to iOS/ios/App/App/public
# then open iOS/ios/App/App.xcodeproj in Xcode, set Signing, Run
```
After `cap sync` you must re-add `"NativeBridgePlugin"` to `packageClassList` in `iOS/ios/App/App/capacitor.config.json` (the CLI drops self-developed plugins). See [`iOS/README.md`](./iOS/README.md).
</details>

<details>
<summary><b>HarmonyOS</b> (DevEco Studio 6.1+, hvigor)</summary>

```bash
# manual dist sync (openHarmony-capacitor has no cap copy):
rm -rf HarmonyOS/entry/src/main/resources/rawfile/www
mkdir -p HarmonyOS/entry/src/main/resources/rawfile/www
cp -r vue3-h5/dist/. HarmonyOS/entry/src/main/resources/rawfile/www/

# command-line build (set DEVECO_SDK_HOME first):
cd HarmonyOS
hvigorw assembleHap -p product=default --mode module -p module=entry@default
# → entry/build/default/outputs/default/entry-default-unsigned.hap
hdc install entry/build/default/outputs/default/entry-default-unsigned.hap
```
Or open the `HarmonyOS/` folder in DevEco Studio and Run. See [`HarmonyOS/README.md`](./HarmonyOS/README.md).
</details>

> `vue3-h5/dist` also feeds `moveTodepoly.sh` for Git-based web auto-deployment.

### Add a New Project

1. Create a new folder named after the project under `src/pages/` (recommended: copy an existing project and modify it).
2. Add the project's config in `src/config/pageConfig.ts`.
3. Configure the project's launch entry in `.env`.
4. Add a corresponding `build:<project-name>` entry to the `scripts` in `package.json`.

> ⚠️ The project name must be identical across all of the above.

## Code Conventions

### Commit Convention

The project uses [commitlint](https://commitlint.js.org/) to enforce commit message format. Only the following types are allowed (the type must be followed by a colon and a space, e.g. `fix: resolve login bug`):

| Type | Description |
| --- | --- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `upd` | An update (neither `feat` nor `fix`) |
| `docs` | Documentation changes |
| `style` | Formatting (no runtime impact) |
| `refactor` | Code refactoring |
| `revert` | Revert a previous commit |
| `test` | Adding tests |
| `chore` | Build process or auxiliary tooling changes |

### ESLint Rules

- `v-for` must have a bound `:key`.
- Prefer strict equality `===` when the value type is known.
- Unused variables / imports / components must be removed or commented out.
- Declare arrays with `[]` and objects with `{}`.
- No trailing commas.

For details, see [`vue3-h5/.eslintrc.cjs`](./vue3-h5/.eslintrc.cjs) and [`vue3-h5/REFRENCE.md`](./vue3-h5/REFRENCE.md).

## Related Documentation

- [vue3-h5 detailed guide (directory layout / component library / workflow)](./vue3-h5/README.md)
- [Android shell (Capacitor)](./Android/README.md)
- [iOS shell (Capacitor)](./iOS/README.md)
- [HarmonyOS shell (openHarmony-capacitor)](./HarmonyOS/README.md)
- [Code style reference](./vue3-h5/REFRENCE.md)
- [Commit convention config](./vue3-h5/commitlint.config.js)
- [Vite build config](./vue3-h5/vite.config.ts)

## License

This project is licensed under the [MIT License](./LICENSE).
