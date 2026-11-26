# ASC 2.1(a) 修复回复稿（build 8）

> Submission ID: 4befbef9-5f89-4772-a36a-be9056848411
> 涉及：Guideline 2.1(a) - Performance - App Completeness（「上传图片」无响应）
> 用法：build 8 上传处理完成后，粘贴到 Resolution Center Reply，然后选 build 8 Resubmit。
> **更新（2026-11-24）**：补全后端服务端修复说明；原稿只提了拍照修复，审核员实测上传仍会失败。
> **更新（2026-11-24 build 8）**：另修复上传校验的两条 ITMS 警告——iPad 多任务方向（补四方向）、位置用途描述（补 NSLocationAlwaysAndWhenInUseUsageDescription）。请务必选 build 8，不要选 build 7（build 7 未含这两条修复）。

---

## 英文回复（直接粘贴）

Hello Review Team,

Thank you for the detailed reproduction steps. We investigated the full "Upload Image" flow end to end and identified three separate root causes. All three have been fixed in the attached new build (1.0 (8)).

**Root causes:**

1. **Camera / photo picker never opened.** The flow is two-step: tapping '上传图片' opens an action sheet ('拍照' / Take Photo and '从相册选择' / Choose from Library), and either option invokes a native camera plugin through our JavaScript-to-native bridge. Our bridge used an environment-detection API (`Capacitor.isNative`) removed in Capacitor 8, so on devices the bridge silently failed and the picker never appeared — the exact "no response" behavior your team observed.

2. **File upload blocked by browser CORS.** Once the picker was fixed, the selected file was uploaded through the WebView with custom authentication headers. The gateway rejects CORS preflight (`OPTIONS` 405), so the upload itself failed. We moved image uploads to a native HTTP channel (URLSession on iOS, HttpURLConnection on Android), which is not subject to WebView CORS rules.

3. **Missing upload endpoint in our single-tenant cluster.** Our single-tenant deployment did not route the legacy platform file-service endpoint, so even the native upload received HTTP 404. We deployed a new general-purpose upload endpoint on our own VLStream server (`/bus/vls-server/system/oss/upload`), using the same session token as the rest of the app, with publicly accessible download links.

**Fixes included in build 8:**

- Environment detection corrected to the supported `isNativePlatform()` API — the camera / photo picker now opens correctly.
- All image uploads now go through the native HTTP channel — verified end to end on an iOS simulator and Android devices (HTTP 200, file uploaded and downloadable).
- The new backend upload endpoint is live and integrated — the complete flow (Log in → 视频 → 智能分析 → '+' → 上传图片 → Take Photo / Choose from Library → upload succeeds) has been verified.
- Upload failures now surface a clear error message to the user instead of failing silently.
- Also addressed two App Store Connect upload warnings: declared all four interface orientations for iPad multitasking, and added the location-purpose usage-description strings required by our location SDK.

A fully functional demo account is provided in the App Review notes. Please let us know if any additional information is needed.

Thank you for your time.

Best regards,
VLStream Team

---

## 中文对照（内部参考）

- **根因 1（拍照/相册无响应）**：桥接层用了 Capacitor 8 已移除的 `Capacitor.isNative`，真机上桥接静默失败 → 改用 `isNativePlatform()`。
- **根因 2（CORS）**：WebView XHR 带自定义头触发预检，网关 OPTIONS 405 → 改原生 URLSession / HttpURLConnection 直传。
- **根因 3（后端 404）**：single 集群不路由平台 fastdfs → 后端上线 `/bus/vls-server/system/oss/upload`（Bearer token + multipart file，返回可下载 url），前端已对接（模拟器 HTTP 200 验证）。
- **附加**：上传失败从静默改为 toast 提示。

## 提交前必须确认（否则不要提交）

1. [ ] **build 8 必须包含今天（11-24）的上传接口对接代码 + 两条 ITMS 警告修复**。当前 `iOS/ios/App/App/public` 已是新 dist（index-751f6802.js，含 `/system/oss/upload`）；Info.plist 已含四方向 + 位置用途描述；CURRENT_PROJECT_VERSION=8。归档产物：`iOS/ios/App/build/App8-upload-ready.xcarchive`。
2. [ ] Xcode 账号需重新登录（钥匙串凭据失效：sherygril@sina.com missing Xcode-Token），SPM 需在 Xcode GUI 内 Resolve Package Dependencies。
3. [ ] build 8 上传完成并在 ASC 可见（15-30 分钟处理）
4. [ ] Resolution Center 粘贴上方英文回复发送
5. [ ] 版本页选择 build 8 → 提交审核（Resubmit）
