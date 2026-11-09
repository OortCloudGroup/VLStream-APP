/**
Created by 兰舰 on 2019/12/3  17:58
*/
<template>
  <div class="page_container">
    <router-view v-slot="{ Component }">
      <transition name="vl-page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <Tabbar />
  </div>
</template>

<script setup>
import Tabbar from './components/Tabbar.vue'

import { getSafeAreaTop } from '@/utils/safeArea'

// 沉浸式状态栏高度写入 --vl-safe-top，供各 tab 页顶部留白
document.documentElement.style.setProperty('--vl-safe-top', getSafeAreaTop() + 'px')
</script>

<style lang="scss" scoped>
.page_container {
  height: 100vh;
  overflow: hidden;
  background: var(--vl-bg);
  position: relative;
}
</style>

