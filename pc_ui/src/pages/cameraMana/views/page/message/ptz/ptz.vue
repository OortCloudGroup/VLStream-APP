<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="mac1" />
      <el-tab-pane label="限位" name="mac2" />
      <el-tab-pane label="零方位角" name="mac3" />
      <el-tab-pane label="守望" name="mac4" />
      <el-tab-pane label="隐私遮蔽" name="mac5" />
      <!--定时任务-->
      <el-tab-pane label="定时任务" name="mac6" />
      <el-tab-pane label="清除配置" name="mac7" />
      <el-tab-pane label="云台优先" name="mac8" />
    </el-tabs>
    <div>
      <BasicInfo v-if="activeName === 'mac1'" />
      <Limit v-if="activeName === 'mac2'" />
      <ZeroAzimuth v-if="activeName === 'mac3'" />
      <Watch v-if="activeName === 'mac4'" />
      <PrivacyMask v-if="activeName === 'mac5'" />
      <ScheduledTask v-if="activeName === 'mac6'" />
      <ClearConfig v-if="activeName === 'mac7'" />
      <PtzPriority v-if="activeName === 'mac8'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import BasicInfo from '@/pages/cameraMana/views/page/message/ptz/ptzTab/BasicInfo.vue'
import Limit from '@/pages/cameraMana/views/page/message/ptz/ptzTab/Limit.vue'
import ZeroAzimuth from '@/pages/cameraMana/views/page/message/ptz/ptzTab/ZeroAzimuth.vue'
import Watch from '@/pages/cameraMana/views/page/message/ptz/ptzTab/Watch.vue'
import PrivacyMask from '@/pages/cameraMana/views/page/message/ptz/ptzTab/PrivacyMask.vue'
import ScheduledTask from '@/pages/cameraMana/views/page/message/ptz/ptzTab/ScheduledTask.vue'
import ClearConfig from '@/pages/cameraMana/views/page/message/ptz/ptzTab/ClearConfig.vue'
import PtzPriority from '@/pages/cameraMana/views/page/message/ptz/ptzTab/PtzPriority.vue'

const activeName = ref('mac1')

// tabsClick
const handleClick = (_tab: TabsPaneContext, _event: Event) => {
  // Handle tab click
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
