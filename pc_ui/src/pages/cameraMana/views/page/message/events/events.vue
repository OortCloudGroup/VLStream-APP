<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="移动侦测" name="mac1" />
      <el-tab-pane label="遮挡报警" name="mac2" />
      <el-tab-pane label="报警输入" name="mac3" />
      <el-tab-pane label="报警输出" name="mac4" />
      <el-tab-pane label="异常" name="mac5" />
    </el-tabs>
    <div>
      <MotionDetection v-if="activeName === 'mac1'" />
      <OcclusionAlarm v-if="activeName === 'mac2'" />
      <AlarmInput v-if="activeName === 'mac3'" />
      <AlarmOutput v-if="activeName === 'mac4'" />
      <Exception v-if="activeName === 'mac5'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import MotionDetection from '@/pages/cameraMana/views/page/message/events/eventsTab/MotionDetection.vue'
import OcclusionAlarm from '@/pages/cameraMana/views/page/message/events/eventsTab/OcclusionAlarm.vue'
import AlarmInput from '@/pages/cameraMana/views/page/message/events/eventsTab/AlarmInput.vue'
import AlarmOutput from '@/pages/cameraMana/views/page/message/events/eventsTab/AlarmOutput.vue'
import Exception from '@/pages/cameraMana/views/page/message/events/eventsTab/Exception.vue'

const activeName = ref('mac1')

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

</style>
