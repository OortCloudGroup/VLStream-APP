# VLStream single 集群图片上传通路缺失 — 后端/运维需求单

> 日期：2026-11-20（2026-11-21 复测更新；2026-11-24 后端已上线并完成前端对接，见第八节）
> 提出方：App 端（iOS/Android/HarmonyOS 三端共用的 vue3-h5 前端）
> 影响：single（单租户）环境下 **所有** 图片上传功能不可用（智能分析申请、事件反馈、头像等），三端一致；**Web 端同样受影响**
> 附注：已上架的鸿蒙版 1.0.2 同样受影响
> **状态更新（2026-11-24）：后端已上线 `POST /bus/vls-server/system/oss/upload`（见 `PUBLIC_FILE_UPLOAD_API.md`），前端已完成对接并构建入三端包，模拟器端到端验证 HTTP 200 + code 200。本需求单的问题已闭环（仅 `VLSTREAM_PUBLIC_FILES_BASE_URL` 返回地址需前端兼容，已处理）。**

---

## 〇、完整接口地址清单（全部实测过，可直接粘贴测试）

| 用途 | 完整 URL | 当前实测状态 |
|---|---|---|
| **前端正在调用的上传接口（single/App）** | `https://vlstream.oortcloudsmart.com:2443/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile` | ❌ **nginx 404**（路由未配置） |
| 同一接口（Web 端域名） | `https://vls.oortcloudsmart.com/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile` | ❌ **nginx 404**（路由未配置） |
| 同一接口（内网网关，需内网） | `http://192.168.60.76:32620/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile` | ⚠️ 路由可达，但令牌校验 4004（见第二节） |
| 同一接口（multi 多租户集群，对照用） | `https://workup.oortcloudsmart.com:2443/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile` | ✅ 路由存在（返回 400 = 缺参数），证明服务本身健康 |
| vls-server 接口文档（single） | `https://vlstream.oortcloudsmart.com:2443/bus/vls-server/v3/api-docs` | ✅ 可访问，共 878 个接口，**无通用上传接口** |
| 特化上传：注解图片（须绑 annotationId） | `https://vlstream.oortcloudsmart.com:2443/bus/vls-server/vlsAnnotationImage/upload` | ✅ 存在，但不通用 |
| 候选新端点 `/vlsCommonFile/upload` | `https://vlstream.oortcloudsmart.com:2443/bus/vls-server/vlsCommonFile/upload` | ❌ 404（端点不存在，2026-11-21 复测） |
| 候选新端点 `/system/oss/upload` | `https://vlstream.oortcloudsmart.com:2443/bus/vls-server/system/oss/upload` | ❌ 404（system 模块未暴露，2026-11-21 复测） |
| 历史老网关（已下线，仅备注） | `http://183.62.103.20:21410/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile` | ❌ 连接失败，已废弃 |

## 一、问题定性（全部实测验证，可复现）

App / Web 前端的上传代码调用的接口是 **标准的、正确的**（路径与后端 swagger 文档一致，且 git 历史上从未变过）：

```
POST https://vlstream.oortcloudsmart.com:2443/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile
（multipart，字段名 file；header 带 accessToken / appId / secretKey / requestType / tenantid）
```

实测证据链（三层）：

| # | 测试 | 结果 | 说明 |
|---|---|---|---|
| 1 | `https://vlstream.oortcloudsmart.com:2443/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile` | **nginx 404**（nginx/1.28.3） | 公网 nginx **没有配置** `apaas-fastdfsservice` 的转发规则 |
| 2 | `http://192.168.60.76:32620/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile`（带正确 appId/secretKey + single 的 BladeX accessToken） | **HTTP 4004「accessToken无效.校验不通过」** | fastdfs 的令牌校验走 apaas 平台令牌体系（apaas-sso），**不认 single 集群 BladeX JWT**（`blade-auth` 头也不行） |
| 3 | `http://192.168.60.76:32620/...`（带瞎编 appId/secretKey） | HTTP 40005「应用AppID,应用密钥SecretKey无效」 | 反证 appId/secretKey 校验是通过的，卡的就是令牌 |

辅助事实：

- multi 集群同一接口路由存在（返回 400 而非 404），**说明服务本身健康，缺口只在 single 这套集群**
- vls-server 的 OpenAPI 文档（878 个接口）里**没有通用图片上传接口**；仅有三个特化上传：注解图片上传（须绑定 annotationId）、算法封面上传（须绑定算法 id）、用户头像，均不能满足通用需求
- 2026-11-21 复测：公网 404 未变；`/vlsCommonFile/upload`、`/system/oss/upload` 均不存在；API 清单 878 → 878，**后端暂无任何变更**

