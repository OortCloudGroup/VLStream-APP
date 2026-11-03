# VLStream · App Store 上架文案与字段说明

> 适用：VLStream iOS/iPadOS 客户端（`com.oort.vlstream`，Capacitor 8 壳）
> 用途：App Store Connect 各字段的**成稿文案**，直接复制粘贴；标【需确认】的按实际核对。
> 配套文件：`docs/vlstream-privacy-policy.html`（隐私政策）、`docs/screenshots/`（截图）

---

## 一、应用基础信息（App 信息）

| 字段 | 建议值 | 说明 |
|---|---|---|
| **名称（App 名称）** | `VLStream` | ≤30 字符，与 `CFBundleDisplayName` 一致 |
| **副标题** | `视频物联，实时尽在掌握` | ≤30 字符（11 字） |
| **主类别** | `商务`（Business） | B2B 设备管理平台客户端 |
| **副类别** | `工具`（Utilities） | 可选 |
| **内容版权** | `奥尔特云（深圳）智慧科技有限公司` | 与运营主体一致 |
| **隐私政策网址** | `https://oortcloudsmart.com/privacypolicy_vlstream.html` | ✅ 已上线可访问（HTTP 200，2026-10-29 验证）；App 内「关于 → 隐私政策」入口已指向同一地址 |
| **技术支持网址** | `https://www.oortcloudsmart.com/support`【需确认】 | 能打开的支持页即可 |
| **营销网址（可选）** | `https://www.oortcloudsmart.com` | 官网 |
| **关键词** | 见下方 | ≤100 字符 |

**关键词（成稿，43 字符）**：
```
视频监控,物联网,设备管理,摄像头,实时视频,告警,地图定位,流媒体,远程监控,安防,智能安防,视频云
```

---

## 二、描述（Description，成稿约 480 字）

```
VLStream 是奥尔特云（深圳）智慧科技有限公司推出的视频物联管理平台客户端，为企业和个人用户提供设备接入、实时视频、智能告警与位置管理的一站式移动端解决方案。

【实时视频】
接入平台摄像头与流媒体设备，随时随地查看实时画面与历史录像，支持多路视频切换与全屏播放。

【设备管理】
统一管理工作台内的监控、传感等物联设备，设备状态一目了然，支持快速添加与配置。

【智能告警】
设备事件与告警消息实时推送，异常情况第一时间掌握，支持按时间与类型筛选查看。

【地图定位】
内置地图组件，直观展示设备与车辆位置，支持轨迹回放，随时掌握现场动态。

【文件管理】
支持拍照、相册选图与文件上传，现场资料即时回传平台。

【数据安全】
全程 HTTPS 加密传输，账号密码加密存储，并已通过 ICP 备案（粤ICP备19160414号-8A），符合国家相关法规要求。

如需开通企业账号或批量接入设备，请联系客服：13723775143（工作日 9:00-18:00）。
```

---

## 三、推广文本（Promotional Text，≤170 字符，可随时更新不重新审核）

```
设备接入、实时视频、智能告警、地图定位——VLStream 让你的物联设备尽在掌握。
```

## 四、新功能（What's New，首次提交版本 1.0）

```
VLStream 首个正式版本：
• 实时视频查看与播放
• 设备管理与状态监控
• 事件告警消息
• 地图定位与轨迹
• 文件拍照上传
• 支持iPhone与iPad
```

---

## 五、年龄分级问卷（内容描述）

VLStream 无 UGC、无聊天、无浏览器自由上网（WKWebView 仅加载公司自有域名），问卷全部选「无」：

| 问题 | 答案 |
|---|---|
| 卡通/幻想暴力、现实暴力、性内容、裸体、色情、脏话、毒品、恐怖主题 | 均为「无」 |
| 医疗信息 | 无 |
| 赌博（含模拟） | 无 |
| 无限制访问网络（Unrestricted Web Access） | **否**（仅加载自家域名） |
| 用户生成内容（UGC） | **否** |
| 年龄恐怖/惊吓主题 | 无 |

→ 预期分级 **4+**。

