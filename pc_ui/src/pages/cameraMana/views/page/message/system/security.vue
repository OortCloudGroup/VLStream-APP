<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="认证方式" name="s1" />
      <el-tab-pane label="IP地址过滤" name="s2" />
      <el-tab-pane label="安全服务" name="s3" />
      <el-tab-pane label="高级安全" name="s4" />
    </el-tabs>
    <div class="systemBasic">
      <AuthMethod v-if="activeName==='s1'" />
      <IpFilter v-if="activeName==='s2'" />
      <SecurityService v-if="activeName==='s3'" />
      <AdvancedSecurity v-if="activeName==='s4'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import AuthMethod from './securityTab/AuthMethod.vue'
import IpFilter from './securityTab/IpFilter.vue'
import SecurityService from './securityTab/SecurityService.vue'
import AdvancedSecurity from './securityTab/AdvancedSecurity.vue'

const activeName = ref('s1')

// tabsClick
const handleClick = (tab: TabsPaneContext, event: Event) => {
  void tab
  void event
}

</script>
<style lang="scss" scoped>
.mer_content :deep(.header_cell) {
  color: #333;
  background-color: #FAFAFA;
}

.macp_page {
  height: calc(100% - 20px);
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
  padding-left: 20px;
  width: 600px;

  :deep(.sbForm) {
    .el-input {
      height: 40px;
    }
  }
}

:deep(.asterisk-left .el-form-item__label){
  min-width: 150px;
}
:deep(.asterisk-left .el-form-item__label){
  padding-right: 40px !important;
}
</style>
