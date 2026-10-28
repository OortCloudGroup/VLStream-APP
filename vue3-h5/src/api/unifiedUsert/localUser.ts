/*
 * 单租户（BladeX/RuoYi）集群不路由 apaas-sso，用户与部门改由 vls-server 的 RuoYi 接口提供。
 * 这里把响应映射成 aPaaS 的字段名（user_id / user_name / photo / dept_id / son_dept），
 * 让 ID2Name、ID2HeadPic、通讯录选人等组件在两套环境下都不用分支。
 */
import { request } from '@/utils/service'
import config from '@/config'

function serverBase() {
  return `${config.URL}${config.gateWay}${config.authService}`
}

/** RuoYi 的 avatar 是服务内相对路径，需补上网关前缀才是可访问的 URL */
function absAvatar(avatar: string) {
  if (!avatar) return ''
  if (avatar.includes('http')) return avatar
  return avatar.startsWith('/') ? serverBase() + avatar : avatar
}

function toApaaSUser(user: any) {
  return {
    user_id: String(user.userId),
    user_name: user.nickName || user.userName || '',
    photo: absAvatar(user.avatar),
    dept_id: user.deptId ? String(user.deptId) : '',
    dept_name: user.deptName || '',
    user_detail: { ex_data: { realName: user.nickName || '' } }
  }
}

async function allUsers() {
  const res: any = await request({
    url: serverBase() + '/system/user/list',
    method: 'get',
    params: { pageNum: 1, pageSize: 1000 }
  })
  return res && res.code === 200 ? (res.rows || []).map(toApaaSUser) : []
}

/** 对应 aPaaS sso/v1/getUserList：按 user_id 批量取用户，不传则取全部 */
export async function localGetUserList(data: any) {
  const list = await allUsers()
  const raw = (data && data.user_id) || []
  const ids: string[] = (Array.isArray(raw) ? raw : [raw]).map(String).filter(Boolean)
  const matched = ids.length ? list.filter(user => ids.includes(user.user_id)) : list
  return { code: 200, msg: '成功', data: { list: matched, count: matched.length } }
}

/** 对应 aPaaS sso/v1/getUserInfoByUserId：单个用户详情 */
export async function localGetUserInfoByUserId(data: any) {
  const userId = data && data.user_id
  const matched = userId
    ? await localGetUserList({ user_id: [userId] })
    : { data: { list: [] } }
  const user = matched.data.list[0]
  return user
    ? { code: 200, msg: '成功', data: user }
    : { code: 404, msg: '用户不存在', data: null }
}

type DeptNode = { dept_id: string, dept_name: string, dept_photo: string, son_dept: DeptNode[], users: any[] }

function buildNode(raw: any, usersByDept: Record<string, any[]>): DeptNode {
  const node: DeptNode = {
    dept_id: String(raw.id),
    dept_name: raw.label || '',
    dept_photo: '',
    son_dept: (raw.children || []).map((child: any) => buildNode(child, usersByDept)),
    users: usersByDept[String(raw.id)] || []
  }
  return node
}

/** 对应 aPaaS sso/v1/getDeptUser：部门树 + 部门成员，未挂部门的用户归到根部门 */
export async function localGetDeptUser() {
  const [treeRes, users] = await Promise.all([
    request<any>({ url: serverBase() + '/system/user/deptTree', method: 'get' }),
    allUsers()
  ])
  const usersByDept: Record<string, any[]> = {}
  const orphanUsers: any[] = []
  users.forEach(user => {
    if (!user.dept_id) {
      orphanUsers.push(user)
      return
    }
    ;(usersByDept[user.dept_id] = usersByDept[user.dept_id] || []).push(user)
  })
  const roots: DeptNode[] = (treeRes && treeRes.code === 200 ? treeRes.data || [] : [])
    .map((raw: any) => buildNode(raw, usersByDept))
  if (!roots.length) {
    roots.push({ dept_id: '', dept_name: '所有', dept_photo: '', son_dept: [], users: [] })
  }
  roots[0].users = roots[0].users.concat(orphanUsers)
  return { code: 200, msg: '成功', data: { list: roots, count: users.length } }
}
