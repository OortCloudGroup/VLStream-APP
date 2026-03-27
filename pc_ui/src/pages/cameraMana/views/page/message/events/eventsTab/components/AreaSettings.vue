<template>
  <div class="areaSettings">
    <!-- 配置方式（下拉框表单） -->
    <el-form class="configForm" label-position="top" :model="form">
      <el-form-item label="配置方式">
        <el-select v-model="form.configMode" placeholder="请选择" class="config-select">
          <el-option label="普通模式" value="normal" />
          <el-option label="专家模式" value="expert" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 视频预览、PTZ控制和预置点 -->
    <div class="display_top">
      <RoiTop v-model:roi-points="roiPoints" />
    </div>

    <!-- 灵敏度 -->
    <div class="sensitivity-section">
      <div class="sensitivity-label">
        灵敏度
      </div>
      <div class="slider-container">
        <div class="slider-row">
          <el-slider v-model="form.sensitivity" :min="0" :max="100" class="slider" />
          <span class="slider-value">{{ form.sensitivity }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import RoiTop from '@/pages/cameraMana/views/page/message/components/RoiTop.vue'

interface DetectionAreas {
  configuration_mode: string
  sensitivity: number
  point: number[][]
}

const props = defineProps<{
  detectionAreas?: DetectionAreas
}>()

const emit = defineEmits<{
  'update:detection-areas': [value: DetectionAreas]
}>()

// 映射配置方式：API格式 -> UI格式
const configModeMap: Record<string, string> = {
  '普通模式': 'normal',
  '专家模式': 'expert'
}

// 映射配置方式：UI格式 -> API格式
const configModeMapReverse: Record<string, string> = {
  'normal': '普通模式',
  'expert': '专家模式'
}

const form = reactive({
  configMode: 'normal',
  sensitivity: 50
})

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

// 监听 props 变化，更新 form
watch(
  () => props.detectionAreas,
  (val) => {
    if (val) {
      form.configMode = configModeMap[val.configuration_mode] || 'normal'
      form.sensitivity = val.sensitivity || 50
      // 设置 ROI 点位
      if (val.point && val.point.length > 0) {
        roiPoints.value = val.point
      } else if (!val.point || val.point.length === 0) {
        roiPoints.value = null
      }
    }
  },
  { immediate: true, deep: true }
)

// 监听 form 和 roiPoints 变化，同步到父组件
watch(
  () => [form.configMode, form.sensitivity, roiPoints.value],
  () => {
    if (props.detectionAreas) {
      const updated: DetectionAreas = {
        configuration_mode: configModeMapReverse[form.configMode] || '普通模式',
        sensitivity: form.sensitivity,
        point: roiPoints.value || []
      }
      emit('update:detection-areas', updated)
    }
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.areaSettings {
  width: 100%;
}

// 配置方式（下拉框表单）
.configForm {
  width: 480px;
  margin-bottom: 10px;

  :deep(.el-input, .el-input__wrapper, .el-select__wrapper, .el-select) {
    height: 40px !important;
  }

  :deep(.el-form-item__label) {
    font-size: 14px;
    color: #666666;
  }

  .config-select {
    width: 100%;
    max-width: 600px;
  }
}

// 上方区域（RoiTop 容器）
.display_top {
  margin: 10px 0 20px;
}

// 灵敏度
.sensitivity-section {
  padding: 20px 0 10px;
  width: 260px;

  .sensitivity-label {
    font-size: 14px;
    color: #333;
    margin-bottom: 10px;
  }

  .slider-container {
    width: 100%;

    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .slider {
        flex: 1;
      }

      .slider-value {
        font-size: 14px;
        color: #333333;
        min-width: 24px;
        text-align: right;
      }
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
  }
}
</style>

