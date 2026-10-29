# Perry 原生重写 — Windows 单端验证原型 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 `perry/ui` 在 Windows 上编译出一个可运行的原生 exe，伪登录 → 设备列表 → 设备详情 → Leaflet 地图岛，以此证实/证伪方案 A 的三个核心假设。

**Architecture:** 三层 —— 原生壳（perry/ui）+ 共享 TS 核心（复用 vue3-h5-ts 的 api/types，HTTP 用 node:https 自写 adapter，存储用 node:fs）+ WebView 地图岛（运行时写盘 + file://）。

**Tech Stack:** Perry 0.5.1265 / TypeScript（严格）/ perry/ui（Win32 后端）/ node:https + node:fs（Perry stdlib）。

**关键实测前提（已用探针锁定，非推断）：**
- `fetch` 全局在 Windows **挂起** → 用 `node:https`/`node:http`。
- keychain/preferences 在 Windows 是 **stub** → 用 `node:fs` 文件。
- `--embed` 在 Windows host **报错** → 地图 HTML 运行时用 `node:fs` 写盘 + `file://`。
- `TabBar` 在 Windows 是 **no-op stub** → 用 `NavStack`。
- 编译命令固定模板：`perry compile <file>.ts -o Windows/<name>.exe`。首次因 auto-optimize 重建 stdlib 约 10 分钟，之后命中缓存秒级。

**环境：** 工作目录 `F:\work\VLStream-APP`，perry 在 PATH（`C:\Users\OORT\.cargo\bin\perry.exe`）。原项目 `vue3-h5-ts/` 全程只读参考。

---

## 文件结构

```
perry-app/
├── main.ts              # Perry 入口：App + NavStack 装配 4 页
├── http.ts              # ★ node:https 实现 request()，对齐 service.ts 语义
├── store.ts             # ★ node:fs 文件持久化，对齐 cache.ts（getToken/setToken/removeToken）
├── config.ts            # URL/网关/headers（移植 config/index.ts + AppConfig.ts）
├── api/
│   └── device.ts        # 从 vue3-h5-ts 迁移，仅改 import 路径，commonFunc 不动
├── pages/
│   ├── login.ts         # 伪登录页（写死 token 按钮）
│   ├── deviceList.ts    # 设备列表（LazyVStack）— H1
│   ├── deviceDetail.ts  # 设备详情
│   └── map.ts           # WebView 地图岛 — H3
└── web-assets/
    └── map.html         # Leaflet 地图模板（运行时拷出 + 填坐标）
Windows/
└── VLStreamCloud.exe    # 最终产物（每步增量验证）
```

每个文件单一职责；`http.ts`/`store.ts` 是适配层（隔离 Perry 与业务），业务页只依赖它们和 `api/`。

---

## Task 1: 工程骨架 + 最小可运行窗口

**Files:**
- Create: `perry-app/main.ts`

- [ ] **Step 1: 写最小入口 main.ts**

```typescript
import { App, VStack, Text, Button } from 'perry/ui'

let n = 0
App({
  title: 'VLStreamCloud',
  width: 390,
  height: 780,
  body: VStack([
    Text('Perry 原型已启动', 'status'),
    Button('+1', () => {
      n++
      console.log('clicked', n)
    })
  ])
})
```

- [ ] **Step 2: 编译到 Windows 目录**

Run:
```bash
cd /f/work/VLStream-APP && perry compile perry-app/main.ts -o Windows/VLStreamCloud.exe
```
Expected: 首次约 10 分钟（auto-optimize 重建 stdlib）；末尾 `Wrote executable: ...Windows/VLStreamCloud.exe` + `Binary size:`。EXIT 0。

- [ ] **Step 3: 运行验证（10s 超时防挂）**

Run:
```bash
cd /f/work/VLStream-APP && timeout 10 ./Windows/VLStreamCloud.exe
```
Expected: 弹出原生窗口，标题 "VLStreamCloud"，显示文字 + 按钮；点按钮控制台打印 `clicked 1`。EXIT 0 或被 timeout 干掉（窗口存在即通过）。

