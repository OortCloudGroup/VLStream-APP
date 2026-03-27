<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="SNMP" name="mac1" />
      <el-tab-pane label="FTP" name="mac2" />
      <el-tab-pane label="Email" name="mac3" />
      <el-tab-pane label="平台接入" name="mac4" />
      <el-tab-pane label="HTTPS" name="mac5" />
      <el-tab-pane label="QoS" name="mac6" />
      <el-tab-pane label="802.1X" name="mac7" />
      <el-tab-pane label="集成协议" name="mac8" />
      <el-tab-pane label="网络服务" name="mac9" />
      <el-tab-pane label="HTTP监听" name="mac10" />
    </el-tabs>
    <div>
      <SNMP v-if="activeName === 'mac1'" />
      <FTP v-if="activeName === 'mac2'" />
      <Email v-if="activeName === 'mac3'" />
      <PlatformAccess v-if="activeName === 'mac4'" />
      <HTTPS v-if="activeName === 'mac5'" />
      <QoS v-if="activeName === 'mac6'" />
      <IEEE8021X v-if="activeName === 'mac7'" />
      <IntegrationProtocol v-if="activeName === 'mac8'" />
      <NetworkService v-if="activeName === 'mac9'" />
      <HTTPListen v-if="activeName === 'mac10'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import SNMP from '@/pages/cameraMana/views/page/message/network/advanceTab/SNMP.vue'
import FTP from '@/pages/cameraMana/views/page/message/network/advanceTab/FTP.vue'
import Email from '@/pages/cameraMana/views/page/message/network/advanceTab/Email.vue'
import PlatformAccess from '@/pages/cameraMana/views/page/message/network/advanceTab/PlatformAccess.vue'
import HTTPS from '@/pages/cameraMana/views/page/message/network/advanceTab/HTTPS.vue'
import QoS from '@/pages/cameraMana/views/page/message/network/advanceTab/QoS.vue'
import IEEE8021X from '@/pages/cameraMana/views/page/message/network/advanceTab/IEEE8021X.vue'
import IntegrationProtocol from '@/pages/cameraMana/views/page/message/network/advanceTab/IntegrationProtocol.vue'
import NetworkService from '@/pages/cameraMana/views/page/message/network/advanceTab/NetworkService.vue'
import HTTPListen from '@/pages/cameraMana/views/page/message/network/advanceTab/HTTPListen.vue'

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