## 二、推荐方案（二选一，或并行）

### 方案 A（推荐）：vls-server 增加通用图片上传接口

- 目标 URL：`https://vlstream.oortcloudsmart.com:2443/bus/vls-server/vlsCommonFile/upload`
- 鉴权：现有 BladeX JWT（accessToken / x-vlstream-token），无需新体系
- 请求：multipart，字段名 `file`（多图可加 `files`）
- 响应：按本集群现有惯例（2026-11-21 模拟器实测），推荐 BladeX R 风格：
  `{"code":200, "success":true, "msg":"操作成功", "data":{"url":"https://.../xxx.png", "fileName":"xxx.png"}}`（url 为可公网访问的文件地址；前端已兼容 `{code,data.url}` 结构）
- 本集群现行接口返回格式实测（2026-11-21 模拟器遍历全页面抓取，完整目录见第五节）：
  - 登录 `POST /bus/vls-server/blade-auth/token` → `{code:200, success, msg, data:{accessToken, token, tokenType, account, userName, tenantId, expiresIn}}`
  - RuoYi R 风格（apaas-vls-server/wvp-server 大部分接口）→ `{code:200, msg:"操作成功", data:...}`
  - 分页（MyBatis-Plus）→ `{code:200, msg:"操作成功", data:{records, total, size, current, pages, ...}}`
  - 分页（PageHelper，wvp device/list）→ `{total, rows, code, msg:"查询成功"}`
  - 新上传接口用 `{code:200, msg:"操作成功", data:{url, fileName}}` 即与全集群惯例一致
- ⚠️ 重要更正：实测证明 single 公网网关**已路由** `apaas-vls-server`、`apaas-wvp-server`（均正常 200），**只缺 `apaas-fastdfsservice` 这一条**——方案 B 的运维改动比预想更小
- 实现：后端源码在 `VLStream-Cloud-Backend-Server/vls-stream`（RuoYi 框架）。现成样板：`ruoyi-admin/src/main/java/com/ruoyi/web/controller/system/SysOssController.java` 的 `/system/oss/upload`（multipart 字段 `file`，内部 `ISysOssService.upload(file)`，返回 `{url, fileName, ossId}`；注意该类 `@RestController` 被注释、模块未暴露，故线上 404）——**可直接落地的完整代码见附带文件 `VlsCommonUploadController.java`**（已按 `ruoyi-vlstream` 现有风格/包路径写好，复制即用，执行步骤见第八节）
- 前端改动量：仅改上传端点（按 authMode 切换），App/H5/鸿蒙三端共用一份 dist，改一处全生效

### 方案 B：补网关路由 + fastdfs 放行 BladeX JWT

1. 运维在 `vlstream.oortcloudsmart.com:2443` 的 nginx 增加：
   ```nginx
   location /bus/apaas-fastdfsservice/ {
       proxy_pass http://192.168.60.76:32620;   # 内网网关（与 /bus/vls-server/ 现有转发参数保持一致）
   }
   ```
2. fastdfs 的 accessToken 校验需兼容 single 集群的 BladeX JWT（或该路径免鉴权，由网关统一鉴权）
- ⚠️ 注意：fastdfs 是 aPaaS 平台服务，multi/single 可能共用部署，改它的鉴权逻辑影响面大，需平台组评估
- 该 nginx 配置不在代码仓库里（`vls-stream/script/docker/nginx/conf/nginx.conf` 只是后端容器的 prod-api 反代），在运维侧网关机器上

## 三、给后端的复现命令（完整可复制）

```bash
# 1. 公网 404 复现（任意网络可用）
curl -X POST "https://vlstream.oortcloudsmart.com:2443/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile" \
  -F "file=@test.png"
# → <html>...404 Not Found...nginx/1.28.3

# 2. 令牌校验 4004 复现（需内网）—— TOKEN 换成任一 single 环境登录返回的 accessToken
curl -X POST "http://192.168.60.76:32620/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile" \
  -H "accessToken: $TOKEN" \
  -H "appId: 747aa0fa18d047c8b526e242142e0a6c" \
  -H "secretKey: 3a97f4f65b204a3a96071746fa42936a" \
  -H "requestType: app" -H "tenantid: 000000" \
  -F "file=@test.png;filename=test.png;type=image/png"
# → {"message":"accessToken无效.校验不通过","code":4004}

# 3. 对照组：multi 集群同一接口（路由存在，返回 400 而非 404）
curl -X POST "https://workup.oortcloudsmart.com:2443/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile" \
  -F "file=@test.png"

# 4. Web 端域名同样 404（证明全端受影响）
curl -X POST "https://vls.oortcloudsmart.com/bus/apaas-fastdfsservice/fastdfs/v1/uploadFile" \
  -F "file=@test.png"
```