- [ ] **Step 4: 提交**

```bash
cd /f/work/VLStream-APP && git add perry-app/main.ts && git commit -m "feat: perry 原型最小可运行窗口"
```

---

## Task 2: 存储适配层（store.ts，对齐 cache.ts）— 支撑 H2

**Files:**
- Create: `perry-app/store.ts`
- Test: `perry-app/store.test.ts`（运行探针式验证）

- [ ] **Step 1: 写 store.ts**

用 `node:fs` 持久化到 `./perry-app-data/state.json`，提供与 vue3-h5-ts `cache.ts` 同名的 `getToken/setToken/removeToken`，外加 `tenantId`。对齐 `IApiResponseData` 等用到的字段。

```typescript
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

interface PersistState {
  token: string
  tenantId: string
}

const DATA_DIR = join(process.cwd(), 'perry-app-data')
const STATE_FILE = join(DATA_DIR, 'state.json')

function readAll(): PersistState {
  try {
    if (!existsSync(STATE_FILE)) return { token: '', tenantId: '' }
    const raw = readFileSync(STATE_FILE, 'utf8')
    const obj = JSON.parse(raw)
    return { token: String(obj.token || ''), tenantId: String(obj.tenantId || '') }
  } catch {
    return { token: '', tenantId: '' }
  }
}

function writeAll(state: PersistState): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  writeFileSync(STATE_FILE, JSON.stringify(state), 'utf8')
}

export function getToken(): string {
  return readAll().token
}

export function setToken(token: string): void {
  const all = readAll()
  all.token = token
  writeAll(all)
}

export function removeToken(): void {
  writeAll({ token: '', tenantId: readAll().tenantId })
}

export function getTenantId(): string {
  return readAll().tenantId
}

export function setTenantId(tenantId: string): void {
  const all = readAll()
  all.tenantId = tenantId
  writeAll(all)
}
```

- [ ] **Step 2: 写验证探针 store.test.ts**

```typescript
import { setToken, getToken, removeToken, setTenantId, getTenantId } from './store'

setToken('')
setToken('abc-123')
setTenantId('tenant-x')
console.log('token get =', getToken())            // 期望 abc-123
console.log('tenant get =', getTenantId())        // 期望 tenant-x
removeToken()
console.log('token after remove =', JSON.stringify(getToken()))  // 期望 ""
console.log('tenant retained =', getTenantId())   // 期望 tenant-x（保留）
```

- [ ] **Step 3: 编译 + 运行验证**

Run:
```bash
cd /f/work/VLStream-APP && perry compile perry-app/store.test.ts -o Windows/store-test.exe && timeout 10 ./Windows/store-test.exe
```
Expected: 输出 `token get = abc-123`、`tenant get = tenant-x`、`token after remove = ""`、`tenant retained = tenant-x`。EXIT 0。

- [ ] **Step 4: 清理测试产物 + 提交**

```bash
cd /f/work/VLStream-APP && rm -f Windows/store-test.exe perry-app/store.test.ts && git add perry-app/store.ts && git commit -m "feat: node:fs 持久化存储适配层(store.ts)"
```

---

## Task 3: 配置层（config.ts）

**Files:**
- Create: `perry-app/config.ts`

- [ ] **Step 1: 写 config.ts**

移植 vue3-h5-ts 的 `config/index.ts` + `config/AppConfig.ts`，去掉运行时 Cordova 注入（原型用写死值）。

```typescript
interface AppConfig {
  headers: Record<string, any>
  URL: string
  gateWay: string
  token: string
}

const config: AppConfig = {
  headers: {},
  frontURLStr: '/front'
} as any

config.URL = 'http://183.62.103.20:21410/'
config.token = ''
config.gateWay = 'bus/'

export const APP_APPID = '747aa0fa18d047c8b526e242142e0a6c'
export const APP_SECRETKEY = '3a97f4f65b204a3a96071746fa42936a'
export const APP_REQUESTTYPE = 'app'

export default config
```

