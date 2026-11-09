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
</script>

<style lang="scss" scoped>
.page_container {
  height: 100vh;
  overflow: hidden;
  background: var(--vl-bg);
  position: relative;
}
</style>

