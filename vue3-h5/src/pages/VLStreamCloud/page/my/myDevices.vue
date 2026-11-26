<!--
  我的 → 我的设备：只列出当前用户添加的设备（按 createUser 匹配 VLStream 本地用户），
  右下角 + 复用设备管理的新增设备表单。
-->
<template>
  <div class="page_container my_devices_page">
    <nav-header-banner :title="$t('我的设备')" />
    <div class="my_devices_body">
      <DeviceListMode mine-only />
    </div>
  </div>
</template>

<script setup>
import NavHeaderBanner from '@/components/navHeaderBanner/index'
import DeviceListMode from '@/pages/VLStreamCloud/page/components/deviceManagement/DeviceListMode.vue'
</script>

<style lang="scss" scoped>
.my_devices_page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vl-bg);
}

.my_devices_body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px calc(24px + env(safe-area-inset-bottom));

  // 独立页面没有底部 tab 栏，新增按钮贴近底部
  :deep(.fab) {
    bottom: calc(28px + env(safe-area-inset-bottom));
  }
}
</style>