- [ ] **Step 2: 提交**

```bash
cd /f/work/VLStream-APP && git add perry-app/config.ts && git commit -m "feat: 配置层(移植 config,去掉 Cordova 注入)"
```

---

## Task 4: HTTP 适配层（http.ts，用 node:https）— H2 核心

**Files:**
- Create: `perry-app/http.ts`
- Test: `perry-app/http.test.ts`

- [ ] **Step 1: 写 http.ts**

用 `node:https`/`node:http` 实现 `request()`，对齐 vue3-h5-ts `service.ts` 的关键语义：注入 `AccessToken`/`Content-Type`/`Config.headers`；响应里 `code !== 200` 时 `showToast(msg)`，`无效的accesstoken` 时 `removeToken` 并跳登录。`commonFunc` 不变。

```typescript
import { get as httpsGet } from 'node:https'
import { get as httpGet } from 'node:http'
import type { IncomingMessage } from 'node:http'
import config from './config'
import { getToken, removeToken } from './store'
import { showToast } from 'perry/ui'

export interface IApiResponseData {
  code: number
  msg?: string
  data?: any
  [k: string]: any
}

export interface RequestOptions {
  url: string
  method?: string
  data?: any
  params?: any
  headers?: Record<string, string>
  responseType?: string
}

function buildUrl(base: string, params?: any): string {
  if (!params) return base
  const sp = new URLSearchParams()
  for (const k of Object.keys(params)) sp.append(k, params[k] == null ? '' : String(params[k]))
  const sep = base.includes('?') ? '&' : '?'
  return base + sep + sp.toString()
}

function readBody(res: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = ''
    res.on('data', (c) => { body += c })
    res.on('end', () => resolve(body))
  })
}

export function request<T = any>(opts: RequestOptions): Promise<T> {
  const method = (opts.method || 'post').toUpperCase()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
    AccessToken: getToken(),
    ...(opts.headers || {})
  }
  const lower = (config.URL || '').startsWith('https') ? httpsGet : httpGet
  const finalUrl = method === 'GET' || method === 'DELETE' ? buildUrl(opts.url, opts.data) : opts.url
  let payload = ''
  if (method !== 'GET' && method !== 'DELETE' && opts.data != null) {
    payload = typeof opts.data === 'string' ? opts.data : JSON.stringify(opts.data)
  }
  return new Promise((resolve, reject) => {
    const u = new URL(finalUrl)
    const req = lower(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method,
        headers: Object.assign({}, headers, payload ? { 'Content-Length': Buffer.byteLength(payload).toString() } : {})
      },
      async (res) => {
        const text = await readBody(res)
        if (opts.responseType === 'blob') {
          resolve(text as any)
          return
        }
        let parsed: any = text
        try { parsed = JSON.parse(text) } catch { /* 非 JSON,保留原文 */ }
        const data = parsed as IApiResponseData
        if (data && typeof data.code === 'number' && data.code !== 200) {
          const msg = data.msg || ''
          if (msg.includes('无效的accesstoken') || msg.includes('accessToken无效') || msg.includes('token失效')) {
            removeToken()
            goLogin()
          } else if (msg) {
            showToast(msg)
          }
        }
        resolve(parsed as T)
      }
    )
    req.on('error', (e: Error) => {
      showToast(e.message || '网络错误')
      reject(e)
    })
    if (payload) req.write(payload)
    req.end()
  })
}

// 跳登录：原型里切回 login 页（main.ts 注入）
let _goLogin: () => void = () => {}
export function setGoLogin(fn: () => void): void { _goLogin = fn }
function goLogin(): void { _goLogin() }
```

> 注意：`request` 默认 GET/DELETE 自动转 params（对齐 `commonFunc` 的 `isParams` 行为由调用方在 api 层处理）。`setGoLogin` 由 main.ts 在启动时注入切页回调。