## 四、前端配合承诺

- 后端接口一就绪，前端按上述约定切换上传端点并出包联调（半天内）
- 若后端最终约定的字段名/响应结构与此不同，请告知，前端按实际约定适配
- App 端上传已改为原生通道直传（URLSession / HttpURLConnection），不受 CORS 影响，后端只需保证接口本身可达

## 五、补充证据（来自 VLStream-Cloud-main 源码仓库）

1. **Web 端同样受影响**：`VLStream-Web/VLStream-ui` 的事件管理多图上传（`src/views/events/page/eventManagement/components/multiImageUpload.vue`）、用户头像（`src/views/CloudPlatform/CloudUserInfo.vue`）等也调用同一个 `apaas-fastdfsservice/fastdfs/v1/uploadFile`；实测 `https://vls.oortcloudsmart.com` 同路径同样 nginx 404。**single 集群全端（Web/App/鸿蒙）上传均为坏的**。
2. **后端源码位置**：`VLStream-Cloud-Backend-Server/vls-stream`（RuoYi 框架），落地方案 A 的样板已存在（见方案 A 一节）。
3. 公网网关（`vlstream.oortcloudsmart.com:2443`）的 nginx 配置不在本仓库，在运维侧网关机器上。

## 六、接口格式目录（2026-11-21 模拟器全页面遍历实测）

> 抓取方式：iPad 模拟器运行 App，自动登录后遍历工作台/视频/智能分析/我的等页面，hook XHR 记录原始响应。

| 接口（完整路径） | 方法 | 响应结构 |
|---|---|---|
| `/bus/vls-server/blade-auth/token` | POST | `{code:200, success, msg:"操作成功", data:{accessToken, token, tokenType, account, userName, tenantId, expiresIn}}` |
| `/bus/apaas-wvp-server/vlstream/device/list` | GET | `{total, rows[], code:200, msg:"查询成功"}`（PageHelper） |
| `/bus/apaas-wvp-server/vlstream/device/{id}/detail` | GET | `{code:200, msg:"操作成功", data:{device, hasNewFirmware, canUpgrade, upgradeBlockedReason, availableUpgrades, latestTask}}` |
| `/bus/apaas-wvp-server/vlstream/device/{id}/streams` | GET | `{code:200, msg:"操作成功", data:[...]}` |
| `/bus/apaas-wvp-server/vlstream/device/{id}/preview` | POST | `{code:200, msg:"操作成功", data:{playMode, url}}` |
| `/bus/apaas-vls-server/vlsTagManagement/tree` | GET | `{code:200, msg:"操作成功", data:[...]}` |
| `/bus/apaas-vls-server/vlsTagManagement/list` | GET | `{code:200, msg:"操作成功", data:{records, total, size, current, orders, searchCount, pages, ...}}`（MyBatis-Plus 分页） |
| `/bus/apaas-vls-server/vlsAnalysisRequest/list` | GET | 同上 MyBatis-Plus 分页 |
| `/bus/vls-server/task/v1/event_list` | POST | `{code:200, msg:"成功", data:{page, pages, pagesize, count, list[]}}`（自定义分页） |
| `/bus/vls-server/workflow/process/finishedList` | GET | `{total, rows[], code:200, msg:"查询成功"}` |
| `/bus/vls-server/workflow/process/todoList` / `ownList` | GET | ⚠️ HTTP 200 但返回 47 字节非 JSON（疑似集群侧既有小问题，与上传无关） |

**格式结论**：RuoYi R 风格 `{code, msg, data}` 是 apaas-vls-server / wvp-server 的主流格式。新上传接口返回 `{code:200, msg:"操作成功", data:{url, fileName}}` 即与全集群一致。

**路由事实更正**：公网网关已正确路由 `apaas-vls-server`、`apaas-wvp-server`（上述接口全部 200），**仅缺 `apaas-fastdfsservice`**——方案 B 只需补这一条 nginx location，另需解决 fastdfs 对 BladeX JWT 的校验（4004）。

## 七、时间线关联

- iOS App Store 审核（Submission 4befbef9）：2.1(a)「上传图片无响应」的前端部分已修复（拍照/相册可正常拉起），待上传 build 7 重审。若审核员在过审前实测图片上传到服务端仍失败，可能再次被拒——后端修复越早，翻盘越稳。
- 华为 AGC：软件包草稿就绪，卡 App 备案（包名变更审核中），上传修复赶上备案通过前即可。

## 八、落地方式（执行方 = 后端/运维，App 端无需任何服务器权限）

