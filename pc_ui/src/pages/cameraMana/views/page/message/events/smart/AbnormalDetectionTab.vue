<template>
  <div class="abnormalTab">
    <div class="panelTitle">
      异常侦测
    </div>

    <div class="formArea">
      <el-checkbox v-model="audioInputAbnormal">
        音频输入异常
      </el-checkbox>

      <div class="subBlock">
        <el-checkbox v-model="volumeRise">
          声强陡升
        </el-checkbox>
        <div class="sliderRow">
          <div class="sliderLabel">
            灵敏度
          </div>
          <div class="slider-container">
            <el-slider v-model="riseSensitivity" :min="0" :max="100" class="slider" />
            <div class="sliderValue">
              {{ riseSensitivity }}
            </div>
          </div>
        </div>
        <div class="sliderRow">
          <div class="sliderLabel">
            声音强度阈值
          </div>
          <div class="slider-container">
            <el-slider v-model="riseThreshold" :min="0" :max="100" class="slider" />
            <div class="sliderValue">
              {{ riseThreshold }}
            </div>
          </div>
        </div>
      </div>

      <div class="subBlock">
        <el-checkbox v-model="volumeDrop">
          声强陡降
        </el-checkbox>
        <div class="sliderRow">
          <div class="sliderLabel">
            灵敏度
          </div>
          <div class="slider-container">
            <el-slider v-model="dropSensitivity" :min="0" :max="100" class="slider" />
            <div class="sliderValue">
              {{ dropSensitivity }}
            </div>
          </div>
        </div>
      </div>

      <div class="panelTitle chartTitle">
        实时音量
      </div>
      <div class="chartBox">
        <img src="@/assets/img/camera/yl.png" class="chartLine" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface AnomalyDetection {
  abnormal_audio_input: boolean
  sound_intensity_rises_steeply: boolean
  sensitivity1: number
  sound_intensity_threshold: number
  sound_intensity_drops_sharply: boolean
  sensitivity2: number
}

const props = defineProps<{
  anomalyDetection?: AnomalyDetection
}>()

const emit = defineEmits<{
  'update:anomaly-detection': [value: AnomalyDetection]
}>()

const defaultAnomalyDetection: AnomalyDetection = {
  abnormal_audio_input: true,
  sound_intensity_rises_steeply: true,
  sensitivity1: 50,
  sound_intensity_threshold: 40,
  sound_intensity_drops_sharply: true,
  sensitivity2: 45
}

const form = computed({
  get: () => props.anomalyDetection || defaultAnomalyDetection,
  set: (val) => {
    emit('update:anomaly-detection', val)
  }
})

// 映射字段到表单
const audioInputAbnormal = computed({
  get: () => form.value.abnormal_audio_input,
  set: (val) => {
    emit('update:anomaly-detection', { ...form.value, abnormal_audio_input: val })
  }
})

const volumeRise = computed({
  get: () => form.value.sound_intensity_rises_steeply,
  set: (val) => {
    emit('update:anomaly-detection', { ...form.value, sound_intensity_rises_steeply: val })
  }
})

const riseSensitivity = computed({
  get: () => form.value.sensitivity1,
  set: (val) => {
    emit('update:anomaly-detection', { ...form.value, sensitivity1: val })
  }
})

const riseThreshold = computed({
  get: () => form.value.sound_intensity_threshold,
  set: (val) => {
    emit('update:anomaly-detection', { ...form.value, sound_intensity_threshold: val })
  }
})

const volumeDrop = computed({
  get: () => form.value.sound_intensity_drops_sharply,
  set: (val) => {
    emit('update:anomaly-detection', { ...form.value, sound_intensity_drops_sharply: val })
  }
})

const dropSensitivity = computed({
  get: () => form.value.sensitivity2,
  set: (val) => {
    emit('update:anomaly-detection', { ...form.value, sensitivity2: val })
  }
})
</script>

<style lang="scss" scoped>
.panelTitle {
  font-size: 16px;
  color: var(--el-color-primary);
  padding-bottom: 20px;
}

.chartTitle{
  margin-top: 20px;
}

.formArea {
  width: 580px;
}

.subBlock {
  margin-top: 14px;
}

.sliderRow {
  width: 262px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.sliderLabel {
  font-size: 14px;
  color: #333;
}

.slider {
  flex: 1;
}

.sliderValue {
  font-size: 14px;
  color: #333;
  min-width: 24px;
  text-align: right;
}

.chartBox {
  margin-top: 10px;
  width: 520px;
  height: 120px;
  border-radius: 8px;
  background: #F3F4F6;
  position: relative;
  overflow: hidden;
}

.chartLine {
  width: 580px;
  height: 100px;
}

:deep(.el-slider) {
  .el-slider__runway {
    height: 4px;
  }

  .el-slider__bar {
    height: 4px;
  }

  .el-slider__button {
    background-color: var(--el-color-primary);
    border-color: #FFFFFF;
  }
}

.slider-container{
  display: flex;
  align-items: center;
  gap: 6px;
}

.saveRow {
  margin-top: 22px;
}

.saveBtn {
  height: 48px;
  width: 170px;
  text-align: center;
  line-height: 48px;
  background: var(--el-color-primary);
  border-radius: 2px;
  font-size: 16px;
  color: #FFFFFF;
  letter-spacing: 0;
  cursor: pointer;
}
</style>
