<template>
  <div class="imageParamSwitch">
    <el-form class="sbForm" label-position="top" :model="form">
      <!-- 关联预置点 -->
      <div class="section-container">
        <el-form-item>
          <div class="checkbox-wrapper" @click="form.linkPreset = !form.linkPreset">
            <img
              :src="form.linkPreset ? checkedImg : uncheckImg"
              alt=""
              class="checkbox-img"
            />
            <span class="checkbox-label">关联预置点</span>
          </div>
        </el-form-item>

        <div class="section-content">
          <!-- 预置点 -->
          <el-form-item label="预置点" style="width: 37.5%;">
            <el-select v-model="form.presetPoint" placeholder="请选择" class="full-select">
              <el-option label="1" value="1" />
              <el-option label="2" value="2" />
              <el-option label="3" value="3" />
            </el-select>
          </el-form-item>

          <!-- 时间段配置 -->
          <div v-for="(period, index) in form.timePeriods" :key="index" class="time-period-row">
            <el-checkbox v-model="period.enabled" class="period-checkbox" />
            <span class="period-label">时间段{{ index + 1 }}</span>
            <div class="time-range-wrapper">
              <el-time-picker
                v-model="period.startTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="00:00:00"
                class="time-picker"
              />
              <span class="time-separator">-</span>
              <el-time-picker
                v-model="period.endTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="00:00:00"
                class="time-picker"
              />
            </div>
            <div class="scene-wrapper">
              <span class="scene-label">关联场景</span>
              <el-select v-model="period.scene" placeholder="请选择" class="scene-select">
                <el-option label="室内" value="indoor" />
                <el-option label="室外" value="outdoor" />
              </el-select>
            </div>
          </div>
        </div>
      </div>

      <!-- 定时切换 -->
      <div class="section-container">
        <el-form-item>
          <div class="checkbox-wrapper" @click="form.switchMode = !form.switchMode">
            <img
              :src="form.switchMode ? checkedImg : uncheckImg"
              alt=""
              class="checkbox-img"
            />
            <span class="checkbox-label">定时切换</span>
          </div>
        </el-form-item>

        <div class="section-content">
          <!-- 时间段配置 -->
          <div v-for="(period, index) in form.timedPeriods" :key="index" class="time-period-row">
            <el-checkbox v-model="period.enabled" class="period-checkbox" />
            <span class="period-label">时间段{{ index + 1 }}</span>
            <div class="time-range-wrapper">
              <el-time-picker
                v-model="period.startTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="00:00:00"
                class="time-picker"
              />
              <span class="time-separator">-</span>
              <el-time-picker
                v-model="period.endTime"
                format="HH:mm:ss"
                value-format="HH:mm:ss"
                placeholder="00:00:00"
                class="time-picker"
              />
            </div>
            <div class="scene-wrapper">
              <span class="scene-label">关联场景</span>
              <el-select v-model="period.scene" placeholder="请选择" class="scene-select">
                <el-option label="室内" value="indoor" />
                <el-option label="室外" value="outdoor" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </el-form>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { getImageParameterSwitch, saveImageParameterSwitch } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import checkedImg from '@/assets/img/camera/checked.png'
import uncheckImg from '@/assets/img/camera/uncheck.png'

const store: any = useUserStore()

// 场景转换函数：API -> UI
const sceneApiToUi = (v: any) => {
  const s = String(v || '')
  if (s.includes('室外')) return 'outdoor'
  return 'indoor'
}

// 场景转换函数：UI -> API
const sceneUiToApi = (v: any) => {
  return v === 'outdoor' ? '室外' : '室内'
}

const form = reactive({
  linkPreset: false,
  presetPoint: '1',
  timePeriods: [
    {
      enabled: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      scene: 'indoor'
    },
    {
      enabled: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      scene: 'indoor'
    },
    {
      enabled: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      scene: 'indoor'
    },
    {
      enabled: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      scene: 'indoor'
    }
  ],
  switchMode: false,
  timedPeriods: [
    {
      enabled: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      scene: 'indoor'
    },
    {
      enabled: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      scene: 'indoor'
    },
    {
      enabled: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      scene: 'indoor'
    },
    {
      enabled: false,
      startTime: '00:00:00',
      endTime: '00:00:00',
      scene: 'indoor'
    }
  ]
})

