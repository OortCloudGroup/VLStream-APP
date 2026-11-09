<template>
  <div class="event-page">
    <div class="event-header">
      <div class="top-title">
        {{ $t('事件') }}
      </div>
      <van-icon
        class="header-search"
        name="search"
        size="22"
        color="#1c1c1e"
        @click="toggleSearch"
      />
    </div>

    <div class="page-content">
      <event-Pat :event="currentModType" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import bus from '@/utils/bus'
import eventPat from '@/pages/VLStreamCloud/page/components/event/eventPat.vue'

// 事件类型 1:事件拍传 2:主动安全
const currentModType = ref(2)

// 事件列表页内搜索（eventPat 监听 toggleSearch 切换搜索框）
const toggleSearch = () => {
  bus.$emit('toggleSearch')
}
</script>

<style lang="scss" scoped>
.event-page {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  padding: 0 16px 24px;
}

.event-header {
  position: relative;
  z-index: 1;
  padding-top: calc(28px + var(--vl-safe-top, 0px));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-title {
  font-size: 28px;
  line-height: 36px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--vl-ink);
}

.page-content {
  height: 1200px;
  position: relative;
  z-index: 1;
  margin-top: 18px;
}
</style>
<style>
.flexRowAC{
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
