<template>
  <div class="basicInfo">
    <div class="limit_enable_row">
      <el-checkbox v-model="form.enable">
        启用隐私遮蔽
      </el-checkbox>
    </div>

    <!-- 上方：视频预览、PTZ控制和预置点 -->
    <div class="basic_top">
      <RoiTop v-model:roi-points="roiPoints" />
    </div>

    <!-- 下方：表单配置 -->
    <div class="basic_bottom">
      <div class="sectionTitle">
        <span class="line" />
        <span>码流类型</span>
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
        @selection-change="tableSelectChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="90">
          <template #default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="title" label="隐私块标题" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="enabled" label="启用">
          <template #default="scope">
            {{ scope.row.enabled ? '是' : '否' }}
          </template>
        </el-table-column>
        <el-table-column prop="ratio" label="屏蔽倍率" />
        <el-table-column fixed="right" align="right" label="操作">
          <template #default="scope">
            <el-tooltip
              content="编辑"
              effect="light"
              placement="top"
            >
              <div class="new_table_svg_group" @click="handleEditRoute(scope.row)">
                <oort-svg-icon width="20" height="20" name="table_edit" class="new_table_svg_group_svg" />
              </div>
            </el-tooltip>
            <el-tooltip
              content="删除"
              effect="light"
              placement="top"
            >
              <div class="new_table_svg_group" @click="handleDeleteOneRoute(scope.row)">
                <oort-svg-icon width="20" height="20" name="table_del" />
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
      </TableSelf>
    </div>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
    <PrivacyMaskAddDialog v-model:visible="addDialogVisible" @confirm="handleAddConfirm" />
    <PrivacyMaskEditDialog
      v-model:visible="editDialogVisible"
      :data="editDialogData"
      @confirm="handleEditConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import TableSelf from '@/components/TableSelf.vue'
import ButtonGroup from '@/components/buttonGroup.vue'
import { Plus } from '@element-plus/icons-vue'
import RoiTop from '@/pages/cameraMana/views/page/message/components/RoiTop.vue'
import { ElMessage } from 'element-plus'
import { getPrivacyMask, savePrivacyMask } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import PrivacyMaskAddDialog, { type PrivacyMaskForm as AddPrivacyMaskForm } from '@/pages/cameraMana/views/page/message/ptz/ptzTab/PrivacyMaskAddDialog.vue'
import PrivacyMaskEditDialog, { type PrivacyMaskForm as EditPrivacyMaskForm } from '@/pages/cameraMana/views/page/message/ptz/ptzTab/PrivacyMaskEditDialog.vue'

const store: any = useUserStore()

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

const form = reactive({
  enable: true
})

const selectedRows = ref<any[]>([])
const tableSelectChange = (rows: any[]) => {
  selectedRows.value = rows || []
}

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editDialogData = ref<Partial<EditPrivacyMaskForm> | null>(null)
const editingRowId = ref<string | null>(null)

const tableData = ref([
  {
    id: '1',
    title: 'Mask1',
    type: '灰色',
    enabled: true,
    ratio: '1'
  },
  {
    id: '2',
    title: 'Mask2',
    type: '灰色',
    enabled: true,
    ratio: '1'
  }
])

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleDelete = () => {
  // TODO: 后续接弹窗/接口；可使用 selectedRows.value
  if (selectedRows.value.length === 0) {
    return
  }
  const selectedIds = selectedRows.value.map(row => row.id)
  tableData.value = tableData.value.filter(item => !selectedIds.includes(item.id))
  selectedRows.value = []
}

const generateRowId = () => {
  const ids = (tableData.value || [])
    .map((r: any) => Number(r?.id))
    .filter((n: number) => Number.isFinite(n))
  const maxId = ids.length ? Math.max(...ids) : 0
  return String(maxId + 1)
}

const handleAddConfirm = (data: AddPrivacyMaskForm) => {
  if (!data.privacy_block_title) {
    ElMessage.warning('请输入隐私块标题')
    return
  }
  if (!data.type) {
    ElMessage.warning('请选择类型')
    return
  }
  const power = Number(data.shielding_power)
  if (!Number.isFinite(power) || power <= 0) {
    ElMessage.warning('请输入正确的屏蔽倍率')
    return
  }

  tableData.value.push({
    id: generateRowId(),
    title: data.privacy_block_title,
    type: data.type,
    enabled: !!data.enabled,
    ratio: String(power)
  })
}

const handleEditRoute = (row: any) => {
  editingRowId.value = String(row?.id ?? '')
  editDialogData.value = {
    privacy_block_title: row?.title || '',
    type: row?.type || '灰色',
    enabled: !!row?.enabled,
    shielding_power: Number(row?.ratio) || 1
  }
  editDialogVisible.value = true
}

const handleEditConfirm = (data: EditPrivacyMaskForm) => {
  const rowId = editingRowId.value
  if (!rowId) {
    return
  }
  if (!data.privacy_block_title) {
    ElMessage.warning('请输入隐私块标题')
    return
  }
  if (!data.type) {
    ElMessage.warning('请选择类型')
    return
  }
  const power = Number(data.shielding_power)
  if (!Number.isFinite(power) || power <= 0) {
    ElMessage.warning('请输入正确的屏蔽倍率')
    return
  }

  const idx = (tableData.value || []).findIndex((r: any) => String(r?.id) === rowId)
  if (idx < 0) {
    return
  }
  const oldRow = tableData.value[idx]
  tableData.value[idx] = {
    ...oldRow,
    title: data.privacy_block_title,
    type: data.type,
    enabled: !!data.enabled,
    ratio: String(power)
  }
}

const handleDeleteOneRoute = (row: any) => {
  tableData.value = tableData.value.filter(item => item.id !== row.id)
}

const fetchPrivacyMask = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getPrivacyMask(params)
  if (res.code === 200 && res.data) {
    const data = res.data
    form.enable = !!(data.privacy_mask ?? data.enable ?? form.enable)

    const list = (data['码流类型'] || data.streams || data.list) as any
    if (Array.isArray(list)) {
      tableData.value = list.map((item: any, idx: number) => ({
        id: String(idx + 1),
        title: item.privacy_block_title ?? item.title ?? '',
        type: item.type ?? '',
        enabled: item.enabled === '是' ? true : !!item.enabled,
        ratio: String(item.shielding_power ?? item.ratio ?? '1')
      }))
      selectedRows.value = []
    }
  }
}

const handleSave = async() => {
  const params: any = {
    accessToken: store.userInfo?.accessToken,
    privacy_mask: form.enable,
    '码流类型': (tableData.value || []).map((row: any) => ({
      privacy_block_title: row.title,
      type: row.type,
      enabled: row.enabled ? '是' : '否',
      shielding_power: Number(row.ratio) || 0
    }))
  }
  const res: any = await savePrivacyMask(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchPrivacyMask()
  }
}

onMounted(() => {
  fetchPrivacyMask()
})
</script>

<style lang="scss" scoped>
.basicInfo {
  width: 100%;
  padding: 0 20px 20px 20px;
}

.limit_enable_row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  :deep(.el-checkbox) {
    height: 24px;
  }

  :deep(.el-checkbox__label) {
    font-size: 14px;
    color: #000;
    font-weight: normal;
  }
}

// 上方区域
.basic_top {
  gap: 20px;
}

// 下方表单配置
.basic_bottom {
  width: 880px;
  background-color: #fff;
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
  margin-bottom: 20px;
}

.bt-gap {
  gap: 16px;
}

/* 表头样式 */
:deep(.header_cell) {
  color: #333;
  background-color: #FAFAFA;
}
.submitBox {
  padding: 40px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;

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