- [ ] **Step 2: 写验证探针 http.test.ts**

```typescript
import { request } from './http'
import { setToken } from './store'

// 命中一个公开 GET 接口验证链路（不依赖鉴权）
request<any>({ url: 'https://httpbin.org/get', method: 'GET' })
  .then((j) => {
    console.log('http ok, host =', (j as any)?.headers?.Host || 'unknown')
    console.log('user-agent present =', !!(j as any)?.headers?.['User-Agent'])
  })
  .catch((e) => console.log('http err =', String(e)))
```

- [ ] **Step 3: 编译 + 运行验证**

Run:
```bash
cd /f/work/VLStream-APP && perry compile perry-app/http.test.ts -o Windows/http-test.exe && timeout 15 ./Windows/http-test.exe
```
Expected: 输出 `http ok, host = httpbin.org`、`user-agent present = true/false`（值不关键，能拿到响应即通过）。EXIT 0。**若挂起无输出 → H2 阻塞，记录后降级（见 Task 4 末尾）。**

- [ ] **Step 4: 清理测试产物 + 提交**

```bash
cd /f/work/VLStream-APP && rm -f Windows/http-test.exe perry-app/http.test.ts && git add perry-app/http.ts && git commit -m "feat: node:https HTTP 适配层(http.ts)对齐 service.ts"
```

> **H2 降级预案：** 若 `node:https` 在 Windows 运行时同样挂起，则 H2 在当前 Perry 版本不可行。记录证据，暂停后续业务页，spec 标记 H2=FAIL，回到用户决策是否退回 Tauri。

---

## Task 5: 迁移 api/device.ts（验证复用成本）— H2 收尾

**Files:**
- Create: `perry-app/api/device.ts`

- [ ] **Step 1: 从 vue3-h5-ts 拷贝并改 import**

从 `vue3-h5-ts/src/api/VLStreamCloud/device.ts` 整体复制到 `perry-app/api/device.ts`，仅改两处 import：
- `import { request } from '@/utils/service'` → `import { request } from '../http'`
- `import config from '@/config'` → `import config from '../config'`

`commonFunc` 函数体、所有 `export function`（getDeviceList / getDeviceById / getDeviceDetail / ... PTZ 控制等）**一律不动**。

- [ ] **Step 2: 编译验证（不运行，只确认类型/解析通过）**

Run:
```bash
cd /f/work/VLStream-APP && perry compile perry-app/api/device.ts -o Windows/device-check.exe
```
Expected: `Wrote executable: ...device-check.exe`。EXIT 0。这证明 api 层零业务改动即可纳入 Perry 编译图。

- [ ] **Step 3: 清理 + 提交**

```bash
cd /f/work/VLStream-APP && rm -f Windows/device-check.exe && git add perry-app/api/device.ts && git commit -m "feat: 迁移 api/device.ts(commonFunc 不动,仅改 import)"
```

---

## Task 6: 导航骨架（NavStack + 4 页占位）

**Files:**
- Create: `perry-app/pages/login.ts`
- Create: `perry-app/pages/deviceList.ts`
- Create: `perry-app/pages/deviceDetail.ts`
- Create: `perry-app/pages/map.ts`
- Modify: `perry-app/main.ts`

- [ ] **Step 1: 写 4 个占位页面**

`pages/login.ts`：
```typescript
import type { Widget } from 'perry/ui'
import { VStack, Text, Button } from 'perry/ui'
import { setToken } from '../store'
import { setGoLogin } from '../http'

export function LoginPage(navigate: (name: string) => void): Widget {
  return VStack([
    Text('伪登录', 'login-title'),
    Button('写入 token 并进入设备列表', () => {
      setToken('DEV-FAKE-TOKEN-123')
      navigate('deviceList')
    })
  ])
}

// main.ts 调用 setGoLogin 注入"回登录页"
export function bindLoginNav(navigate: (name: string) => void): void {
  setGoLogin(() => navigate('login'))
}
```

