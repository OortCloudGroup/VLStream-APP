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
      <el-form class="sbForm" label-position="top" :model="form">
        <!-- 归位速度 -->
        <el-form-item label="归位速度">
          <div class="speed_group">
            <div
              v-for="item in speedOptions"
              :key="item.value"
              class="speed_item"
              @click="form.returnSpeed = item.value"
            >
              <img
                :src="form.returnSpeed === item.value ? checkedImg : uncheckImg"
                alt=""
                class="speed_icon"
              />
              <span class="speed_label">{{ item.label }}</span>
            </div>
          </div>
        </el-form-item>

        <!-- 归位延迟 -->
        <el-form-item label="归位延迟" class="trigger_form_item">
          <div class="delay_row">
            <el-input
              v-model.number="form.returnDelay"
              placeholder="0"
              class="delay_input"
            >
              <template #suffix>
                秒
              </template>
            </el-input>
          </div>
          <div class="helper_text">
            触发归位后延迟执行的时间
          </div>
        </el-form-item>

        <!-- 归位触发条件 -->
        <el-form-item label="归位触发条件" class="trigger_form_item">
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
            <span class="trigger_suffix">后自动归位</span>
          </div>
          <div class="trigger_row">
            <el-checkbox v-model="form.triggerPresetDone" />
            <span class="trigger_label">预设点调用完成后自动归位</span>
          </div>
          <div class="trigger_row">
            <el-checkbox v-model="form.triggerPowerRecovery" />
            <span class="trigger_label">断电恢复后自动归位</span>
          </div>
        </el-form-item>
      </el-form>

      <div class="button-groupBox">
        <button-group
          :button-list="[
            { svg: 'yjhw', name: '一键回位', clickFn: handleOneKeyReturn },
            { svg: 'setting', name: '设置当前定位为默认位', clickFn: handleSetDefaultPos },
            { svg: 'kszdjz', name: '开始自动校准', clickFn: handleStartCalibrate }
          ]"
        />
      </div>
    </div>

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
import RoiTop from '@/pages/cameraMana/views/page/message/components/RoiTop.vue'
import uncheckImg from '@/assets/img/camera/uncheck.png'
import checkedImg from '@/assets/img/camera/checked.png'
import { getPtzBasic, savePtzBasic, ptzOperation } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  enable: true,
  returnSpeed: 'low',
  returnDelay: 0,
  triggerNoOp: true,
  triggerNoOpSeconds: 0,
  triggerPresetDone: false,
  triggerPowerRecovery: false
})

const speedOptions = [
  { label: '低速', value: 'low' },
  { label: '中速', value: 'medium' },
  { label: '高速', value: 'high' }
]

const speedMapToApi: Record<string, string> = {
  low: '低速',
  medium: '中速',
  high: '高速'
}

const speedMapFromApi: Record<string, string> = {
  '低速': 'low',
  '中速': 'medium',
  '高速': 'high'
}

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

const fetchPtzBasic = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getPtzBasic(params)
  if (res.code === 200 && res.data) {
    const data = res.data
    form.enable = data.enable_basic_position ?? form.enable
    form.returnSpeed = speedMapFromApi[data.home_speed] || form.returnSpeed
    form.returnDelay = Number(data.home_delay ?? form.returnDelay)

    const trig = data.home_trigger_conditions || {}
    form.triggerNoOp = !!trig.auto_home_after_idle_time
    form.triggerNoOpSeconds = Number(trig.idle_time ?? form.triggerNoOpSeconds)
    form.triggerPresetDone = !!trig.auto_home_after_preset
    form.triggerPowerRecovery = !!trig.auto_home_after_power_recovery
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    enable_basic_position: form.enable,
    home_speed: speedMapToApi[form.returnSpeed] || '低速',
    home_delay: Number(form.returnDelay) || 0,
    home_trigger_conditions: {
      auto_home_after_idle_time: form.triggerNoOp,
      idle_time: Number(form.triggerNoOpSeconds) || 0,
      auto_home_after_preset: form.triggerPresetDone,
      auto_home_after_power_recovery: form.triggerPowerRecovery
    }
  }
  const res: any = await savePtzBasic(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchPtzBasic()
  }
}

const handleOneKeyReturn = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'home'
  }
  const res: any = await ptzOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const handleSetDefaultPos = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'set_default'
  }
  const res: any = await ptzOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const handleStartCalibrate = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'start_calibration'
  }
  const res: any = await ptzOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

onMounted(() => {
  fetchPtzBasic()
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
  width: 560px;
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

.button-groupBox {
  margin-top: 24px;
  padding-bottom: 16px;
  display: flex;
  align-items: center;
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

.trigger_form_item{
  :deep(.el-form-item__content) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
