# single 集群 App 功能受影响全景清单

> 日期：2026-11-21
> 排查方式：vue3-h5 源码全量检索（上传组件引用链、平台服务引用链）+ 2026-11-21 模拟器全页面遍历实测
> 用途：评估 Apple 审核（2.1 完整性）风险面 + 给后端/运维的问题全貌

---

## 一、高危：上传类功能全坏（fastdfs 404，且失败时静默无提示）

上传组件 `oort_uploader` / `oort_fileUpload` / VForm 附件字段的默认端点全部是
`apaas-fastdfsservice/fastdfs/v1/uploadFile`（single 公网 nginx 404）。失败分支只关 loading，无任何 toast —— 审核员视角 = 「点了没反应」，与上次 2.1(a) 拒审现象同源。

| # | 功能 | 代码入口 | 审核风险 |
|---|---|---|---|
| 1 | **智能分析申请**（上传图片/视频封面） | `intelligentAnalysis/AnalysisApplication.vue` | ★★★ 审核员实测过的入口（上次拒审来源） |
| 2 | **事件上报**（内建表单带图） | `event/eventBuilt.vue` | ★★★ 主流程 |
| 3 | **事件反馈**（内建反馈表单带图） | `event/feedbackRecordBuilt.vue` | ★★ |
| 4 | **事件详情 / 设备详情**（补充图片） | `event/eventDetail.vue`、`event/eventDeviceDetail.vue` | ★★ |
| 5 | **工单详情**（补充图片） | `event/workorderDetail.vue` | ★★ |
| 6 | **设备编辑**（图片上传） | `deviceManagement/EditDevice.vue`（源码注释：选点与上传都不可用） | ★★ |
| 7 | **审批表单附件字段**（图片/文件上传 widget） | VForm `m-picture-upload-widget.vue`、`m-file-upload-widget.vue`（默认 uploadURL = fastdfs） | ★★ 审批提交时触发 |
| 8 | 用户头像等其余引用 oort_uploader 的页面 | 全局组件 | ★ |

## 二、高危：审批工单列表（集群侧既有缺陷，非前端问题）

`config/index.js` 已把 `/workflow/*` 映射进 vls-server（SINGLE_MERGED_SERVICES），路由本身通。但模拟器实测（2026-11-21）：

| 接口 | 实测结果 |
|---|---|
| `GET /bus/vls-server/workflow/process/todoList` | ⚠️ HTTP 200 但返回 47 字节非 JSON |
| `GET /bus/vls-server/workflow/process/finishedList` | ⚠️ 同上 |
| `GET /bus/vls-server/workflow/process/ownList` | ⚠️ 同上 |

App 审批模块（`api/processui/approval.ts`，工作台/事件审批页引用）的待办/已办/我发起列表**拉取不到数据**。47 字节非 JSON 属于集群侧响应异常，需后端查该接口日志。

## 三、低危：已做降级、有明确提示（不构成「无响应」）

| 功能 | single 集群缺失服务 | 前端降级方式 | 代码位置 |
|---|---|---|---|
| 视频页地图模式 | apaas-map-server | 直接不提供入口 | `page/index/video.vue:186` |
| 设备编辑地图选点 | apaas-map-server | 空底图 + 占位提示 | `selectPointFormMap.vue:154` |
| 通用地图组件 | apaas-map-server | 判定不可用，不渲染裂图 | `simpleMap.vue:56-62` |
| 应用市场应用信息 | apaas-admin-platform | 回退原生壳注入的静态值 | `VLStreamCloud/App.vue:120` |
| 评论（apaas-comment）、智能审批（smart-approval） | 不存在 | App 前端无引用（仅 Web 端功能） | 全量检索无匹配 |

## 四、对审核的结论与动作

1. **同类拒审风险最高的是第 1、2 项**：审核员只要再点一次「智能分析申请」或「事件上报」并传图，现象与上次 2.1(a) 完全相同。
2. **前端兜底（本次必做）**：两个上传组件 + VForm 两个 widget 的失败分支补 toast「上传失败，请稍后重试」；`code !== 200` 分支同样提示。
3. **审批 47 字节问题**：加入需求单转后端排查（可能是 Flyway/表结构或网关转发问题），修复前工作台审批列表在 single 环境无数据。
4. 后端接口 `/vlsCommonFile/upload` 上线后，前端按 authMode 切换端点，上表 1-8 全部一次性恢复。

## 五、模拟器运行时验证（2026-11-21 16:58，iPad Air 11 M3 模拟器，build 7 包）

验证方式：替换包内调试探针为「上传专项探针」——hook `FileTransfer.upload`（业务层）、`NativeBridge.uploadFile`（原生通道）、`XMLHttpRequest`（XHR 漏网监测），自动登录后自动导航到各上传入口页面并在页面上下文内发起真实上传（1×1 PNG，multipart，带 accessToken）。

| 页面（探针到达） | 登录态 | 上传通道 | 服务器响应 |
|---|---|---|---|
| 工作台（home） | token=yes | 原生桥 base64 直传 | **nginx 404** |
| 智能分析-申请页（点击「申请入口」进入） | token=yes | 原生桥 base64 直传 | **nginx 404** |
| 事件上报页（点击「上报入口」进入） | token=yes | 原生桥 base64 直传 | **nginx 404** |
| 我的 / 工作台（tab 点击失败，探针仍在页面上下文调用） | token=yes | 原生桥 base64 直传 | **nginx 404** |

结论：

1. **运行时链路完全一致**：所有上传入口 → FileTransfer polyfill → 原生桥（URLSession）→ 同一个 fastdfs URL → 统一 nginx 404。与代码层分析吻合，无页面使用不同端点。
2. **零 XHR 漏网**：全程无任何 `XHR-UPLOAD` 记录，没有页面走 WebView XHR 上传（CORS 问题已在原生通道层根治）。
3. **前端侧无其他死点**：登录、页面导航、原生桥调用、回调接收全部正常；唯一死点就是服务器路由缺失。
4. 隐含推论：只要后端上线新上传接口 + 前端切换端点，1-8 项功能全部恢复，无需逐页面验证。

---

## 六、状态更新（2026-11-24）：上传类已全部修复

后端上线 `POST /bus/vls-server/system/oss/upload`（`PUBLIC_FILE_UPLOAD_API.md`），前端已按 authMode 切换端点（single 走新接口 + Bearer；multi 保持 fastdfs），并构建入三端包。本清单第一节 1-8 项上传功能全部恢复；模拟器端到端验证 HTTP 200 + code 200。

- 失败提示已补（两个上传组件的 failCb 改为 showFailToast），不会再出现审核员视角的「无响应」。
- 第二节审批工单 `workflow/process/*` 47 字节非 JSON 问题**仍待后端排查**（与上传无关）。
- 第三节降级项不变。
