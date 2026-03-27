/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 10:47:04
 * @Last Modified by: 兰舰
 * @Last Modified time: 2025-09-29 10:26:30
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { request } from '@/utils/service'
import config from '@/config'

function commonFunc<T, K>(
  interfaceName: string,
  data: T,
  method = 'post',
  isParams = false,
  responseType?: 'json' | 'blob' | 'arraybuffer'
) {
  let params = method === 'get' || method === 'delete' ? { params: data } : { data }
  if (isParams) {
    params = { params: data }
  }

  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-user' + interfaceName,
    method,
    ...params,
    ...(responseType ? { responseType } : {})
  })
}

// tenant
// 租户添加
export function tenantAdd(data) {
  return commonFunc('/tenant/v1/add', data)
}

// 租户删除
export function tenantDel(data) {
  return commonFunc('/tenant/v1/delete', data)
}

// 租户编辑
export function tenantEdit(data) {
  return commonFunc('/tenant/v1/edit', data)
}

// 租户详情
export function tenantInfo(data) {
  return commonFunc('/tenant/v1/info', data)
}

// 租户列表
export function tenantList(data) {
  return commonFunc('/tenant/v1/list', data)
}

// 租户管理员重置密码
export function resetAdminPassword(data) {
  return commonFunc('/tenant/v1/resetAdminPassword', data)
}

// 租户状态设置
export function tenantSetStatus(data) {
  return commonFunc('/tenant/v1/setStatus', data)
}

// 添加租户管理员
export function addTenantAdmin(data) {
  return commonFunc('/tenant/v1/addAdminUser', data)
}

// 获取租户管理员
export function getTenantAdmin(data) {
  return commonFunc('/tenant/v1/getAdminUser', data)
}

// 移除租户管理员
export function removeTenantAdmin(data) {
  return commonFunc('/tenant/v1/removeAdminUser', data)
}

// user
// 部门添加
export function deptAdd(data) {
  return commonFunc('/user/v1/deptAdd', data)
}

// 部门删除
export function deptDelete(data) {
  return commonFunc('/user/v1/deptDelete', data)
}

// 部门编辑
export function deptEdit(data) {
  return commonFunc('/user/v1/deptEdit', data)
}

// 部门详情
export function deptInfo(data) {
  return commonFunc('/user/v1/deptInfo', data)
}

// 部门列表
export function deptList(data) {
  return commonFunc('/user/v1/deptList', data)
}

// 部门排序调整
export function deptSortShit(data) {
  return commonFunc('/user/v1/deptSortShit', data)
}

// 用户添加
export function userAdd(data) {
  return commonFunc('/user/v1/userAdd', data)
}

// 用户删除
export function userDelete(data) {
  return commonFunc('/user/v1/userDelete', data)
}

// 用户编辑
export function userEdit(data) {
  return commonFunc('/user/v1/userEdit', data)
}

// 用户详情
export function userV1Info(data) {
  return commonFunc('/user/v1/userInfo', data)
}

// 用户列表
export function userList(data) {
  return commonFunc('/user/v1/userList', data)
}

// 组织部门列表
export function deptUserList(data) {
  return commonFunc('/user/v1/deptUserList', data)
}

// 用户部门排序
export function userDeptSortShift(data) {
  return commonFunc('/user/v1/userDeptSortShift', data)
}

// 用户关联部门
export function userDeptLike(data) {
  return commonFunc('/user/v1/userDeptLike', data)
}

// 用户取消关联部门
export function userUnlikeDept(data) {
  return commonFunc('/user/v1/userDeptUnlike', data)
}

// 用户密码重置
export function resetUserPassword(data) {
  return commonFunc('/user/v1/resetUserPassword', data)
}

// 审核管理-租户审核列表
export function tenantCheckList(data) {
  return commonFunc('/tenant/v1/checkList', data)
}

// 审核管理-租户审核详情
export function tenantCheckInfo(data) {
  return commonFunc('/tenant/v1/checkInfo', data)
}

// 审核管理-租户审核
export function tenantcheck(data) {
  return commonFunc('/tenant/v1/check', data)
}

// 审核管理-部门审核列表
export function deptCheckList(data) {
  return commonFunc('/user/v1/deptCheckList', data)
}

// 审核管理-部门审核详情
export function deptCheckInfo(data) {
  return commonFunc('/user/v1/deptCheckInfo', data)
}

// 审核管理-部门审核
export function deptcheck(data) {
  return commonFunc('/user/v1/deptCheck', data)
}

