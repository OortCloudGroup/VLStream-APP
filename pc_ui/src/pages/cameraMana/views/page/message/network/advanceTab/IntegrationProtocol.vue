<template>
  <div class="integrationProtocolPage">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.enable">
          启用ONVIF
        </el-checkbox>
      </el-form-item>
      <el-form-item label="ONVIF版本号">
        <el-input v-model="form.version" placeholder="请输入" />
      </el-form-item>
    </el-form>

    <!-- 用户列表 -->
    <div class="sectionTitle">
      <span class="line" />
      <span>用户列表</span>
    </div>

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
      current-row-key="id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" width="90">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="userType" label="用户类型" />
      <el-table-column fixed="right" align="right" label="操作" />
    </TableSelf>

    <AddUserDialog v-model:visible="addDialogVisible" @confirm="handleAddConfirm" />
    <EditUserDialog
      v-model:visible="editDialogVisible"
      :user="editingUser"
      @confirm="handleEditConfirm"
    />

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import TableSelf from '@/components/TableSelf.vue'
import ButtonGroup from '@/components/buttonGroup.vue'
import AddUserDialog from './AddUserDialog.vue'
import EditUserDialog from './EditUserDialog.vue'
import { getIntegratedProtocol, saveIntegratedProtocol } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  enable: true,
  version: '10.18'
})

const tableData = ref<any[]>([])

const selectedRows = ref<any[]>([])
const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editingUser = ref<any>(null)

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows || []
}

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleAddConfirm = (user: any) => {
  const maxId = tableData.value.reduce((max, item) => {
    const idNum = Number(item.id) || 0
    return Math.max(max, idNum)
  }, 0)

  tableData.value.push({
    id: String(maxId + 1),
    username: user.user_name,
    userType: user.user_type,
    password: user.password,
    password_confirmation: user.password_confirmation
  })
}

const handleEdit = () => {
  if (!selectedRows.value || selectedRows.value.length !== 1) {
    ElMessage.warning('请选择一条数据进行编辑')
    return
  }
  const row = selectedRows.value[0] || {}
  editingUser.value = {
    id: row.id,
    user_name: row.username,
    user_type: row.userType,
    password: row.password ?? '',
    password_confirmation: row.password_confirmation ?? ''
  }
  editDialogVisible.value = true
}

const handleEditConfirm = (user: any) => {
  const id = String(user.id ?? '')
  const idx = tableData.value.findIndex((r: any) => String(r.id) === id)
  if (idx < 0) return
  tableData.value[idx] = {
    ...tableData.value[idx],
    username: user.user_name,
    userType: user.user_type,
    password: user.password,
    password_confirmation: user.password_confirmation
  }
}

const handleDelete = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  ElMessageBox.confirm(
    `确定删除选中的 ${selectedRows.value.length} 条数据吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      const ids = new Set(selectedRows.value.map((r: any) => String(r.id)))
      tableData.value = tableData.value.filter((r: any) => !ids.has(String(r.id)))
      selectedRows.value = []
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const fetchIntegratedProtocol = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getIntegratedProtocol(params)
  if (res.code === 200 && res.data) {
    form.enable = !!res.data.ONVIF
    form.version = res.data.ONVIF_version_number ?? ''

    const list = Array.isArray(res.data['用户列表']) ? res.data['用户列表'] : []
    tableData.value = list.map((u: any) => ({
      id: String(u.id ?? ''),
      username: u.user_name ?? '',
      userType: u.user_type ?? '',
      password: u.password ?? '',
      password_confirmation: u.password_confirmation ?? ''
    }))
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    ONVIF: !!form.enable,
    ONVIF_version_number: form.version,
    用户列表: tableData.value.map((u: any) => ({
      user_name: u.username,
      user_type: u.userType,
      password: u.password,
      password_confirmation: u.password_confirmation
    }))
  }
  const res: any = await saveIntegratedProtocol(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchIntegratedProtocol()
  }
}

onMounted(() => {
  fetchIntegratedProtocol()
})
</script>

<style lang="scss" scoped>
.integrationProtocolPage {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    width: 480px;

    .el-input {
      height: 40px;
    }
  }
}

.sectionTitle {
  margin: 40px 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: var(--el-color-primary);

  .line {
    width: 3px;
    height: 18px;
    background: var(--el-color-primary);
  }
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

.new_table {
  width: 880px;
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