> App 端没有（也不需要有）single 集群服务器的登录密码；方案 A/B 的全部动作都在后端/运维侧。本节把方案 A 拆到「复制粘贴 + 走一次现有发布流程」的粒度。

### 方案 A 执行清单（后端，预计半天内）

1. **新增 1 个 Java 文件**：`VlsCommonUploadController.java`（完整代码随需求单附带，直接放进 `vls-stream/ruoyi-vlstream/src/main/java/com/ruoyi/vlstream/test/vlstream/controller/`）
   - 无 pom 改动：`ruoyi-vlstream` 已依赖 `ruoyi-system`（`ISysOssService` 就在其中）
   - 无新配置项：存储复用本集群已在运行的 MinIO（compose `minio` 服务）
2. **唯一检查项**：`sys_oss_config` 表需有至少一条启用状态的 MinIO 配置记录（`OssFactory.instance()` 从该表读取；endpoint 填 compose 内网地址，如 `http://minio:9000`，bucket 如不存在会自动创建）。若已配置则跳过此步。
3. **构建部署**：照 vls-server 现有发布流程重新构建镜像并重启即可，无其他变更。
4. **验证**（与需求单第三节同样方式）：
   ```bash
   curl -X POST "https://vlstream.oortcloudsmart.com:2443/bus/vls-server/vlsCommonFile/upload" \
     -H "accessToken: <任一single环境登录返回的accessToken>" \
     -F "file=@test.png;type=image/png"
   # 期望：{"code":200,"success":true,"msg":"操作成功","data":{"url":"http://.../xxx.png","fileName":"test.png"}}
   ```
   验证要点：返回的 `url` 必须在公网可访问（审核员设备上要能打开图片），若 MinIO 返回内网地址，需按集群现有惯例做公网域名映射/代理。

### 方案 B 执行清单（运维）

1. 公网 nginx（`vlstream.oortcloudsmart.com:2443` 所在网关机）补一条 location（配置见第二节方案 B）；配置不在任何代码仓库里，只在运维网关机上。
2. fastdfs 对 BladeX JWT 的校验（4004）需平台组评估——影响面比方案 A 大，这也是推荐方案 A 的原因。

### 交接方式

- 把本需求单 + `VlsCommonUploadController.java` 一起发给 vls-stream 后端负责人即可；也可以在内部 GitLab 的 vls-stream 仓库上直接提 MR（代码已按该仓库现有代码风格/包路径写好，可原样提交）。

---

## 九、闭环记录（2026-11-24）

### 后端已交付

接口文档：`~/Downloads/PUBLIC_FILE_UPLOAD_API.md`，实际端点：

```
POST https://vlstream.oortcloudsmart.com:2443/bus/vls-server/system/oss/upload
Authorization: Bearer <VLS_TOKEN>
multipart 字段 file（≤50 MiB）
→ {"code":200,"msg":"操作成功","data":{"fileId":"...","fileName":"...","size":70,"url":"..."}}
```

下载：`GET /bus/vls-server/system/oss/public/{fileId}`（匿名可访问）。

### 前端对接（vue3-h5，已构建入三端）

- `src/config/index.js` 新增 `uploadUrl()` / `uploadHeaders()` / `normalizeUploadedUrl()`：
  - single：`.../vls-server/system/oss/upload` + `Authorization: Bearer`；multi：保持原平台 fastdfs
  - **服务端返回 url 为 `http://host:443/system/oss/public/{id}`（缺 `/bus/vls-server` 前缀，直接访问 502）**——前端 `normalizeUploadedUrl()` 按当前网关重写为可下载地址（对应文档第 90 行 `VLSTREAM_PUBLIC_FILES_BASE_URL` 配置未生效；建议后端仍配置该变量，前端兼容为兜底）
- 改造点：`api/fastdfs/index.ts`、`oort_fileUpload.vue`、`oort_uploader.vue`、VForm `m-file-upload-widget.vue`
- 失败提示：两个上传组件原静默失败改为 `showFailToast`（覆盖 2.1(a) 拒审现象）
- 构建：`npm run build` → `dist`（index-751f6802.js）→ 三端已同步（iOS cap sync 后手动补回 `NativeBridgePlugin` 登记；Android cap sync；HarmonyOS 手动复制到 rawfile/www）

### 验证证据

1. curl 端到端：SM2 登录 → token → 上传 → `code:200` + fileId → 修正 url 后 GET 返回 200/70 字节 ✅
2. 模拟器（iPhone 17 Pro，build 7 包 + 新 dist）：探针 hook 原生桥，自动登录后上传 → `NB-RES status=200 body={"code":200,...}` ✅
3. 失败路径：未登录上传 → `{"code":401}`；App 内走 failCb → toast（代码已改）
