# ASC 2.1(a) 修复回复稿（build 7）

> Submission ID: 4befbef9-5f89-4772-a36a-be9056848411
> 涉及：Guideline 2.1(a) - Performance - App Completeness（「上传图片」无响应）
> 用法：build 7 上传处理完成后，粘贴到 Resolution Center Reply，然后选 build 7 Resubmit。

---

## 英文回复（直接粘贴）

Hello Review Team,

Thank you for the detailed reproduction steps. We identified the root cause, fixed it, and submitted a new build (1.0 (7)).

**Root cause:**
The "Upload Image" flow works in two steps: tapping '上传图片' opens an action sheet with two options ('拍照' / Take Photo and '从相册选择' / Choose from Library). Tapping either option invokes a native camera plugin through a JavaScript-to-native bridge. Our bridge layer used an environment-detection API (`Capacitor.isNative`) that has been removed in Capacitor 8, so on devices the bridge silently failed and the camera/photo picker never opened — making the feature appear unresponsive, exactly as your team observed.

**Fix (submitted in build 7):**
We corrected the environment detection to use the supported `isNativePlatform()` API. After the fix, tapping '拍照' / '从相册选择' correctly invokes the native camera / photo-picker UI. We verified the complete flow (Log in → 视频 → 智能分析 → '+' → 上传图片 → 拍照 / 从相册选择) on an iPad Air 11-inch simulator running iOS 26.2, and on Android devices; the picker now opens as expected.

The new build (1.0 (7)) contains this fix and no other functional changes. A fully functional demo account is already provided in the App Review notes. Please let us know if any additional information is needed.

Thank you for your time.

Best regards,
VLStream Team

---

## 中文对照（内部参考）

- **根因**：上传图片是两步交互——先弹「拍照/从相册选择」选项，点选项后经 JS→原生桥接调相机插件。桥接层用了 Capacitor 8 已移除的 `Capacitor.isNative` 检测 API，真机上桥接静默失败，相机/相册永远打不开，表现即「无响应」。
- **修复**：改用受支持的 `isNativePlatform()`；已在 iPad Air 11（iOS 26.2）模拟器与 Android 真机验证完整链路（登录→视频→智能分析→+→上传图片→拍照/从相册）均正常弹起。
- **提交**：build 7（1.0 (7)）仅含此修复，无其他功能变更。

## 提交操作清单

1. [ ] build 7 上传完成并在 ASC 可见（15-30 分钟处理）
2. [ ] Resolution Center 粘贴上方英文回复发送
3. [ ] 版本页选择 build 7 → 提交审核（Resubmit）
