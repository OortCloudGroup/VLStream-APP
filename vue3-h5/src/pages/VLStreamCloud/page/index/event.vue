<template>
  <div class="event-page">
    <!-- 顶部背景 -->
    <div class="top-bg" :style="{ backgroundImage: `url(${bgImg})` }" />

    <div class="event-header">
      <div class="top-title">
        {{ $t('事件') }}
      </div>
      <van-icon
        class="header-search"
        name="search"
        size="22"
        color="#333333"
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
import bgImg from '@/assets/img/VLStreamCloud/bg.png'
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
  background: #F9FAFF;
  position: relative;
  padding: 0 16px 24px;
}

.top-bg {
  position: absolute;
  top: -15px;
  left: -20px;
  right: -20px;
  height: 200px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 0;
}

.event-header {
  position: relative;
  z-index: 1;
  padding-top: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
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
