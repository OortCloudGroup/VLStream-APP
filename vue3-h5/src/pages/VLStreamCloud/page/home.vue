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

// 沉浸式状态栏：原生壳注入 window.__safeAreaTop（CSS px），写入 --vl-safe-top，
// 供各 tab 页顶部留出状态栏高度；浏览器 / PC 调试为 0
const isShell = window.global && window.global.is_native_shell
const safeTop = isShell ? (Number(window.__safeAreaTop) || 0) : 0
document.documentElement.style.setProperty('--vl-safe-top', safeTop + 'px')
</script>

<style lang="scss" scoped>
.page_container {
  height: 100vh;
  overflow: hidden;
  background: var(--vl-bg);
  position: relative;
}
</style>

