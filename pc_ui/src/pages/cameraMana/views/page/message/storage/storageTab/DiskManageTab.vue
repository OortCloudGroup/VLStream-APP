<template>
  <div class="diskManage">
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
              { svg: 'edit', name: '编辑', clickFn: () => handleEdit() },
              { svg: 'del', name: '删除', clickFn: () => handleDelete() },
            ]"
          />
        </div>
      </div>
      <div class="searchHeight_out flexRowAC">
        <search-height-box
          keyword="keyword"
          placeholder="搜索"
          :data="searchData"
          @handle="searchResetFn"
        />
      </div>
    </div>

    <TableSelf
      class="new_table"
      header-cell-class-name="header_cell"
      stripe
      :data="tableData"
      :row-class-name="tableRowClassName"
      current-row-key="id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <!-- 序号 -->
      <el-table-column label="序号" width="70">
        <template #default="scope">
          {{ scope.$index + (page - 1) * pageSize + 1 }}
        </template>
      </el-table-column>

      <el-table-column prop="diskName" label="硬盘名称" />
      <el-table-column prop="physicalType" label="物理类型" />
      <el-table-column prop="totalSpace" label="总空间（G）" />

      <!-- 剩余空间：进度条 + 文本 -->
      <el-table-column label="剩余空间">
        <template #default="scope">
          <div class="spaceCell">
            <el-progress
              :percentage="scope.row.freePercent"
              :stroke-width="8"
              :show-text="false"
              status="success"
            />
            <span class="spaceText">
              剩余可用空间：{{ scope.row.freeText }}
            </span>
          </div>
        </template>
      </el-table-column>

      <!-- 作为默认存储 -->
      <el-table-column prop="isDefault" label="作为默认存储">
        <template #default="scope">
          <el-switch v-model="scope.row.isDefault" />
        </template>
      </el-table-column>

      <!-- 存储位置 -->
      <el-table-column prop="path" label="存储位置" />

      <!-- 操作 -->
      <el-table-column fixed="right" align="right" label="操作">
        <template #default="scope">
          <el-tooltip
            content="编辑"
            effect="light"
            placement="top"
          >
            <div class="new_table_svg_group" @click="handleEdit(scope.row)">
              <oort-svg-icon width="20" height="20" name="table_edit" class="new_table_svg_group_svg" />
            </div>
          </el-tooltip>
          <el-tooltip
            content="删除"
            effect="light"
            placement="top"
          >
            <div class="new_table_svg_group" @click="handleDelete(scope.row)">
              <oort-svg-icon width="20" height="20" name="table_del" />
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
    </TableSelf>

    <div class="paginationBox flexRowAC">
      <el-pagination
        background
        :page-sizes="[5, 10, 20, 50]"
        :page-size="pageSize"
        layout="total, prev, pager, next, sizes"
        :total="count"
        class="justifyAlign"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="onSave">
        保 存
      </div>
    </div>

    <DiskAddDialog v-model:visible="addDialogVisible" @confirm="handleAddConfirm" />
    <DiskEditDialog
      v-model:visible="editDialogVisible"
      :initial-data="currentEditRow || undefined"
      @confirm="handleEditConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import TableSelf from '@/components/TableSelf.vue'
import ButtonGroup from '@/components/buttonGroup.vue'
import DiskAddDialog from '@/pages/cameraMana/views/page/message/storage/storageTab/DiskAddDialog.vue'
import DiskEditDialog from '@/pages/cameraMana/views/page/message/storage/storageTab/DiskEditDialog.vue'
import { ElMessage } from 'element-plus'
import { getStorageManage, saveStorageManage } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

type DiskRow = {
  id: string
  diskName: string
  physicalType: string
  totalSpace: number
  freePercent: number
  freeText: string
  freeSpace: number
  isDefault: boolean
  path: string
}

type ApiDisk = {
  name: string
  physical_type: string
  total_space_gb: number
  free_space_gb: number
  is_default: boolean
  mount_path: string
}

const toDiskRow = (d: ApiDisk, index: number): DiskRow => {
  const total = Number(d.total_space_gb) || 0
  const free = Number(d.free_space_gb) || 0
  const percent = total > 0 ? Math.max(0, Math.min(100, Math.round((free / total) * 100))) : 0
  return {
    id: String(index + 1),
    diskName: d.name || `存储盘${index + 1}`,
    physicalType: d.physical_type || 'DISK',
    totalSpace: total,
    freeSpace: free,
    freePercent: percent,
    freeText: `${free}GB`,
    isDefault: !!d.is_default,
    path: d.mount_path || ''
  }
}

const toApiDisk = (row: DiskRow): ApiDisk => {
  return {
    name: row.diskName,
    physical_type: row.physicalType,
    total_space_gb: Number(row.totalSpace) || 0,
    free_space_gb: Number(row.freeSpace) || 0,
    is_default: !!row.isDefault,
    mount_path: row.path
  }
}

const allData = ref<DiskRow[]>([])

const formSearch = reactive({
  keyword: ''
})

const searchData = ref<any[]>([
  {
    label: '硬盘名称',
    value: 'keyword',
    type: 'text',
    default: ''
  }
])

