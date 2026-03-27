<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="ipFilterPage">
    <el-form label-position="top" class="sbForm" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.ipFilterEnabled">
          启用IP地址过滤
        </el-checkbox>
      </el-form-item>

      <el-form-item label="IP地址过滤方式">
        <el-select v-model="form.ipFilterMode" class="full-select" placeholder="请选择">
          <el-option v-for="item in modeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
    </el-form>

    <div class="sectionTitle">
      <span class="line" />
      <span>IP地址过滤</span>
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
      current-row-key="check_id"
      @selection-change="tableSelectChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" width="90">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP" />
      <el-table-column fixed="right" align="right" label="操作" />
    </TableSelf>

    <AddIpDialog v-model:visible="addDialogVisible" @confirm="handleAddConfirm" />
    <EditIpDialog
      v-model:visible="editDialogVisible"
      :ip="editIp"
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
import { computed, onMounted, ref } from 'vue'
import TableSelf from '@/components/TableSelf.vue'
import ButtonGroup from '@/components/buttonGroup.vue'
import { Plus } from '@element-plus/icons-vue'
import AddIpDialog from './AddIpDialog.vue'
import EditIpDialog from './EditIpDialog.vue'
import { getIpFilter, saveIpFilter } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  ipFilterEnabled: false,
  ipFilterMode: '',
  ipFilterList: [] as Array<{ check_id: string, ip: string }>
})

const modeOptions = [
  { label: '允许', value: '允许' },
  { label: '不允许', value: '不允许' }
]

const selectedRows = ref<any[]>([])
const tableSelectChange = (rows: any[]) => {
  selectedRows.value = rows || []
}

const tableData = computed(() => {
  return Array.isArray(form.value.ipFilterList) ? form.value.ipFilterList : []
})

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editIp = ref('')
const editRowId = ref<string | null>(null)

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleAddConfirm = (ip: string) => {
  const list = form.value.ipFilterList || []
  const maxId = list.reduce((max: number, item: any) => {
    const idNum = Number(item.check_id) || 0
    return Math.max(max, idNum)
  }, 0)
  list.push({
    check_id: String(maxId + 1),
    ip
  })
  form.value.ipFilterList = [...list]
}
const handleEdit = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要编辑的IP')
    return
  }
  if (selectedRows.value.length > 1) {
    ElMessage.warning('请只选择一个IP进行编辑')
    return
  }
  const row = selectedRows.value[0]
  editIp.value = row.ip || ''
  editRowId.value = row.check_id
  editDialogVisible.value = true
}

const handleEditConfirm = (ip: string) => {
  if (!editRowId.value) return
  const list = form.value.ipFilterList || []
  const index = list.findIndex((item: any) => item.check_id === editRowId.value)
  if (index === -1) return
  list[index] = {
    ...list[index],
    ip
  }
  form.value.ipFilterList = [...list]
}

const handleDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的IP')
    return
  }

  const deleteIds = selectedRows.value.map((row: any) => row.check_id)
  const list = form.value.ipFilterList || []
  form.value.ipFilterList = list.filter((item: any) => !deleteIds.includes(item.check_id))
  selectedRows.value = []

  ElMessage.success('删除成功')
}

const fetchIpFilter = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getIpFilter(params)
  if (res.code === 200 && res.data) {
    form.value.ipFilterEnabled = !!res.data.ip_filter
    form.value.ipFilterMode = res.data.ip_filter_method || ''
    const list = Array.isArray(res.data['IP地址过滤']) ? res.data['IP地址过滤'] : []
    form.value.ipFilterList = list.map((item: any) => ({
      check_id: String(item.id ?? ''),
      ip: item.ip || ''
    }))
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    ip_filter: !!form.value.ipFilterEnabled,
    ip_filter_method: form.value.ipFilterMode,
    'IP地址过滤': (form.value.ipFilterList || []).map((item: any) => ({
      id: Number(item.check_id) || 0,
      ip: item.ip
    }))
  }
  const res: any = await saveIpFilter(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchIpFilter()
  }
}

onMounted(() => {
  fetchIpFilter()
})
</script>

<style lang="scss" scoped>
.ipFilterPage {
  width: 100%;
}

.sbForm {
  width: 600px;

  .el-input {
    height: 40px;
  }

  .el-select {
    width: 100%;
  }
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
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

.submitBox {
  padding: 40px 0 0;

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

/* 表头样式 */
:deep(.header_cell) {
  color: #333;
  background-color: #FAFAFA;
}

.bt-gap{
  gap: 16px;
}
</style>

