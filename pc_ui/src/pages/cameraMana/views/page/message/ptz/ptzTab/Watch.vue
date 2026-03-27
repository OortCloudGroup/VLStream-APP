<template>
  <div class="basicInfo">
    <div class="limit_enable_row">
      <el-checkbox v-model="form.enable">
        启用基本位置功能
      </el-checkbox>
    </div>
    <!-- 上方：视频预览、PTZ控制和预置点 -->
    <div class="basic_top">
      <RoiTop v-model:roi-points="roiPoints" />
    </div>

    <!-- 下方：表单配置 -->
    <div class="basic_bottom">
      <div class="sectionTitle">
        <span>守望行为设置</span>
      </div>

      <el-form class="sbForm" :model="form">
        <!-- 巡航模式 -->
        <el-form-item class="watch_mode_form_item">
          <div class="watch_mode_group">
            <div
              v-for="item in watchModeOptions"
              :key="item.value"
              class="watch_mode_item"
              @click="form.watchMode = item.value"
            >
              <img
                :src="form.watchMode === item.value ? checkedImg : uncheckImg"
                alt=""
                class="watch_mode_icon"
              />
              <span class="watch_mode_label">{{ item.label }}</span>
            </div>
          </div>
        </el-form-item>

        <!-- 行为勾选项 -->
        <el-form-item class="trigger_form_item">
          <div class="trigger_row">
            <el-checkbox v-model="form.returnToHome">
              巡航后返回基本位置
            </el-checkbox>
          </div>
          <div class="trigger_row">
            <el-checkbox v-model="form.stopOnControl">
              收到控制指令后立即停止守望
            </el-checkbox>
          </div>
        </el-form-item>

        <!-- 守望触发条件 -->
        <el-form-item label="守望触发条件" class="trigger_form_item">
          <div class="trigger_row">
            <el-checkbox v-model="form.triggerNoOp" />
            <span class="trigger_label">无操作</span>
            <el-input
              v-model.number="form.triggerNoOpSeconds"
              placeholder="0"
              class="trigger_input"
            >
              <template #suffix>
                秒
              </template>
            </el-input>
            <span class="trigger_suffix">后自动启动守望</span>
          </div>
          <div class="trigger_row">
            <el-checkbox v-model="form.enableTimeRange" />
            <span class="trigger_label">仅在工作时间段启用，开始时间：</span>
            <el-time-picker
              v-model="form.startTime"
              placeholder="00:00"
              class="time_input"
              format="HH:mm"
              value-format="HH:mm"
            />
            <span class="trigger_label">，结束时间：</span>
            <el-time-picker
              v-model="form.endTime"
              placeholder="00:00"
              class="time_input"
              format="HH:mm"
              value-format="HH:mm"
            />
          </div>
        </el-form-item>
      </el-form>

      <div class="sectionTitle">
        <span>守望巡航路线设置</span>
      </div>

      <div class="depNameBox_out flexRowAC">
        <div class="exportBtnBox flexRowAC bt-gap">
          <el-button type="primary" class="newBtn flexRowAC" @click="handleAddRoute">
            <el-icon>
              <Plus />
            </el-icon>
            <span>新增</span>
          </el-button>
          <div class="button-groupBox">
            <button-group
              :button-list="[
                { svg: 'del', name: '删除', clickFn: handleDeleteRoute }
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
        <el-table-column prop="preset" label="预设点" />
        <el-table-column prop="stayTime" label="停留时间" />
        <el-table-column prop="speedLabel" label="巡航速度" />
        <el-table-column prop="enabled" label="是否启用">
          <template #default="scope">
            <el-switch v-model="scope.row.enabled" />
          </template>
        </el-table-column>
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

      <div class="watch_test_box">
        <button-group
          :button-list="[
            { svg: 'qdcs', name: '启动守望测试', clickFn: handleStartWatchTest },
            { svg: 'tzcs', name: '停止测试', clickFn: handleStopWatchTest }
          ]"
        />
      </div>
    </div>

    <WatchAddDialog v-model:visible="addDialogVisible" @confirm="handleAddConfirm" />
    <WatchEditDialog
      v-model:visible="editDialogVisible"
      :data="editDialogData"
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
import ButtonGroup from '@/components/buttonGroup.vue'
import TableSelf from '@/components/TableSelf.vue'
import { Plus } from '@element-plus/icons-vue'
import RoiTop from '@/pages/cameraMana/views/page/message/components/RoiTop.vue'
import uncheckImg from '@/assets/img/camera/uncheck.png'
import checkedImg from '@/assets/img/camera/checked.png'
import WatchAddDialog from '@/pages/cameraMana/views/page/message/ptz/ptzTab/WatchAddDialog.vue'
import WatchEditDialog, { type WatchForm as EditWatchForm } from '@/pages/cameraMana/views/page/message/ptz/ptzTab/WatchEditDialog.vue'
import { ElMessage } from 'element-plus'
import { getWatch, saveWatch, watchOperation } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