// 审核管理-用户审核列表
export function userCheckList(data) {
  return commonFunc('/user/v1/userCheckList', data)
}

// 审核管理-用户审核详情
export function userCheckInfo(data) {
  return commonFunc('/user/v1/userCheckInfo', data)
}

// 审核管理-用户审核
export function usercheck(data) {
  return commonFunc('/user/v1/userCheck', data)
}

// 审核设置列表
export function checksetList(data) {
  return commonFunc('/checkset/v1/list', data)
}

// 审核设置编辑
export function checksetEdit(data) {
  return commonFunc('/checkset/v1/edit', data)
}

// 部门失效-失效
export function deptSetStatus(data) {
  return commonFunc('/user/v1/deptSetStatus', data)
}

// 用户失效-失效
export function uSetStatus(data) {
  return commonFunc('/user/v1/userSetStatus', data)
}

// 门户 通过流程id获取审核信息
export function getCheckInfoByProcinsId(data) {
  return commonFunc('/checkset/v1/getCheckInfoByProcinsId', data, 'POST')
}

// 修改顶级租户名称
export function updateHighTenantName(data) {
  return commonFunc('/tenant/v1/nameEdit ', data, 'POST')
}

// 导出部门与用户(支持文件流下载)
export function exportDeptuser(data) {
  return commonFunc('/user/v1/exportDeptuser', data, 'POST', false, 'blob')
}

// 角色登录方式列表接口
export function identRoleList(data) {
  return commonFunc('/ident/v1/identRoleList', data, 'POST')
}

// 获取默认角色认证登录方式信息
export function roleLoginInfo(data) {
  return commonFunc('/userident/v1/roleLoginInfo', data, 'POST')
}

// 设置角色认证登录方式
export function setRoleLogin(data) {
  return commonFunc('/userident/v1/setRoleLogin', data, 'POST')
}

// 生成租户邀请码
export function generateCode(data) {
  return commonFunc('/tenant/v1/generateCode', data, 'POST')
}

// 邀请用户加入到租户中
export function inviteUser(data) {
  return commonFunc('/tenant/v1/inviteUser', data, 'POST')
}

// 全局用户搜索
export function globalUserSearch(data) {
  return commonFunc('/user/v1/uniqueList', data, 'POST')
}

// 用户账户详情
export function userAccountDetail(data) {
  return commonFunc('/user/v1/uniqueAllInfo', data, 'POST')
}

// 用户申请租户认证
export function applyTenantCert(data) {
  return commonFunc('/tenant/v1/applyTenantCert', data, 'POST')
}

// 用户申请开通租户
export function applyTenant(data) {
  return commonFunc('/tenant/v1/applyTenant', data, 'POST')
}

// 查询租户名称有效性
export function getTenantNameValid(data) {
  return commonFunc('/tenant/v1/getTenantNameValid', data, 'POST')
}

// 获取上传用户表模板
export function userTemplate(data) {
  return commonFunc('/user/v1/userTemplate', data, 'get', false, 'blob')
}

// 导入文件同步用户
export function importUser(data) {
  return commonFunc('/user/v1/importUser', data, 'POST')
}

// 获取上传用户文件的记录列表
export function uploadUserFileList(data) {
  return commonFunc('/user/v1/uploadUserFileList', data, 'POST')
}

// 管理员获取权限申请范围详情
export function authApplyScopeInfo(data) {
  return commonFunc('/auth/v1/auth_apply_scope_info', data, 'POST')
}

// 管理员保存权限申请范围
export function authApplyScopeSave(data) {
  return commonFunc('/auth/v1/auth_apply_scope_save', data, 'POST')
}

// 检测是否能申请开通租户
export function checkApplyTenant(data) {
  return commonFunc('/tenant/v1/checkApplyTenant', data, 'POST')
}

// 用户关联组织列表
export function userDeptList(data) {
  return commonFunc('/user/v1/userDeptList', data, 'POST')
}

// 用户批量调整组织
export function userDeptShiftBatch(data) {
  return commonFunc('/user/v1/userDeptShiftBatch', data, 'POST')
}

// 批量的部门用户排序调整
export function userDeptSortShiftBatch(data) {
  return commonFunc('/user/v1/userDeptSortShiftBatch', data, 'POST')
}

// 组织排序调整
export function deptSortShift(data) {
  return commonFunc('/user/v1/deptSortShift', data, 'POST')
}

// 组织批量排序调整
export function deptSortShiftBatch(data) {
  return commonFunc('/user/v1/deptSortShiftBatch', data, 'POST')
}

