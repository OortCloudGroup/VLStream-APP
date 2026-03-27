<template>
  <div class="areaSettings">
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
  sensitivity: number
  point: number[][]
}

const props = defineProps<{
  detectionAreas?: DetectionAreas
}>()

const emit = defineEmits<{
  'update:detection-areas': [value: DetectionAreas]
}>()

const form = reactive({
  sensitivity: 50
})

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

// 监听 props 变化，更新 form
watch(
  () => props.detectionAreas,
  (val) => {
    if (val) {
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
  () => [form.sensitivity, roiPoints.value],
  () => {
    if (props.detectionAreas) {
      const updated: DetectionAreas = {
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

