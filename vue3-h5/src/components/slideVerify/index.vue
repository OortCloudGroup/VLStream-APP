<!--
  滑块拼图验证（移动端）。交互与 T-OORT.SH/login-page 的 CustomSlideVerify 一致：
  拖动结束时 emit('position', x)，由父组件带 slide_id + xpos 发给后端校验，
  再调用 setVerifyResult('success' | 'fail')；失败后自动请求新图。

  注意：后端按图片坐标系（默认 300×150、滑块 40）校验 xpos，所以所有参与定位的尺寸
  都写在内联 style 里。项目的 postcss-px-to-viewport 会把 <style> 里的 px 转成 vw，
  而 vite.config.ts 中的白名单配置名拼成了 selectorBlaskList，`.ignore-` 前缀并不生效。
  内联 style 不经过 PostCSS，能保证与后端坐标一一对应。
-->
<template>
  <div class="slide_verify" :style="{ width: width + 'px' }">
    <div
      class="slide_canvas"
      :style="{ width: width + 'px', height: height + 'px' }"
    >
      <img
        v-if="bgImage"
        :src="bgImage"
        class="slide_bg"
        alt=""
        draggable="false"
      />
      <div v-else class="slide_loading">
        <van-loading size="24" />
      </div>
      <div
        v-if="sliderImage"
        class="slide_piece"
        :class="{ dragging: isDragging }"
        :style="{
          left: position + 'px',
          top: sliderY + 'px',
          width: sliderWidth + 'px',
          height: sliderWidth + 'px',
          backgroundImage: `url('${sliderImage}')`
        }"
        @touchstart="startDrag"
        @mousedown="startDrag"
      />
      <div class="slide_refresh" @click.stop="refresh">
        <van-icon name="replay" />
      </div>
    </div>

    <div
      class="slide_track"
      :class="'is_' + (result || 'idle')"
      :style="{ width: width + 'px', height: trackHeight + 'px' }"
      @touchstart="startDrag"
      @mousedown="startDrag"
    >
      <div class="slide_progress" :style="{ width: position + sliderWidth + 'px' }" />
      <div
        class="slide_handle"
        :style="{ left: position + 'px', width: sliderWidth + 'px', height: trackHeight + 'px' }"
      >
        <van-loading v-if="result === 'pending'" size="16" />
        <van-icon v-else-if="result === 'success'" name="success" />
        <van-icon v-else-if="result === 'fail'" name="cross" />
        <van-icon v-else name="arrow" />
      </div>
      <span v-if="!isDragging && !result" class="slide_text">{{ text || $t('向右滑动完成拼图') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  width: { type: Number, default: 300 },
  height: { type: Number, default: 150 },
  trackHeight: { type: Number, default: 40 },
  sliderWidth: { type: Number, default: 40 },
  sliderY: { type: Number, default: 0 },
  bgImage: { type: String, default: '' },
  sliderImage: { type: String, default: '' },
  slideId: { type: String, default: '' },
  text: { type: String, default: '' }
})

const emit = defineEmits(['position', 'requestNewCaptcha'])

const position = ref(0)
const isDragging = ref(false)
// '' | 'pending' | 'success' | 'fail'
const result = ref('')
let startX = 0
let startPos = 0
let failTimer = null

const reset = () => {
  position.value = 0
  result.value = ''
  isDragging.value = false
}

watch(() => [props.slideId, props.bgImage], reset)

const clientXOf = e => (e.touches && e.touches.length ? e.touches[0].clientX : e.clientX)

const onMove = (e) => {
  if (!isDragging.value) return
  if (e.cancelable) e.preventDefault()
  const max = props.width - props.sliderWidth
  position.value = Math.max(0, Math.min(startPos + clientXOf(e) - startX, max))
}

const removeListeners = () => {
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onEnd)
  window.removeEventListener('touchcancel', onEnd)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onEnd)
}

function onEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  removeListeners()
  // 原地松手不算一次尝试，避免误触消耗验证码
  if (position.value < 2) {
    position.value = 0
    return
  }
  result.value = 'pending'
  emit('position', Math.round(position.value))
}

const startDrag = (e) => {
  // 校验中或已通过时不可再拖；图片未就绪时也不可拖
  if (result.value === 'pending' || result.value === 'success' || !props.bgImage) return
  if (e.cancelable) e.preventDefault()
  result.value = ''
  isDragging.value = true
  startX = clientXOf(e)
  startPos = position.value
  window.addEventListener('touchmove', onMove, { passive: false })
  window.addEventListener('touchend', onEnd)
  window.addEventListener('touchcancel', onEnd)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onEnd)
}

const refresh = () => {
  reset()
  emit('requestNewCaptcha')
}

/** 父组件回传校验结果；失败短暂提示后换一张图 */
const setVerifyResult = (value) => {
  result.value = value
  if (value === 'fail') {
    clearTimeout(failTimer)
    failTimer = setTimeout(refresh, 400)
  }
}

onBeforeUnmount(() => {
  removeListeners()
  clearTimeout(failTimer)
})

defineExpose({ setVerifyResult, reset, refresh })
</script>

<style lang="scss" scoped>
/* 这里只放不影响坐标的视觉样式，几何尺寸全部走内联 style */
.slide_verify {
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.slide_canvas {
  position: relative;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  background: var(--vl-surface);
}

.slide_bg {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.slide_loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide_piece {
  position: absolute;
  z-index: 2;
  background-size: cover;
  background-position: center;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.35);

  &.dragging {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  }
}

.slide_refresh {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide_track {
  position: relative;
  overflow: hidden;
  border-radius: 0 0 8px 8px;
  background: var(--vl-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide_progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--vl-surface-2);
}

.slide_handle {
  position: absolute;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--vl-primary);
  color: #fff;
  font-size: 16px;
  border-radius: 8px;
}

.is_success .slide_handle {
  background: #34c759;
}

.is_fail .slide_handle {
  background: #ff3b30;
}

.slide_text {
  position: relative;
  z-index: 1;
  padding-left: 40px;
  font-size: 13px;
  color: var(--vl-text-2);
}
</style>