`pages/deviceList.ts`（占位，Task 7 实现）：
```typescript
import type { Widget } from 'perry/ui'
import { VStack, Text } from 'perry/ui'

export function DeviceListPage(navigate: (name: string) => void): Widget {
  return VStack([Text('设备列表（占位）', 'dev-list-ph')])
}
```

`pages/deviceDetail.ts`：
```typescript
import type { Widget } from 'perry/ui'
import { VStack, Text, Button } from 'perry/ui'

export function DeviceDetailPage(navigate: (name: string) => void): Widget {
  return VStack([
    Text('设备详情（占位）', 'dev-detail-ph'),
    Button('查看地图', () => navigate('map'))
  ])
}
```

`pages/map.ts`（占位，Task 8 实现）：
```typescript
import type { Widget } from 'perry/ui'
import { VStack, Text } from 'perry/ui'

export function MapPage(navigate: (name: string) => void): Widget {
  return VStack([Text('地图（占位）', 'map-ph')])
}
```

- [ ] **Step 2: 重写 main.ts 为 NavStack 装配**

```typescript
import { App, NavStack, State, VStack } from 'perry/ui'
import { LoginPage, bindLoginNav } from './pages/login'
import { DeviceListPage } from './pages/deviceList'
import { DeviceDetailPage } from './pages/deviceDetail'
import { MapPage } from './pages/map'

const route = State<string>('login')

function navigate(name: string): void {
  route.set(name)
}

bindLoginNav(navigate)

App({
  title: 'VLStreamCloud',
  width: 390,
  height: 780,
  body: NavStack(route, [
    { name: 'login', body: LoginPage(navigate) },
    { name: 'deviceList', body: DeviceListPage(navigate) },
    { name: 'deviceDetail', body: DeviceDetailPage(navigate) },
    { name: 'map', body: MapPage(navigate) }
  ])
})
```

- [ ] **Step 3: 编译 + 运行验证导航**

Run:
```bash
cd /f/work/VLStream-APP && perry compile perry-app/main.ts -o Windows/VLStreamCloud.exe && timeout 10 ./Windows/VLStreamCloud.exe
```
Expected: 窗口显示登录页，点按钮后画面切到"设备列表（占位）"。EXIT 0 或被 timeout 截断。**导航可切换即通过**。

- [ ] **Step 4: 提交**

```bash
cd /f/work/VLStream-APP && git add perry-app/pages perry-app/main.ts && git commit -m "feat: NavStack 导航骨架 + 4 页占位"
```

---

## Task 7: 设备列表页（LazyVStack，接真接口）— H1

**Files:**
- Modify: `perry-app/pages/deviceList.ts`

- [ ] **Step 1: 写真实设备列表**

用 `getDeviceList`（Task 5 迁移的）拉数据，`LazyVStack` 渲染，点击进入详情。响应是 `IApiResponseData`（code/data）。注意：无真 token 时接口大概率返回 401 → toast，列表为空，但这恰恰证明"原生 UI 能发起请求并渲染"（H1 关注的是 UI 渲染能力，不是接口成败）。

```typescript
import type { Widget } from 'perry/ui'
import { VStack, Text, Button, LazyVStack, lazyvstackUpdate, showToast } from 'perry/ui'
import { State } from 'perry/ui'
import { getDeviceList } from '../api/device'

interface DeviceItem {
  id: string | number
  name?: string
  status?: string
}

let listHandle: Widget | null = null
let devices: DeviceItem[] = []
const count = State<number>(0)

function row(index: number): Widget {
  const d = devices[index]
  return VStack([
    Text(d?.name || `设备 ${d?.id ?? index}`, `dev-${index}`),
    Text(`状态: ${d?.status || '-'}`)
  ])
}

export function DeviceListPage(navigate: (name: string) => void): Widget {
  return VStack([
    Text('设备列表', 'dev-list-title'),
    Button('刷新', () => {
      showToast('加载中...')
      getDeviceList({ current: 1, size: 20 })
        .then((res: any) => {
          const arr: DeviceItem[] = (res && (res.data || res.records)) || []
          devices = arr
          count.set(arr.length)
          if (listHandle) lazyvstackUpdate(listHandle, arr.length)
          showToast(`加载 ${arr.length} 条`)
        })
        .catch((e: any) => {
          console.log('device list err =', String(e))
          showToast('加载失败(可能未鉴权)')
        })
    }),
    LazyVStack(0, row)
  ])
}
```

