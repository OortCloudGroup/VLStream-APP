<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="userPage">
    <div class="depNameBox_out flexRowAC">
      <div class="exportBtnBox flexRowAC bt-gap">
        <el-button type="primary" class="newBtn flexRowAC" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>
          <span>新增</span>
        </el-button>
        <div class="button-groupBox">
          <button-group
            :button-list="[
              {svg: 'edit', name: '编辑', clickFn: handleEdit},
              {svg: 'avg', name: '通用参数', clickFn: handleGeneralParam},
              {svg: 'setting', name: '账号安全设置', clickFn: handleAccountSafe},
              {svg: 'del', name: '删除', clickFn: handleDelete},
            ]"
          />
        </div>
      </div>
    </div>
    <TableSelf
      class="new_table"
      header-cell-class-name="header_cell"
      stripe
      :data="tableData"
      current-row-key="check_id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" width="90">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="user_name" label="用户名" />
      <el-table-column prop="user_type" label="用户类型" />
      <el-table-column fixed="right" align="right" label="操作" />
    </TableSelf>

    <el-dialog
      v-model="messVisi"
      title="账号安全设置"
      width="40%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <user-tab-new :user-data="accountSafeUserData" @close="messVisi = false" @handle="applistFn" />
    </el-dialog>

    <GeneralParamDialog v-model:visible="generalVisible" :value="webConcurrent" :user-data="generalParamUserData" @confirm="handleGeneralConfirm" />
    <AddUserDialog v-model:visible="addVisible" @confirm="handleAddConfirm" />
    <EditUserDialog v-model:visible="editVisible" :user-data="editUserData" @confirm="handleEditConfirm" />

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserTabNew from '@/pages/cameraMana/views/page/message/system/userTab/userTabNew.vue'
import ButtonGroup from '@/components/buttonGroup.vue'
import { Plus } from '@element-plus/icons-vue'
import TableSelf from '@/components/TableSelf.vue'
import GeneralParamDialog from './GeneralParamDialog.vue'
import AddUserDialog from './AddUserDialog.vue'
import EditUserDialog from './EditUserDialog.vue'
import { getUserManage, saveUserManage } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const store: any = useUserStore()

const tableData = ref<any[]>([])
const messVisi = ref<boolean>(false) // 发送dialog
const selectedRows = ref<any[]>([])
const generalVisible = ref(false)
const webConcurrent = ref(50)
const addVisible = ref(false)
const editVisible = ref(false)
const editUserData = ref<any>({})
const generalParamUserData = ref<any>({})
const accountSafeUserData = ref<any>({})

// 用户列表原始数据
const usersData = ref<any[]>([])

const fetchUserManage = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getUserManage(params)
  if (res.code === 200 && res.data) {
    if (res.data.用户列表) {
      tableData.value = res.data.用户列表.map((item: any) => ({
        id: item.id,
        user_name: item.user_name || '',
        user_type: item.user_type || '',
        permission: item.permission || '',
        ip: item.ip || '',
        user_operation_time: item.user_operation_time || '',
        state: item.state || 0,
        safety_issue1: item.safety_issue1 || '',
        answer1: item.answer1 || '',
        safety_issue2: item.safety_issue2 || '',
        answer2: item.answer2 || '',
        safety_issue3: item.safety_issue3 || '',
        answer3: item.answer3 || '',
        email_addr: item.email_addr || '',
        web_simultaneous_login_number: item.web_simultaneous_login_number || 0
      }))
      usersData.value = res.data.用户列表
    }
  }
}

const handleSave = async() => {
  const users = tableData.value.map((item: any) => {
    const originalUser = usersData.value.find((u: any) => u.id === item.id)
    return {
      user_name: item.user_name,
      password: originalUser?.password || '',
      user_type: item.user_type,
      permission: item.permission,
      ip: item.ip,
      user_operation_time: item.user_operation_time,
      safety_issue1: item.safety_issue1,
      answer1: item.answer1,
      safety_issue2: item.safety_issue2,
      answer2: item.answer2,
      safety_issue3: item.safety_issue3,
      answer3: item.answer3,
      email_addr: item.email_addr,
      web_simultaneous_login_number: item.web_simultaneous_login_number
    }
  })

  const params = {
    accessToken: store.userInfo?.accessToken,
    users
  }
  const res: any = await saveUserManage(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchUserManage()
  }
}

// 账号安全设置保存回调
const applistFn = async(data: any) => {
  if (data && data.userId) {
    const index = tableData.value.findIndex((u: any) => u.id === data.userId)
    if (index !== -1) {
      tableData.value[index].safety_issue1 = data.safety_issue1 || ''
      tableData.value[index].answer1 = data.answer1 || ''
      tableData.value[index].safety_issue2 = data.safety_issue2 || ''
      tableData.value[index].answer2 = data.answer2 || ''
      tableData.value[index].safety_issue3 = data.safety_issue3 || ''
      tableData.value[index].answer3 = data.answer3 || ''
      tableData.value[index].email_addr = data.email_addr || ''
    }

    const originalIndex = usersData.value.findIndex((u: any) => u.id === data.userId)
    if (originalIndex !== -1) {
      usersData.value[originalIndex].safety_issue1 = data.safety_issue1 || ''
      usersData.value[originalIndex].answer1 = data.answer1 || ''
      usersData.value[originalIndex].safety_issue2 = data.safety_issue2 || ''
      usersData.value[originalIndex].answer2 = data.answer2 || ''
      usersData.value[originalIndex].safety_issue3 = data.safety_issue3 || ''
      usersData.value[originalIndex].answer3 = data.answer3 || ''
      usersData.value[originalIndex].email_addr = data.email_addr || ''
    }
  }
}

