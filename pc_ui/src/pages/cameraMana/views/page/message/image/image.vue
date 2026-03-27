<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="显示设置" name="mac1" />
      <el-tab-pane label="OSD设置" name="mac2" />
      <el-tab-pane label="图像参数切换" name="mac3" />
    </el-tabs>
    <div>
      <DisplaySettings v-if="activeName === 'mac1'" />
      <OSDSettings v-if="activeName === 'mac2'" />
      <ImageParamSwitch v-if="activeName === 'mac3'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import DisplaySettings from '@/pages/cameraMana/views/page/message/image/imageTab/DisplaySettings.vue'
import OSDSettings from '@/pages/cameraMana/views/page/message/image/imageTab/OSDSettings.vue'
import ImageParamSwitch from '@/pages/cameraMana/views/page/message/image/imageTab/ImageParamSwitch.vue'

const activeName = ref('mac1')

// tabsClick
const handleClick = (_tab: TabsPaneContext, _event: Event) => {
  // Tab click handler
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
</style>