- [ ] **Step 2: 把 LazyVStack 句柄接上（修正 main 或本页）**

`LazyVStack` 的 `count` 应驱动渲染。上面用 `LazyVStack(0, row)` 初始 0，刷新时 `lazyvstackUpdate(handle, n)`。为拿到 handle，把 LazyVStack 创建改为：
```typescript
const lv = LazyVStack(0, row)
listHandle = lv
```
并在 `DeviceListPage` 的 VStack 末尾放入 `lv`。完整函数体整合：把上面 `LazyVStack(0, row)` 替换为先赋值再引用。

- [ ] **Step 3: 编译 + 运行验证**

Run:
```bash
cd /f/work/VLStream-APP && perry compile perry-app/main.ts -o Windows/VLStreamCloud.exe && timeout 12 ./Windows/VLStreamCloud.exe
```
Expected: 登录 → 进列表 → 点"刷新"→ 出现 toast（"加载中..."→"加载 N 条"或"加载失败(可能未鉴权)"）。**列表能渲染任意条数即 H1 通过**（即便因无真 token 返回 0 条，也证明 UI+请求链路通）。

- [ ] **Step 4: 提交**

```bash
cd /f/work/VLStream-APP && git add perry-app/pages/deviceList.ts && git commit -m "feat: 设备列表页 LazyVStack 接真接口(H1)"
```

---

## Task 8: 地图岛（WebView + node:fs 写盘）— H3

**Files:**
- Create: `perry-app/web-assets/map.html`
- Modify: `perry-app/pages/map.ts`

- [ ] **Step 1: 写 Leaflet 地图模板 map.html**

