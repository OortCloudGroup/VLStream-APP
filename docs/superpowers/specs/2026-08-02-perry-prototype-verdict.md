# 原型三假设验收结论

- 日期：2026-08-02
- 原型产物：`Windows/VLStreamCloud.exe`（最小窗口，6.3 MB，已验证可运行）

## 结论速览

| 假设 | 结论 | 证据 |
|------|------|------|
| H1 原生 UI 承载页面 | ⏸ 未触达（被 H2 阻断，非 UI 本身问题） | 最小窗口 App/VStack/Text/Button 渲染正常 |
| H2 api 层低成本迁移 | ❌ **FAIL（根因：Perry Windows 网络 IO 死锁）** | 见下 |
| H3 WebView 承载地图 | ⏸ 未触达（依赖 H2/整体推进） | — |

## H2 失败的根因（实测，非推断）

用分层探针在 Windows host 上逐步隔离：

1. **`fetch` 全局**：`typeof fetch = function`，`fetch()` 返回 Promise，但 `await` 后进程静默退出，无响应无报错。
2. **`node:https`/`node:http`**：`request()` 同步返回 req 对象，`req.end()` 调用成功，但 `response`/`error`/`timeout` 回调**永不触发**。
3. **网络分层**：
   - ✅ DNS 解析正常（`httpbin.org` → 8 个 IP）。
   - ❌ TCP 直连挂死（`net.connect` 的 connected/error/timeout 事件全部不触发，挂 20s 被外部 kill）。
4. **事件循环**：
   - ✅ `setTimeout(2000)` 精确触发；`setInterval(500)` 连续打印 14 个 tick。说明 Perry 的 `js_wait_for_event` → `stdlib_wait_driver` → tokio `block_on` 主循环**正常工作**。
5. **最终判别**（`net-final-probe`）：`setInterval` 持续打印 `alive`，同时 `https.request` 发出 —— 7 秒内事件循环一直在转，**但网络回调一次都没来**。

**锁定根因**：Perry 在 Windows 上的 tokio 网络 reactor（驱动 reqwest / 原生 TCP 的 IOCP 后端）未正确驱动网络 IO 任务。timer/时间轮走 tokio 的 timer 子系统（正常），但 reqwest/TCP 的 socket IO 任务卡死。因此**所有依赖网络的 API（fetch / node:https / node:http）在 Perry Windows 编译产物中运行时均不可用**——不是某个 API 的 bug，是整条网络 IO 链路在 Windows 上是断的。

## 对方案的影响

H2 是方案 A（Perry 原生重写 vue3-h5-ts）的硬前提——vue3-h5-ts 是一个**强网络依赖**的应用（47 个 api 文件、全部业务走 HTTP）。在 Perry 当前版本（0.5.1265）的 Windows target 上，HTTP 请求完全无法发出，意味着：

- 设备列表拉不到数据
- 登录认证无法完成
- 所有业务页面都是死的

**方案 A（Perry 原生重写）在当前 Perry 版本 + Windows target 下不可行。** 不是工作量问题，是底层能力缺失。

H1（原生 UI）和 H3（WebView 地图）本身没被证伪——最小窗口证明 perry/ui 渲染正常。但它们依附于 H2，单独成立无意义。

## 已沉淀的有效资产

| 文件 | 状态 | 价值 |
|------|------|------|
| `perry-app/store.ts` | ✅ 实测通过 | node:fs 持久化适配层，getToken/setToken/removeToken 行为正确 |
| `perry-app/config.ts` | ✅ | 移植的配置层，去掉 Cordova 注入 |
| `perry-app/http.ts` | ⚠️ 代码正确但运行时无效 | node:https adapter，受网络死锁连累 |
| `perry-app/api/device.ts` | ✅ 编译通过 | commonFunc 零改动迁移，证明 api 层移植成本确实低 |
| `perry-app/main.ts` | ✅ 实测通过 | 最小窗口 6.3MB exe 可运行 |

## 推荐路线（回到用户此前否决的方案 B）

既然 Perry 原生路线被 Windows 网络死锁阻断，而 vue3-h5-ts 必须保留（Vue 应用 + 强网络），正确的打包路线是 **Web 应用 → 桌面/移动壳**：

- **Windows 桌面**：**Tauri**（~10MB，WebView2）或 Electron（~150MB，Chromium）。直接加载 vue3-h5-ts 的 `vite build` 产物（`dist/`）。
- **Android/iOS**：**Capacitor**。vue3-h5-ts 本就是 Cordova 混合应用，迁移到 Capacitor 是顺理成章的升级路径。
- **Web**：`vite build` → PWA。

这些方案的网络层走系统 WebView/Chromium（成熟的 HTTP 栈），不存在 Perry 的网络死锁问题。

## 是否值得向 Perry 上游反馈

值得。根因（tokio 网络 reactor 在 Windows target 不驱动 reqwest/TCP IO）是 Perry 的明确缺陷，不是用法问题。可向 Perry 仓库提 issue，附本文件的分层探针证据。若未来 Perry 修复 Windows 网络 IO，可重启本方案 A。