const form = reactive({
  enable: true,
  watchMode: 'loop',
  returnToHome: false,
  stopOnControl: false,
  triggerNoOp: true,
  triggerNoOpSeconds: 0,
  enableTimeRange: false,
  startTime: '00:00',
  endTime: '00:00'
})

const watchModeOptions = [
  { label: '循环巡航（按路线重复巡检）', value: 'loop' },
  { label: '单次巡航（完成后停止）', value: 'single' }
]

const patrolModeToApi: Record<string, string> = {
  loop: '循环巡航',
  single: '单次巡航'
}

const patrolModeFromApi: Record<string, string> = {
  '循环巡航': 'loop',
  '单次巡航': 'single'
}

const presetLabelMap: Record<string, string> = {
  preset1: '预设点1',
  preset2: '预设点2',
  preset3: '预设点3'
}

const presetValueFromLabel: Record<string, string> = {
  '预设点1': 'preset1',
  '预设点2': 'preset2',
  '预设点3': 'preset3'
}

const speedLabelMap: Record<string, string> = {
  low: '低速',
  medium: '中速',
  high: '高速'
}

const speedValueFromLabel: Record<string, string> = {
  '低速': 'low',
  '中速': 'medium',
  '高速': 'high'
}

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

const tableData = ref([
  {
    id: '1',
    preset: '预设点1',
    stayTime: '10s',
    speedLabel: '低速',
    enabled: true
  },
  {
    id: '2',
    preset: '预设点1',
    stayTime: '20s',
    speedLabel: '中速',
    enabled: false
  }
])

const selectedRows = ref<any[]>([])

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editDialogData = ref<Partial<EditWatchForm> | null>(null)
const editingRowId = ref<string | null>(null)

const tableSelectChange = (rows: any[]) => {
  selectedRows.value = rows || []
}

const handleAddRoute = () => {
  addDialogVisible.value = true
}

const handleDeleteRoute = () => {
  if (selectedRows.value.length === 0) {
    return
  }
  const selectedIds = selectedRows.value.map(row => row.id)
  tableData.value = tableData.value.filter(item => !selectedIds.includes(item.id))
  selectedRows.value = []
}

const handleEditRoute = (row: any) => {
  editingRowId.value = String(row?.id ?? '')

  const presetValue = presetValueFromLabel[row?.preset] || row?.preset || ''
  const speedValue = speedValueFromLabel[row?.speedLabel] || row?.speedLabel || 'low'
  const patrolTime = Number(String(row?.stayTime || '').replace(/s$/i, ''))

  editDialogData.value = {
    presetsPoint: presetValue,
    patrolTime: Number.isFinite(patrolTime) ? patrolTime : 10,
    patrolSpeed: speedValue,
    enabled: !!row?.enabled
  }
  editDialogVisible.value = true
}

const handleDeleteOneRoute = (row: any) => {
  tableData.value = tableData.value.filter(item => item.id !== row.id)
}

const fetchWatch = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getWatch(params)
  if (res.code === 200 && res.data) {
    const data = res.data
    form.enable = !!(data.enable_watch ?? form.enable)
    form.watchMode = patrolModeFromApi[data.patrol_mode] || form.watchMode
    form.returnToHome = !!(data.return_to_basic_position ?? form.returnToHome)
    form.stopOnControl = !!(data.stop_on_control_command ?? form.stopOnControl)
    form.triggerNoOp = !!(data.auto_start_after_idle ?? form.triggerNoOp)
    form.triggerNoOpSeconds = Number(data.idle_time ?? form.triggerNoOpSeconds)
    form.enableTimeRange = !!(data.enable_working_hours ?? form.enableTimeRange)
    form.startTime = data.start_time || form.startTime
    form.endTime = data.end_time || form.endTime

    if (Array.isArray(data.routes)) {
      tableData.value = data.routes.map((r: any, idx: number) => ({
        id: String(idx + 1),
        preset: r.preset ?? '',
        stayTime: r.dwell_time ?? '',
        speedLabel: r.speed ?? '',
        enabled: !!r.enabled
      }))
      selectedRows.value = []
    }
  }
}

const handleStartWatchTest = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'start_test'
  }
  const res: any = await watchOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const handleStopWatchTest = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'stop_test'
  }
  const res: any = await watchOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const generateRowId = () => {
  const ids = (tableData.value || [])
    .map((r: any) => Number(r?.id))
    .filter((n: number) => Number.isFinite(n))
  const maxId = ids.length ? Math.max(...ids) : 0
  return String(maxId + 1)
}

