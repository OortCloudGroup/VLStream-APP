# VLStream iOS App Store 上架审计与提交清单

> 审计对象：`VLStream-APP/iOS/ios/`（Capacitor 8 壳，`com.oort.vlstream`）
> 审计日期：2026-10-28
> 结论：**当前无法直接上架**。存在若干硬性阻断项，其中代码级阻断已在本轮修复；剩余为账号 / 签名 / App Store Connect 元数据 / 审核策略类的人工项。

---

## 一、审计结论速览

| 类别 | 项 | 状态 | 说明 |
|---|---|---|---|
| 阻断（代码/配置） | 隐私清单 `PrivacyInfo.xcprivacy` 缺失 | ✅ 已修复 | Apple 自 2024-05-01 强制，缺失会被 ITMS-91053/91061 拒收 |
| 阻断（配置） | `Info.plist` 启用 `NSAllowsArbitraryLoads=true` | ✅ 已修复 | 全局明文 HTTP 放开，审核高风险；已改为按域名 `NSExceptionDomains` 放行 |
| 阻断（配置） | `Info.plist` 重复 `CFBundleDisplayName` | ✅ 已修复 | 原有两个值，已合并为 `VLStream` |
| 阻断（配置） | `UIRequiredDeviceCapabilities` 含 `armv7`（32 位） | ✅ 已修复 | 64 位应用不应声明 armv7，已移除 |
| 阻断（流水线） | `ExportOptions.plist` 缺失 | ✅ 已修复 | IPA 导出（app-store 方式）必需，已补模板 |
| 构建前置 | H5 离线包 `public/` 与 `capacitor.config.json` 未入库 | ⚠️ 需手动 | 仓库已 gitignore，必须本地 `cap copy` 后才包含 web 内容 |
| 构建前置 | `NativeBridgePlugin` 在 `cap sync` 后被丢弃 | ⚠️ 需手动 | 每次 sync 后需回填 `packageClassList`（见 iOS/README.md） |
| 账号/签名 | Apple Developer 付费账号 + 分发证书 + App Store 描述文件 | ⚠️ 需人工 | 当前工程为 `CODE_SIGN_STYLE=Automatic`，需选 Team |
| 元数据 | App Store Connect 隐私营养标签 / 隐私政策 URL | ⚠️ 需人工 | 登录类 App 必须填 |
| 审核风险 | 4.2 最低功能（H5 壳）+ 5.1 隐私 | ⚠️ 需评估 | Capacitor 包装 App 的固有风险，见下文 |
| 截图 | 支持 iPad（`TARGETED_DEVICE_FAMILY="1,2"`） | ⚠️ 需补 | 必须提供 iPad 12.9" 截图 |

---

## 二、本轮已修复的内容（已写入仓库）

1. **新增 `iOS/ios/App/App/PrivacyInfo.xcprivacy`**
   - 声明了 Capacitor 常用的「需说明理由」API：UserDefaults / FileTimestamp / SystemBootTime / DiskSpace。
     （⚠️ 2026-10-29 修正：原先误写 `NSPrivacyAccessedAPICategoryFileManager`，该值不是合法类别，上传被 ITMS-91054 拒收；合法类别仅 UserDefaults / FileTimestamp / SystemBootTime / DiskSpace / ActiveKeyboards 五个，已改为 FileTimestamp + C617.1。）
   - 声明了应用自身数据采集：位置、照片或视频、用户 ID（均用于 App 功能，非追踪）。
   - 已同步加入 `project.pbxproj` 的 App Target → Copy Bundle Resources，确保被打进 IPA。

2. **新增 `iOS/ios/App/ExportOptions.plist`**
   - `method=app-store`、`destination=upload`（归档后直传 App Store Connect）。
   - `teamID` 为占位符 `XXXXXXXXXX`，**必须替换为你的 10 位 Developer Team ID**。

3. **修正 `Info.plist`**
   - 移除全局 `NSAllowsArbitraryLoads`，改为仅对 `workup.oortcloudsmart.com` / `vlstream.oortcloudsmart.com` 放行（含 `NSExceptionAllowsInsecureHTTPLoads`，兼容自签/内部 CA 证书；若后端是公开可信证书，可删掉这两行例外）。
   - 合并重复的 `CFBundleDisplayName` 为 `VLStream`。
   - 移除 `UIRequiredDeviceCapabilities` 中的 `armv7`。
   - 已用 `plutil -lint` 校验通过。

