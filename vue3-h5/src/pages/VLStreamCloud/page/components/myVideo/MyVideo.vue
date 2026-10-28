<!--
* @Created by: Qoder
* @Date: 2026-10-27
* @Copyright aPaaS-front-team. All rights reserved.
-->
<template>
  <div class="my-video-page">
    <CameraList :keyword="keyword" />
  </div>
</template>

<script setup>
import CameraList from '@/pages/VLStreamCloud/page/components/cameraDetail/CameraList.vue'

defineProps({
  keyword: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.my-video-page {
  width: 100%;
  height: 100%;
}
</style>