占位符 `__LAT__/__LNG__` 由运行时替换。引 CDN Leaflet（原型联网加载，离线是后续 YAGNI）。

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;height:100%;}</style>
</head>
<body>
<div id="map"></div>
<script>
  var lat = __LAT__, lng = __LNG__;
  var map = L.map('map').setView([lat, lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker([lat, lng]).addTo(map).bindPopup('设备位置').openPopup();
  window.__addMarker = function(la, ln, label) {
    L.marker([la, ln]).addTo(map).bindPopup(label || '').openPopup();
  };
</script>
</body>
</html>
```

- [ ] **Step 2: 写 map.ts（写盘 + WebView + evaluateJs）**

运行时把模板写到 `perry-app-data/map.html`（坐标替换），WebView 用 `file://` 加载，`onLoaded` 后 `webviewEvaluateJs` 加额外标注验证通信。

```typescript
import type { Widget } from 'perry/ui'
import { VStack, Text, WebView, webviewEvaluateJs, showToast } from 'perry/ui'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

const DATA_DIR = join(process.cwd(), 'perry-app-data')

function writeMapHtml(lat: number, lng: number): string {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
  const tplPath = join(__dirname, 'web-assets', 'map.html')
  let tpl = ''
  try {
    tpl = readFileSync(tplPath, 'utf8')
  } catch {
    // 产物目录无源模板时用内联兜底
    tpl = INLINE_MAP_TPL
  }
  const html = tpl.replace(/__LAT__/g, String(lat)).replace(/__LNG__/g, String(lng))
  const out = join(DATA_DIR, `map.html`)
  writeFileSync(out, html, 'utf8')
  return out
}

const INLINE_MAP_TPL = `<!DOCTYPE html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>html,body,#map{margin:0;height:100%;}</style></head><body><div id="map"></div><script>var lat=__LAT__,lng=__LNG__;var m=L.map('map').setView([lat,lng],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m);L.marker([lat,lng]).addTo(m).bindPopup('设备位置').openPopup();window.__addMarker=function(la,ln,t){L.marker([la,ln]).addTo(m).bindPopup(t||'').openPopup();};</script></body></html>`

export function MapPage(navigate: (name: string) => void): Widget {
  const filePath = writeMapHtml(39.9042, 116.4074) // 默认北京
  const wv = WebView({
    url: 'file:///' + filePath.replace(/\\/g, '/'),
    onLoaded: () => {
      showToast('地图加载完成')
      webviewEvaluateJs(wv, 'window.__addMarker ? window.__addMarker(39.95, 116.42, "通信测试标注") : "no-fn"', (r) => {
        console.log('evaluateJs result =', r)
        showToast('通信回执: ' + (r || '(空)'))
      })
    },
    onError: (code, msg) => {
      showToast('地图错误: ' + code + ' ' + msg)
    }
  })
  return VStack([
    Text('设备地图', 'map-title'),
    wv
  ])
}
```

- [ ] **Step 3: 编译 + 运行验证**

Run:
```bash
cd /f/work/VLStream-APP && perry compile perry-app/main.ts -o Windows/VLStreamCloud.exe && timeout 15 ./Windows/VLStreamCloud.exe
```
Expected: 登录 → 列表 → 详情 → 点"查看地图" → 出现地图页，WebView 显示 Leaflet 瓦片图 + 北京标注；加载后 toast "地图加载完成" + "通信回执: ...". **地图显示 + 通信回执非报错即 H3 通过**。若 `file://` 被 WebView2 拦或 Leaflet CDN 加载失败 → 记录为 H3 部分通过/失败。

- [ ] **Step 4: 提交**

```bash
cd /f/work/VLStream-APP && git add perry-app/web-assets/map.html perry-app/pages/map.ts && git commit -m "feat: 地图岛 WebView + node:fs 写盘 + evaluateJs 通信(H3)"
```

---

## Task 9: 验收与结论记录

**Files:**
- Create: `docs/superpowers/specs/2026-08-02-perry-prototype-verdict.md`

- [ ] **Step 1: 全链路跑一遍**

Run:
```bash
cd /f/work/VLStream-APP && perry compile perry-app/main.ts -o Windows/VLStreamCloud.exe && timeout 20 ./Windows/VLStreamCloud.exe
```
逐项核对：
- 登录页写 token → 列表页（H1）
- 列表刷新触发 getDeviceList（H2）
- 详情 → 地图显示 Leaflet + 通信回执（H3）

- [ ] **Step 2: 记录三假设结论**

写 `verdict.md`：H1/H2/H3 各一个结论（通过/部分/失败）+ 证据（控制台输出、行为）+ 产物体积。给出方案 A 是否推进的明确建议。

- [ ] **Step 3: 提交**

```bash
cd /f/work/VLStream-APP && git add docs/superpowers/specs/2026-08-02-perry-prototype-verdict.md Windows/VLStreamCloud.exe && git commit -m "docs: 原型三假设验收结论"
```

---

## 假设→任务映射（自检）

- **H1（原生 UI 承载列表/表单/详情）** → Task 6（导航骨架）+ Task 7（设备列表 LazyVStack）
- **H2（api 层低成本迁移）** → Task 4（http.ts）+ Task 5（迁移 device.ts 零改动）
- **H3（WebView 承载 Leaflet + 通信）** → Task 8（地图岛）

每假设都有独立验证步骤和降级预案。spec 的 8 节"非目标"均不在本计划内（无 Android/iOS、无真 SSO、无 Vant/VForm/ECharts/i18n 迁移）。