> ⚠️ 安全提示（未改动，需产品决策）：`AppConfig.swift` 中硬编码了 `appSecret`（`3a97f4f6...`）。客户端密钥可被逆向提取，建议评估改为后端代理下发或短期令牌，但这属于架构层面，不影响上架技术校验。

---

## 三、构建前必做（否则 IPA 不含业务内容）

仓库里的 `App/App/public/`（H5 离线包）和 `App/App/capacitor.config.json` 在 `.gitignore` 中，**不在版本库内**。提交构建前必须在本机（macOS）执行：

```bash
cd vue3-h5
pnpm install
pnpm build:VLStreamCloud          # 产物 → vue3-h5/dist
npx cap copy ios                  # 拷 dist 到 iOS/ios/App/App/public/

# 若新增过官方插件，用 sync 替代 copy：
npx cap sync ios
# ⚠️ sync/copy 会重写 capacitor.config.json 的 packageClassList，
#    必须手动把 "NativeBridgePlugin" 加回数组首位（见 iOS/README.md）：
#    "packageClassList": ["NativeBridgePlugin","AppPlugin","CAPCameraPlugin","GeolocationPlugin"]
```

未完成 `cap copy` 时，IPA 内无 `public/`，App 打开是空白页——这是**功能性致命缺陷**，务必确认。

---

## 四、证书与签名（App Store 分发）

