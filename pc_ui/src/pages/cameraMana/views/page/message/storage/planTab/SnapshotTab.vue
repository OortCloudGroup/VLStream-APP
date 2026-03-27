<template>
  <div class="systemBasic">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="抓图计划" name="p1" />
      <el-tab-pane label="抓图参数" name="p2" />
    </el-tabs>

    <snapshot-plan-tab v-if="activeName === 'p1'" />
    <snapshot-params-tab v-else-if="activeName === 'p2'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import SnapshotPlanTab from '@/pages/cameraMana/views/page/message/storage/planTab/SnapshotPlanTab.vue'
import SnapshotParamsTab from '@/pages/cameraMana/views/page/message/storage/planTab/SnapshotParamsTab.vue'

const activeName = ref('p1')

// tabsClick
const handleClick = (tab: TabsPaneContext, event: Event) => {
  void tab
  void event
}
</script>

<style lang="scss" scoped>
.systemBasic {
  padding-left: 20px;
  width: 880px;
  :deep(.el-tabs__header){
    padding-top: 0 !important;
  }
}

// tabs
:deep(.tenanat-tabs) {
  padding: 0 20px;

  .el-tabs__item {
    color: #999999;
  }

  .el-tabs__item.is-active {
    color: var(--el-color-primary);
  }
}

// tabs
:deep(.el-tabs__header) {
  padding-top: 10px;

  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-tabs__item.is-top {
    font-size: 16px;
    font-weight: 700;
  }
}
</style>

