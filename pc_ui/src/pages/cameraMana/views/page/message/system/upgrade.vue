<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs">
      <el-tab-pane label="升级维护" name="up1" />
      <el-tab-pane label="日志" name="up2" />
      <el-tab-pane label="系统服务" name="up3" />
      <el-tab-pane label="审计安全日志" name="up4" />
    </el-tabs>
    <div class="systemBasic">
      <UpgradeMaintenance v-if="activeName==='up1'" />
      <Log v-if="activeName==='up2'" />
      <SystemService v-if="activeName==='up3'" />
      <AuditSecurityLog v-if="activeName==='up4'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import UpgradeMaintenance from './upgradeTab/UpgradeMaintenance.vue'
import Log from './upgradeTab/Log.vue'
import SystemService from './upgradeTab/SystemService.vue'
import AuditSecurityLog from './upgradeTab/AuditSecurityLog.vue'

const activeName = ref('up1')

</script>
<style lang="scss" scoped>
.macp_page {
  height: calc(100% - 20px);
  width: 100%;
  overflow: auto;
  border-radius: 6px 6px 0px 0px;
  background: #fff;
  margin-top: 20px;
}

// tabs
:deep(.tenanat-tabs) {
  padding: 0 20px;

  .el-tabs__item {
    color: #999;
  }

  .el-tabs__item.is-active {
    color: var(--el-color-primary);
  }
}

// tabs
:deep(.el-tabs__header) {
  padding-top: 10px;

  .el-tabs__nav-wrap::after {
    background: #E7EAEF;
  }

  .el-tabs__item.is-top {
    font-size: 16px;
    font-weight: 700;
  }
}

.systemBasic {
  padding:0 20px;
}
</style>