const handleAddConfirm = (data: any) => {
  const presetLabel = presetLabelMap[data?.presetsPoint] || data?.presetsPoint || ''
  const patrolTime = Number(data?.patrolTime)
  const speedLabel = speedLabelMap[data?.patrolSpeed] || data?.patrolSpeed || ''

  if (!presetLabel) {
    ElMessage.warning('请选择预设点')
    return
  }
  if (!Number.isFinite(patrolTime) || patrolTime <= 0) {
    ElMessage.warning('请输入正确的巡航时间')
    return
  }
  if (!speedLabel) {
    ElMessage.warning('请选择巡航速度')
    return
  }

  tableData.value.push({
    id: generateRowId(),
    preset: presetLabel,
    stayTime: `${patrolTime}s`,
    speedLabel,
    enabled: !!data?.enabled
  })
}

const handleEditConfirm = (data: any) => {
  const rowId = editingRowId.value
  if (!rowId) {
    return
  }

  const presetLabel = presetLabelMap[data?.presetsPoint] || data?.presetsPoint || ''
  const patrolTime = Number(data?.patrolTime)
  const speedLabel = speedLabelMap[data?.patrolSpeed] || data?.patrolSpeed || ''

  if (!presetLabel) {
    ElMessage.warning('请选择预设点')
    return
  }
  if (!Number.isFinite(patrolTime) || patrolTime <= 0) {
    ElMessage.warning('请输入正确的巡航时间')
    return
  }
  if (!speedLabel) {
    ElMessage.warning('请选择巡航速度')
    return
  }

  const idx = (tableData.value || []).findIndex((r: any) => String(r?.id) === rowId)
  if (idx < 0) {
    return
  }

  const oldRow = tableData.value[idx]
  tableData.value[idx] = {
    ...oldRow,
    preset: presetLabel,
    stayTime: `${patrolTime}s`,
    speedLabel,
    enabled: !!data?.enabled
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    enable_watch: form.enable,
    patrol_mode: patrolModeToApi[form.watchMode] || '循环巡航',
    return_to_basic_position: form.returnToHome,
    stop_on_control_command: form.stopOnControl,
    auto_start_after_idle: form.triggerNoOp,
    idle_time: Number(form.triggerNoOpSeconds) || 0,
    enable_working_hours: form.enableTimeRange,
    start_time: form.startTime,
    end_time: form.endTime,
    routes: (tableData.value || []).map((r: any) => ({
      preset: r.preset,
      dwell_time: r.stayTime,
      speed: r.speedLabel,
      enabled: !!r.enabled
    }))
  }
  const res: any = await saveWatch(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchWatch()
  }
}

onMounted(() => {
  fetchWatch()
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

// 上方区域，仅作为 RoiTop 容器
.basic_top {
  margin-bottom: 20px;
}

// 下方表单配置
.basic_bottom {
  width: 880px;
  background-color: #fff;

  .sbForm {
    .el-input {
      height: 40px;
    }
  }

  :deep(.el-form-item__label) {
    font-size: 16px;
    color: #333;
    padding-bottom: 10px;
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background: #fff;
    box-shadow: 0 0 0 1px #EDEDED inset;
  }

  :deep(.el-input.is-disabled .el-input__inner) {
    -webkit-text-fill-color: #B3B3B3;
    color: #B3B3B3;
  }
}

.watch_mode_group {
  display: flex;
  align-items: center;
  gap: 40px;
}

.watch_mode_item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.watch_mode_icon {
  width: 24px;
  height: 24px;
}

.watch_mode_label {
  margin-left: 4px;
  font-size: 14px;
  color: #333;
}

.speed_group {
  display: flex;
  align-items: center;
  gap: 40px;
}

.speed_item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.speed_icon {
  width: 24px;
  height: 24px;
}

.speed_label {
  margin-left: 4px;
  font-size: 14px;
  color: #333;
}

.delay_row {
  display: flex;
  align-items: center;
}

.delay_input {
  width: 220px;
}

.helper_text {
  margin-top: 4px;
  font-size: 12px;
  color: #999999;
}

.trigger_row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .trigger_label {
    margin-left: 8px;
    font-size: 14px;
    color: #333;
  }

  .trigger_input {
    margin-left: 16px;
    width: 120px;
  }

  .trigger_suffix {
    margin-left: 8px;
    font-size: 14px;
    color: #333;
  }
}

.time_input {
  width: 140px;
}

.button-groupBox {
  display: flex;
  align-items: center;
}

.trigger_form_item{
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  :deep(.el-form-item__content) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  :deep(.el-form-item__label){
    justify-content: flex-start;
  }
}

.sectionTitle {
  font-size: 16px;
  line-height: 22px;
  color: #000000;
  margin-bottom: 14px;
}

.bt-gap {
  gap: 16px;
}

/* 表头样式 */
::deep(.header_cell) {
  color: #333;
  background-color: #FAFAFA;
}

.watch_test_box {
  margin: 24px 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
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
    cursor: pointer;
  }
}

.watch_mode_form_item{
  margin-bottom: 10px;
}
</style>
