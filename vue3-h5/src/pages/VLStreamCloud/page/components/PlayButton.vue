<!--
 * @Description: 统一播放按钮：在线为主题色，离线为灰色；circle 用于卡片右上角，pill 带文字
 * @Copyright aPaaS-front-team. All rights reserved.
-->
<template>
  <div class="vl-play" :class="[`vl-play--${shape}`, online ? 'is-online' : 'is-offline']">
    <LineIcon name="play" :size="shape === 'pill' ? 12 : 16" :stroke="2.4" />
    <span v-if="shape === 'pill'">{{ $t('播放') }}</span>
  </div>
</template>

<script setup>
import LineIcon from './LineIcon.vue'

defineProps({
  online: { type: Boolean, default: false },
  shape: { type: String, default: 'circle' } // circle | pill
})
</script>

<style lang="scss" scoped>
.vl-play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
  background: var(--vl-primary);
  transition: transform 0.15s ease, background-color 0.15s ease;

  // 实心三角
  :deep(.line-icon path) {
    fill: currentColor;
  }

  &.is-online:active {
    background: var(--vl-primary-press);
    transform: scale(0.94);
  }

  &.is-offline {
    color: var(--vl-text-3);
    background: var(--vl-surface-2);
  }
}

.vl-play--circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;

  :deep(.line-icon) {
    margin-left: 2px; // 三角形视觉居中
  }
}

.vl-play--pill {
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}
</style>