const handleAdd = () => {
  addVisible.value = true
}
const handleEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的用户')
    return
  }
  if (selectedRows.value.length > 1) {
    ElMessage.warning('请只选择一个用户进行编辑')
    return
  }
  const selectedUser = selectedRows.value[0]
  const originalUser = usersData.value.find((u: any) => u.id === selectedUser.id)
  editUserData.value = {
    ...selectedUser,
    ...(originalUser || {})
  }
  editVisible.value = true
}
const handleGeneralParam = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要设置通用参数的用户')
    return
  }
  if (selectedRows.value.length > 1) {
    ElMessage.warning('请只选择一个用户进行设置')
    return
  }
  // 设置选中的用户数据
  generalParamUserData.value = selectedRows.value[0]
  generalVisible.value = true
}
const handleAccountSafe = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要设置账号安全的用户')
    return
  }
  if (selectedRows.value.length > 1) {
    ElMessage.warning('请只选择一个用户进行设置')
    return
  }
  // 设置选中的用户数据
  accountSafeUserData.value = selectedRows.value[0]
  messVisi.value = true
}
const handleDelete = async() => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const deleteIds = selectedRows.value.map((row: any) => row.id)
    tableData.value = tableData.value.filter((item: any) => !deleteIds.includes(item.id))
    usersData.value = usersData.value.filter((item: any) => !deleteIds.includes(item.id))
    selectedRows.value = []

    ElMessage.success('删除成功')
  } catch (error) {
    // 用户取消删除
  }
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows || []
}

const handleGeneralConfirm = (data: { userId: any, webConcurrent: number }) => {
  const index = tableData.value.findIndex((u: any) => u.id === data.userId)
  if (index !== -1) {
    tableData.value[index].web_simultaneous_login_number = data.webConcurrent
  }

  // 更新原始数据
  const originalIndex = usersData.value.findIndex((u: any) => u.id === data.userId)
  if (originalIndex !== -1) {
    usersData.value[originalIndex].web_simultaneous_login_number = data.webConcurrent
  }

  ElMessage.success('设置通用参数成功')
}

const handleAddConfirm = (user: any) => {
  const userTypeMap: Record<string, string> = {
    admin: '管理员',
    normal: '普通用户'
  }
  const userType = userTypeMap[user.userType] || user.userType

  const permission = user.permissions
    .filter(Boolean)
    .join('') || ''

  const newId = tableData.value.length > 0
    ? Math.max(...tableData.value.map((u: any) => u.id || 0)) + 1
    : Date.now()

  // 创建新用户对象
  const newUser = {
    id: newId,
    user_name: user.username || '',
    user_type: userType,
    permission,
    ip: '',
    user_operation_time: (() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hour = String(now.getHours()).padStart(2, '0')
      const minute = String(now.getMinutes()).padStart(2, '0')
      const second = String(now.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    })(),
    state: 1,
    safety_issue1: '',
    answer1: '',
    safety_issue2: '',
    answer2: '',
    safety_issue3: '',
    answer3: '',
    email_addr: '',
    web_simultaneous_login_number: 0
  }

  // 添加到表格数据
  tableData.value.push(newUser)

  const originalUser = {
    ...newUser,
    password: user.password || ''
  }
  usersData.value.push(originalUser)

  ElMessage.success('添加用户成功')
}

const handleEditConfirm = (user: any) => {
  const userTypeMap: Record<string, string> = {
    admin: '管理员',
    normal: '普通用户'
  }
  const userType = userTypeMap[user.userType] || user.userType

  const permission = user.permissions
    .filter(Boolean)
    .join('') || ''

  // 查找要编辑的用户在表格中的索引
  const index = tableData.value.findIndex((u: any) => u.id === user.id)
  if (index === -1) {
    ElMessage.error('未找到要编辑的用户')
    return
  }

  // 更新表格数据
  tableData.value[index] = {
    ...tableData.value[index],
    user_name: user.username || '',
    user_type: userType,
    permission
  }

  // 更新原始数据（如果密码有值，则更新密码）
  const originalIndex = usersData.value.findIndex((u: any) => u.id === user.id)
  if (originalIndex !== -1) {
    if (user.password) {
      usersData.value[originalIndex].password = user.password
    }
    usersData.value[originalIndex].user_name = user.username || ''
    usersData.value[originalIndex].user_type = userType
    usersData.value[originalIndex].permission = permission
  }

  ElMessage.success('编辑用户成功')
}

onMounted(() => {
  fetchUserManage()
})
</script>

<style lang="scss" scoped>
.userPage {
  width: 880px;
}

.depNameBox_out {
  justify-content: flex-start;
  margin-bottom: 20px;
  padding-top: 4px;
}

.exportBtnBox {
  gap: 12px;
}

.button-groupBox {
  display: flex;
  align-items: center;
}

.submitBox {
  padding: 40px 0;

  .submit {
    height: 48px;
    width: 170px;
    text-align: center;
    line-height: 48px;
    background: var(--el-color-primary);
    border-radius: 2px;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;
  }
}
</style>

