<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="sys1" />
      <el-tab-pane label="时间配置" name="sys2" />
      <el-tab-pane label="夏令时" name="sys3" />
      <el-tab-pane label="RS-485" name="sys4" />
      <el-tab-pane label="关于设备" name="sys5" />
    </el-tabs>
    <div class="systemBasic">
      <BasicInfo v-if="activeName==='sys1'" />
      <TimeConfig v-if="activeName==='sys2'" />
      <DaylightSaving v-if="activeName==='sys3'" />
      <RS485 v-if="activeName==='sys4'" />
      <AboutDevice v-if="activeName==='sys5'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import BasicInfo from './systemBasic/BasicInfo.vue'
import TimeConfig from './systemBasic/TimeConfig.vue'
import DaylightSaving from './systemBasic/DaylightSaving.vue'
import RS485 from './systemBasic/RS485.vue'
import AboutDevice from './systemBasic/AboutDevice.vue'

const activeName = ref('sys1')

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
  padding-left: 20px;
  width: 600px;
}

:deep(.sbForm .el-form-item__label) {
  padding-right: 30px !important;
}

.asterisk-left {
  flex: 1;
}

</style>