const page = ref(1)
const pageSize = ref(10)
const count = ref(0)

const filteredData = computed(() => {
  const kw = formSearch.keyword.trim()
  if (!kw) return allData.value
  return allData.value.filter(row => row.diskName.includes(kw) || row.path.includes(kw))
})

const tableData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const fetchStorageManage = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getStorageManage(params)
  if (res?.code === 200 && Array.isArray(res.data?.disks)) {
    allData.value = res.data.disks.map((d: ApiDisk, idx: number) => toDiskRow(d, idx))
    count.value = allData.value.length
    page.value = 1
  }
}

const searchResetFn = (val: any, reset: boolean) => {
  if (reset) page.value = 1
  formSearch.keyword = val.keyword || ''
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
}

const handleCurrentChange = (val: number) => {
  page.value = val
}

const tableRowClassName = () => ''

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentEditRow = ref<DiskRow | null>(null)
const selectedRows = ref<DiskRow[]>([])

const handleSelectionChange = (rows: DiskRow[]) => {
  selectedRows.value = rows
}

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleEdit = (row?: DiskRow) => {
  // 行内编辑：直接编辑当前行；工具栏编辑：必须勾选 1 条
  let targetRow: DiskRow | undefined
  if (row) {
    targetRow = row
  } else {
    if (selectedRows.value.length !== 1) {
      ElMessage.warning('只能选择一条数据进行编辑')
      return
    }
    [targetRow] = selectedRows.value
  }

  currentEditRow.value = { ...targetRow }
  editDialogVisible.value = true
}

const handleDelete = (row?: DiskRow) => {
  const idsToDelete = new Set<string>()
  if (row) {
    idsToDelete.add(row.id)
  } else {
    selectedRows.value.forEach(r => idsToDelete.add(r.id))
  }

  if (idsToDelete.size === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  allData.value = allData.value.filter(r => !idsToDelete.has(r.id))
  selectedRows.value = []
  count.value = allData.value.length
}

const onSave = async() => {
  const params: any = {
    accessToken: store.userInfo?.accessToken,
    disks: allData.value.map(toApiDisk)
  }
  const res: any = await saveStorageManage(params)
  if (res?.code === 200) {
    ElMessage.success('保存成功')
    await fetchStorageManage()
  }
}

const handleAddConfirm = (disk: { diskName: string; physicalType: string; totalSpace: number | string; path: string; isDefault: boolean }) => {
  const maxId = allData.value.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0)
  const total = Number(disk.totalSpace) || 0
  const free = 0
  const percent = total > 0 ? 0 : 0
  allData.value.push({
    id: String(maxId + 1),
    diskName: disk.diskName || `存储盘${maxId + 1}`,
    physicalType: disk.physicalType || 'DISK',
    totalSpace: total,
    freeSpace: free,
    freePercent: percent,
    freeText: `${free}GB`,
    isDefault: !!disk.isDefault,
    path: disk.path || ''
  })
  count.value = allData.value.length
}

const handleEditConfirm = (disk: { diskName: string; physicalType: string; totalSpace: number | string; path: string; isDefault: boolean }) => {
  if (!currentEditRow.value) return
  const targetId = currentEditRow.value.id
  const index = allData.value.findIndex(item => item.id === targetId)
  if (index === -1) return

  const nextTotal = Number(disk.totalSpace) || allData.value[index].totalSpace
  const nextFree = allData.value[index].freeSpace
  const nextPercent = nextTotal > 0 ? Math.max(0, Math.min(100, Math.round((nextFree / nextTotal) * 100))) : 0
  allData.value[index] = {
    ...allData.value[index],
    diskName: disk.diskName || allData.value[index].diskName,
    physicalType: disk.physicalType || allData.value[index].physicalType,
    totalSpace: nextTotal,
    freePercent: nextPercent,
    freeText: `${nextFree}GB`,
    isDefault: !!disk.isDefault,
    path: disk.path || allData.value[index].path
  }
}

onMounted(() => {
  fetchStorageManage()
})
</script>

<style lang="scss" scoped>
.diskManage {
  padding: 0 20px;
  width: 100%;
}

.depNameBox_out {
  justify-content: space-between;
  margin-bottom: 10px;
  padding-top: 4px;
}

.exportBtnBox {
  gap: 12px;
}

.button-groupBox {
  display: flex;
  align-items: center;
}

.searchHeight_out {
  gap: 12px;
}

.spaceCell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 8px 0;

  :deep(.el-progress) {
    width: 180px;
  }

  :deep(.el-progress-bar__outer) {
    height: 8px !important;
    border-radius: 999px !important;
    background-color: #F3F4F6 !important;
  }

  :deep(.el-progress-bar__inner) {
    border-radius: 999px !important;
    background-color: #00DD59 !important;
  }

  .spaceText {
    font-size: 12px;
    color: #666666;
  }
}

.paginationBox {
  justify-content: flex-end;
  padding: 18px 0 0;
}

.submitBox {
  padding: 40px 20px;

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

/* 表头样式（与 Log.vue 保持一致） */
:deep(.header_cell) {
  color: #333;
  background-color: #fafafa;
}
</style>