1. 拥有 **Apple Developer Program** 付费会员（¥688/年，企业/个人均可）。
2. 在 [developer.apple.com](https://developer.apple.com) 注册 **App ID** = `com.oort.vlstream`（与 `PRODUCT_BUNDLE_IDENTIFIER` 一致）。
3. 创建 **App Store 分发描述文件（Distribution Provisioning Profile）**，绑定该 App ID 与你的**分发证书**。
4. 在 Xcode 打开 `iOS/ios/App/App.xcodeproj` → Signing & Capabilities：
   - 选择你的 Team（自动签名会自动拉取描述文件）。
   - 确认 Signing Certificate = Apple Distribution。
5. 把 `ExportOptions.plist` 里的 `teamID` 改成实际 Team ID。

> 若仅是**企业内部**使用，请改用 **Apple Business Manager（ABM，未公开/定制分发）** 或 **企业开发者计划（In-House）**，可绕开公开商店 4.2 审核，且无需上架审核等待。

---

## 五、Xcode 归档与导出

```bash
cd iOS/ios/App
# 归档（Release）
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release \
  -archivePath build/App.xcarchive archive
# 导出 / 上传（依赖 ExportOptions.plist）
xcodebuild -exportArchive -archivePath build/App.xcarchive \
  -exportPath build/ipa -exportOptionsPlist ExportOptions.plist
```

- `destination=upload`：归档校验通过后直接上传 App Store Connect（自动走 Transporter）。
- 若想本地拿到 `.ipa` 先自查，把 `ExportOptions.plist` 的 `destination` 改为 `export`。
- 版本号规则：`MARKETING_VERSION`（如 `1.0`）与 `CURRENT_PROJECT_VERSION`（build，每次提交 +1）在 `project.pbxproj` 中，每次提审需递增 build 号。

---

## 六、App Store Connect 元数据清单（提交资料）

| 项目 | 要求 / 建议 |
|---|---|
| App 名称 | `VLStream`（与 `CFBundleDisplayName` 一致） |
| 副标题 | ≤ 30 字符，说明用途 |
| 隐私政策 URL | **强制**（登录类 App）。需可公网访问的隐私政策页 |
| 营销网址 / 支持网址 | 建议填，支持网址必填 |
| 描述 | 说明核心功能（设备接入、实时视频、地图定位、文件上传等），强调原生能力 |
| 关键词 | 视频监控 / 物联网 / 流媒体 等 |
| 分类 | 主分类「商务」或「工具」；副分类可选 |
| 年龄分级 | 依功能自评（含定位/相机，通常为 4+，若有 UGC 另议） |
| 版权 | 公司名 |
| 联系信息 | 审核联系人与电话（审核受阻时 Apple 会联系） |

### 截图规格（因支持 iPad，**两类都要**）
- **iPhone**：至少 6.7"（1290×2796）或 6.9"（1320×2868）；可选 6.5"（1242×2688）。
- **iPad**：12.9"（2048×2732）**必填**（因 `TARGETED_DEVICE_FAMILY="1,2"` 含 iPad）。
- 各尺寸 1–10 张，展示真实功能界面（登录后主流程）。`docs/vls/` 现有图标素材（VLS1/VLS2）不是截图，需另行准备。
- 可选 1280×720 / 1920×1080 预览视频（App 预览）。

---

## 七、隐私营养标签（Privacy Nutrition Labels）

必须与 `PrivacyInfo.xcprivacy` 中声明保持一致，在 App Store Connect「App 隐私」中填写：

| 数据类型 | 是否关联用户 | 用途 |
|---|---|---|
| 位置（精确） | 是 | App 功能（地图/定位） |
| 照片或视频 | 是 | App 功能（上传/保存） |
| 用户 ID | 是 | App 功能（登录态） |
| （若接入崩溃/分析 SDK）诊断 | 否 | 分析 |

如实际另有收集（如设备 ID、联系方式、使用数据），须如实补充，否则违反 Guideline 5.1。

---

## 八、其他合规项

- **加密出口合规**：App 使用 HTTPS/TLS（WKWebView），属「非豁免加密」。提交时在 App Store Connect 回答出口合规问题，或于 `Info.plist` 增加 `ITSAppUsesNonExemptEncryption=false`（若确认无豁免加密）以消除每次弹窗。
- **演示账号**：登录类 App，审核员需登录验证。务必在 App Store Connect 提供**可用的演示账号**（账号/密码/对应环境），否则会被 2.1 拒。
- **`CFBundleDevelopmentRegion`**：当前 `en`，中文 App 可改为 `zh-Hans`（非阻断，影响默认语言）。

---

## 九、审核风险与规避（重点）

1. **Guideline 4.2 最低功能 / 4.7 HTML5 App**
   Capacitor 本质是 WebView 壳，纯网站包装极易被拒。本工程已有原生相机、定位、文件上传等集成，需在提审时突出「原生能力 + 业务深度」，避免被判定为「只是个移动网页」。若是 B2B/内部应用，强烈建议走 **ABM 未公开分发**或企业证书，规避公开审核。
2. **Guideline 5.1.1 隐私**
   相机/相册/定位的描述文案已具备且合理；务必提供隐私政策 URL，并在 App 内「设置/关于」提供可点击入口。
3. **Guideline 2.1 完整性**
   确保演示账号可登录、功能完整、无崩溃/空白页（再次强调 `cap copy` 必须执行）。

---

## 十、最终检查清单（提审前逐项勾选）

- [ ] `pnpm build:VLStreamCloud` + `npx cap copy ios` 已执行，`public/` 含最新离线包
- [ ] `capacitor.config.json` 的 `packageClassList` 已回填 `NativeBridgePlugin`
- [ ] `PrivacyInfo.xcprivacy` 已进 App Target（已配）
- [ ] `ExportOptions.plist` 的 `teamID` 已替换
- [ ] Xcode 签名 Team / Distribution 证书 / App Store 描述文件就绪
- [ ] `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` 已按本次提审设定
- [ ] 本地 `xcodebuild archive` 通过、Organizer 无警告（尤其隐私清单/ATS）
- [ ] App Store Connect：名称/描述/关键词/分类/年龄分级/网址 已填
- [ ] 隐私营养标签已填且与隐私清单一致
- [ ] 隐私政策 URL 可访问且在 App 内有入口
- [ ] iPhone + iPad 截图（及可选预览视频）已上传
- [ ] 演示账号（含环境说明）已提供
- [ ] 出口合规问题已回答
- [ ] 确认分发渠道：公开 App Store / ABM 未公开 / 企业证书

---

## 附：关键文件路径

- 隐私清单：`iOS/ios/App/App/PrivacyInfo.xcprivacy`
- 导出配置：`iOS/ios/App/ExportOptions.plist`
- 应用配置：`iOS/ios/App/App/Info.plist`、`iOS/ios/App/App/AppConfig.swift`
- 桥接回填说明：`iOS/README.md`