// 获取图像参数切换设置
const fetchImageParameterSwitch = async() => {
  const params: any = {}
  if (store.userInfo?.accessToken) params.accessToken = store.userInfo.accessToken

  const res: any = await getImageParameterSwitch(params)
  if (res?.code === 200 && res?.data) {
    const d = res.data
    form.linkPreset = Boolean(d.preset_point_enabled ?? form.linkPreset)
    form.presetPoint = String(d.preset_point ?? form.presetPoint)

    // 处理预置点时间段
    for (let i = 0; i < 4; i++) {
      const index = i + 1
      if (form.timePeriods[i]) {
        form.timePeriods[i].enabled = Boolean(d[`preset_time_period${index}_enabled`] ?? form.timePeriods[i].enabled)
        form.timePeriods[i].startTime = d[`preset_time_period${index}_start`] ?? form.timePeriods[i].startTime
        form.timePeriods[i].endTime = d[`preset_time_period${index}_end`] ?? form.timePeriods[i].endTime
        form.timePeriods[i].scene = sceneApiToUi(d[`preset_time_period${index}_scene`])
      }
    }

    form.switchMode = Boolean(d.timed_switch_enabled ?? form.switchMode)

    // 处理定时切换时间段
    for (let i = 0; i < 4; i++) {
      const index = i + 1
      if (form.timedPeriods[i]) {
        form.timedPeriods[i].enabled = Boolean(d[`timed_time_period${index}_enabled`] ?? form.timedPeriods[i].enabled)
        form.timedPeriods[i].startTime = d[`timed_time_period${index}_start`] ?? form.timedPeriods[i].startTime
        form.timedPeriods[i].endTime = d[`timed_time_period${index}_end`] ?? form.timedPeriods[i].endTime
        form.timedPeriods[i].scene = sceneApiToUi(d[`timed_time_period${index}_scene`])
      }
    }
  }
}

// 保存图像参数切换设置
const handleSave = async() => {
  const params: any = {
    preset_point_enabled: form.linkPreset,
    preset_point: Number(form.presetPoint) || 1
  }

  // 预置点时间段
  for (let i = 0; i < 4; i++) {
    const index = i + 1
    const period = form.timePeriods[i]
    if (period) {
      params[`preset_time_period${index}_enabled`] = period.enabled
      params[`preset_time_period${index}_start`] = period.startTime || '00:00:00'
      params[`preset_time_period${index}_end`] = period.endTime || '00:00:00'
      params[`preset_time_period${index}_scene`] = sceneUiToApi(period.scene)
    }
  }

  params.timed_switch_enabled = form.switchMode

  // 定时切换时间段
  for (let i = 0; i < 4; i++) {
    const index = i + 1
    const period = form.timedPeriods[i]
    if (period) {
      params[`timed_time_period${index}_enabled`] = period.enabled
      params[`timed_time_period${index}_start`] = period.startTime || '00:00:00'
      params[`timed_time_period${index}_end`] = period.endTime || '00:00:00'
      params[`timed_time_period${index}_scene`] = sceneUiToApi(period.scene)
    }
  }

  if (store.userInfo?.accessToken) params.accessToken = store.userInfo.accessToken

  const res: any = await saveImageParameterSwitch(params)
  if (res?.code === 200) {
    ElMessage.success('保存成功')
    await fetchImageParameterSwitch()
  }
}

onMounted(() => {
  fetchImageParameterSwitch()
})
</script>

<style lang="scss" scoped>
.imageParamSwitch {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    width: 1400px;
    .el-input {
      height: 40px;
    }
  }
}

.section-container {
  margin-bottom: 24px;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;

  .checkbox-img {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .checkbox-label {
    font-size: 14px;
    color: #000000;
  }
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.time-period-row{
  :deep(.el-input,.el-input__wrapper) {
    height: 40px !important;
  }
}

.time-period-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .period-checkbox {
    flex-shrink: 0;
  }

  .period-label {
    font-size: 14px;
    color: #333;
    width: 70px;
    flex-shrink: 0;
  }

  .time-range-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    flex: 2;

    .time-picker {
      flex: 1 !important;
      width: 0 !important;

      :deep(.el-input__wrapper) {
        height: 40px !important;
      }
    }

    .time-separator {
      font-size: 14px;
      color: #333;
      flex-shrink: 0;
    }
  }

  :deep(.time-picker.el-date-editor.el-input)
  {
    width: 100% !important;
  }

  .scene-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;

    .scene-label {
      font-size: 14px;
      color: #333;
      width: 70px;
      flex-shrink: 0;
      margin-left: 40px;
    }

    .scene-select {
      flex: 1;

      :deep(.el-input__wrapper) {
        height: 40px !important;
      }
    }
  }
}

.submitBox {
  padding: 40px 0;
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