---

## 六、App 隐私（隐私营养标签）

须与 `PrivacyInfo.xcprivacy` 声明一致（不用于追踪）：

| 数据类型 | 收集 | 关联身份 | 用途 |
|---|---|---|---|
| 精确位置 | 是 | 是 | App 功能（地图/定位/轨迹） |
| 照片或视频 | 是 | 是 | App 功能（上传/保存） |
| 用户 ID | 是 | 是 | App 功能（登录态） |

标签勾选路径：App 隐私 → 开始 → 「不收集用于追踪」→ 按上表逐项登记。

---

## 七、审核信息（App Review Information）

| 字段 | 值 |
|---|---|
| 联系人姓名 | 李超【需确认】 |
| 联系电话 | 13723775143【需确认】 |
| 联系邮箱 | 【需确认，建议公司邮箱】 |
| **备注（Notes）** | 见下方成稿 |
| **演示账号** | 用户名 `lichao`，密码 `12345678` |

**审核备注（成稿）**：
```
This app is an enterprise IoT video management platform client.

Demo account:
  Username: lichao
  Password: 12345678

The app connects to our own backend at vlstream.oortcloudsmart.com (self-hosted servers, HTTPS). After login, you will see the workbench, live video, event alerts, map and profile tabs.

Account deletion: per Guideline 5.1.1(v), since accounts are created offline by our sales team (no in-app registration), deletion is handled by our customer service (phone: 13723775143, weekdays 9:00-18:00, China Standard Time). The entry is in the app: "我的" (Profile) → "设置" (Settings) → "注销账号" (Delete Account), which shows the phone number and dials it when confirmed.

The app is a hybrid app (Capacitor) with native camera, geolocation and file-upload integrations.
```

---

## 八、版本发布信息

| 字段 | 值 |
|---|---|
| 版本号 | 1.0（`MARKETING_VERSION`，与 Xcode 一致） |
| Build | 递增（`CURRENT_PROJECT_VERSION`） |
| 发布地区 | 中国大陆（如需海外另行评估） |
| 分级声明（出口合规） | 见下 |
| 版权 | 奥尔特云（深圳）智慧科技有限公司 |
| ICP 备案号（App 备案） | 粤ICP备19160414号-8A（App Store Connect「App 信息 → 中国大陆 ICP 备案号」必填） |

**出口合规成稿答案**：
- Q: Does your app use encryption? → **Yes**
- Q: Does it qualify for exemptions? → **Yes**（仅使用 HTTPS/TLS 标准加密，且密钥由系统/App 自有服务管理，属于 Exempt 品类 5A992）
- 建议同时在 `Info.plist` 加 `ITSAppUsesNonExemptEncryption=false` 消除每次上传弹窗（当前未加，可后补）

---

## 九、提审前核对（本文件相关）

- [x] 隐私政策已托管且公网可访问：`https://oortcloudsmart.com/privacypolicy_vlstream.html`
- [x] App 内「关于」页已新增「隐私政策」入口（aboutPage.vue，指向同一 URL）——⚠️ 需重新构建 H5 + `cap copy` 后才生效
- [ ] 审核联系人与电话已按实际填写
- [ ] 演示账号在单租户环境可正常登录（截图环境已验证）
- [x] iPhone 截图两套（均已备好）：
  - **6.1/6.3 英寸栏（1206×2622）**：`docs/screenshots/iphone63/` 5 张 —— ASC 当前栏位（2556×1179 / 2622×1206 同属此位）
  - 6.9 英寸栏（1320×2868）：`docs/screenshots/` 下 01/03/04/05/06 —— 若出现 6.9 栏目可用
- [x] iPad 13"（3 张，2064×2752）：`docs/screenshots/` 下 02/07/08

---

## 附：与 NetBird（OortcloudNet）提审的复用关系

公司主体、支持/营销网址、出口合规答法、5.1.1(v) 账号删除话术与上次 NetBird 提审一致；差异仅在于：本 App 是登录制（需演示账号）、类别为商务、有 ICP 备案号必填项。
