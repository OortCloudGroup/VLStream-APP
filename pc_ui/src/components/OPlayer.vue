<template>
  <div class="oplayer_wrap">
    <div ref="player" class="player_item" />
    <!-- ROI 画框层：可选开启 -->
    <div
      v-if="roiEnabled || roiRect"
      ref="roiLayer"
      class="roi_draw_layer"
      :class="{ roi_disabled: !roiEnabled }"
      @mousedown="onDrawStart"
      @mousemove="onDrawMove"
      @mouseup="onDrawEnd"
      @mouseleave="onDrawEnd"
    >
      <div v-if="roiRect" class="roi_rect" :style="roiRectStyle" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import Config from '@/config'
import { ElMessage } from 'element-plus'

const player = ref(null)
const roiLayer = ref(null)
const props = defineProps({
  src: {
    type: String,
    required: true,
    default: ''
  },
  type: {
    type: String,
    default: 'flv',
    validator: (value) => {
      // 只允许指定的类型
      return ['flv', 'mp4', 'm3u8', 'rtc', 'webrtc', 'cameraRTC'].includes(value)
    }
  },
  autoSize: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ''
  },
  webRTCSocketURL: {
    type: String,
    default: ''
  },
  // ROI 画框：是否启用
  roiEnabled: {
    type: Boolean,
    default: false
  },
  // ROI 画框：归一化坐标 points: [[x1,y1],[x2,y2]]
  roiPoints: {
    type: Array,
    default: null
  }
})

const emit = defineEmits(['update:roiPoints', 'roi-complete', 'roi-clear'])

const isDragging = ref(false)
const dragStart = ref(null) // [x,y]

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const toFixed4 = (v) => Number(Number(v).toFixed(4))

const getNormalizedPointFromEvent = (e) => {
  const el = roiLayer.value
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (!rect.width || !rect.height) return null
  const x = clamp01((e.clientX - rect.left) / rect.width)
  const y = clamp01((e.clientY - rect.top) / rect.height)
  return [toFixed4(x), toFixed4(y)]
}

const roiRect = computed(() => {
  const pts = props.roiPoints
  if (!pts || !Array.isArray(pts) || pts.length !== 2) return null
  const p1 = pts[0]
  const p2 = pts[1]
  if (!Array.isArray(p1) || !Array.isArray(p2) || p1.length !== 2 || p2.length !== 2) return null
  const x1 = Number(p1[0])
  const y1 = Number(p1[1])
  const x2 = Number(p2[0])
  const y2 = Number(p2[1])
  if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return null
  const left = Math.min(x1, x2)
  const top = Math.min(y1, y2)
  const right = Math.max(x1, x2)
  const bottom = Math.max(y1, y2)
  if (right - left < 0.001 || bottom - top < 0.001) return null
  return { left, top, right, bottom }
})

const roiRectStyle = computed(() => {
  if (!roiRect.value) return {}
  const { left, top, right, bottom } = roiRect.value
  return {
    left: `${left * 100}%`,
    top: `${top * 100}%`,
    width: `${(right - left) * 100}%`,
    height: `${(bottom - top) * 100}%`
  }
})

const onDrawStart = (e) => {
  if (!props.roiEnabled) return
  const p = getNormalizedPointFromEvent(e)
  if (!p) return
  isDragging.value = true
  dragStart.value = p
  emit('update:roiPoints', [p, p])
}

const onDrawMove = (e) => {
  if (!props.roiEnabled || !isDragging.value) return
  const start = dragStart.value
  const cur = getNormalizedPointFromEvent(e)
  if (!start || !cur) return
  emit('update:roiPoints', [start, cur])
}

const onDrawEnd = (e) => {
  if (!props.roiEnabled || !isDragging.value) return
  isDragging.value = false
  const start = dragStart.value
  const end = getNormalizedPointFromEvent(e)
  if (start && end) {
    emit('update:roiPoints', [start, end])
    emit('roi-complete', [start, end])
    ElMessage.success('画框已完成')
  }
  dragStart.value = null
}

const clearRoi = () => {
  emit('update:roiPoints', null)
  emit('roi-clear')
}

// 关闭 ROI 时停止拖拽
watch(() => props.roiEnabled, (val) => {
  if (!val) {
    isDragging.value = false
    dragStart.value = null
  }
})

defineExpose({
  clearRoi
})

onMounted(() => {
  let tempSrc = props.src
  // 对是处理  如果不是http开头 就加上 当前访问window.location.origin ，
  if (!tempSrc.startsWith('http') && props.type !== 'cameraRTC') {
    tempSrc = (Config.URL.endsWith('/') ? Config.URL.slice(0, -1) : Config.URL) + tempSrc
  }
  if (player.value) {
    const OPlayer = new window.OToolBox.OPlayer(player.value, { autoSize: props.autoSize, showHeader: props.showHeader,
      webRTCSocketURL: props.webRTCSocketURL || Config.webRTCSocketURL })
    OPlayer.play({ src: tempSrc, type: props.type, name: props.name })
  }
})

</script>

<style lang="scss" scoped>
.oplayer_wrap {
  position: relative;
  width: 100%;
  height: 100%;
}

.player_item {
  width: 100%;
  height: 100%;
  :deep(.o-player-item_1.svelte-fuhrae){
    width: 100%;
  }
}

.roi_draw_layer {
  position: absolute;
  inset: 0;
  z-index: 9999;
  cursor: crosshair;
  user-select: none;
  pointer-events: all;
}

.roi_draw_layer.roi_disabled {
  pointer-events: none;
  border: none;
}

.roi_rect {
  position: absolute;
  border: 2px solid var(--el-color-primary);
  background: rgba(34, 120, 255, 0.12);
  box-sizing: border-box;
}
</style>
