<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="录像计划" name="mac1" />
      <el-tab-pane label="抓图" name="mac2" />
    </el-tabs>
    <div>
      <record-plan-tab v-if="activeName === 'mac1'" />
      <snapshot-tab v-else-if="activeName === 'mac2'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import RecordPlanTab from '@/pages/cameraMana/views/page/message/storage/planTab/RecordPlanTab.vue'
import SnapshotTab from '@/pages/cameraMana/views/page/message/storage/planTab/SnapshotTab.vue'

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
