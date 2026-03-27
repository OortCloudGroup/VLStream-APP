<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="TCP/IP" name="mac1" />
      <el-tab-pane label="DDNS" name="mac2" />
      <el-tab-pane label="PPPoE" name="mac3" />
      <el-tab-pane label="端口" name="mac4" />
      <el-tab-pane label="端口映射" name="mac5" />
      <el-tab-pane label="多播配置" name="mac6" />
    </el-tabs>
    <div>
      <TCPIP v-if="activeName === 'mac1'" />
      <DDNS v-if="activeName === 'mac2'" />
      <PPPoE v-if="activeName === 'mac3'" />
      <Port v-if="activeName === 'mac4'" />
      <PortMapping v-if="activeName === 'mac5'" />
      <Multicast v-if="activeName === 'mac6'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import TCPIP from '@/pages/cameraMana/views/page/message/network/basicTab/TCPIP.vue'
import DDNS from '@/pages/cameraMana/views/page/message/network/basicTab/DDNS.vue'
import PPPoE from '@/pages/cameraMana/views/page/message/network/basicTab/PPPoE.vue'
import Port from '@/pages/cameraMana/views/page/message/network/basicTab/Port.vue'
import PortMapping from '@/pages/cameraMana/views/page/message/network/basicTab/PortMapping.vue'
import Multicast from '@/pages/cameraMana/views/page/message/network/basicTab/Multicast.vue'

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
