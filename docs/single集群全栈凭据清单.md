# single 集群全栈落地 — 凭据清单

> 日期：2026-11-21
> 场景：App 端开发者要自己完成方案 A（`VlsCommonUploadController` 上线到 vlstream.oortcloudsmart.com:2443 所在的 single 集群）
> 结论先行：真正必须找运维/后端要的是 **3 项**；其余要么已有、要么有捷径可绕开。

---

## 一、按部署动作拆解：每个动作需要什么凭据

| # | 动作 | 所需凭据/权限 | 当前状态 |
|---|---|---|---|
| 1 | 改代码、提 MR | 公司 GitLab 账号 + `vls-stream` 仓库推送/MR 权限 | ⚠️ 本机 ssh key（Sourcetree 生成）已被 GitLab 拒绝（publickey 失败），需重新确认账号并把公钥加回 GitLab |
| 2 | 构建镜像 | 若 CI 自动构建：无需凭据；若手动：构建机 + 镜像仓库（ghcr.io/oortcloudgroup 或 Harbor）推送凭据 | 待确认（问后端：合并到 release 分支是否自动出镜像） |
| 3 | 部署/重启 vls-server | single 集群部署机的 ssh 账号密码（或 kubeconfig） | ❌ 无。known_hosts 中从未登录过 192.168.60.x 任何机器 |
| 4 | 检查/补 `sys_oss_config` 表 | MySQL 账号（或 cluster 后台管理员账号，走「系统管理→OSS 配置」页面配） | ❌ 无。注意 deploy/release 里 README 的 `admin / Codex@123456` 只是**新装环境**默认值，不要假设线上相同，更不要在线上试 |
| 5 | 验证接口 | 无需任何凭据：curl + App 登录拿的 accessToken 即可 | ✅ 已具备 |

## 二、真正要找运维/后端要的 3 项（照抄进聊天框）

1. **single 集群部署机**的访问方式：哪台机器跑着 vls-server（内网 192.168.60.76 网关背后那套），ssh 账号/密码或跳板机方式。
2. **发布方式**：vls-server 是 GitLab CI 自动构建部署，还是手动？手动的话要镜像仓库推送凭据和构建/部署的操作步骤。
3. **MySQL（或后台管理员账号）**：用于确认 `sys_oss_config` 表里有没有启用的 MinIO 配置（没有的话补一条，endpoint 指 compose 内的 `minio:9000`）。

可选第 4 项（仅走方案 B 才需要）：公网 nginx 网关机（`vlstream.oortcloudsmart.com:2443` 所在机器）的 ssh 权限。

## 三、你手里已经有的（不用找任何人）

| 凭据/资产 | 说明 |
|---|---|
| GitLab ssh key 文件 | `~/.ssh/lichao-GitLab Enterprise`，key 在本地，只是需要确认 GitLab 账号侧是否登记了这把公钥（当前被拒） |
| `192.168.88.110` 的 ssh key | Sourcetree 配置（user lichao），确认这台机器是否就是构建/部署机，若是则第 3 项直接解决 |
| 后端完整源码 + 完整 Controller 代码 | `~/Downloads/VLStream-Cloud-main`（zip 版）+ `docs/VlsCommonUploadController.java`，代码层面零缺口 |
| App 测试账号 | 登录 single 环境拿 accessToken 用于验证 |
| 新装环境部署模板 | `deploy/release/`（compose + .env.example + 初始化 SQL + 默认 admin/Codex@123456）——仅用于新装一套环境，**改不了线上集群** |

## 四、省事捷径（少要 80% 的凭据）

如果运维确认 **GitLab 合并 release 分支会 CI 自动构建+部署**，那么你只需要：
- GitLab 账号 + vls-stream 仓库 MR 权限（第 1 项）
- 顺口让运维帮忙确认一眼 `sys_oss_config` 有没有 MinIO 配置（第 4 项）

之后 add file → MR → CI 自动上线 → curl 验证，全程不需要任何服务器密码。

## 五、优先级提醒

App Store 的 2.1(a) 重审时间窗在等 build 7 + 上传接口可用；华为备案也在走。**先发需求单给后端（第八节已备好），把「要凭据」作为并行推进项**——两条腿走路，别让凭据申请阻塞主流程。
