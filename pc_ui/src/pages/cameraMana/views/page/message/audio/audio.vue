<template>
  <div class="macp_page">
    <el-tabs v-model="activeName" class="tenanat-tabs" @tab-click="handleClick">
      <el-tab-pane label="视频" name="mac1" />
      <el-tab-pane label="音频" name="mac2" />
      <el-tab-pane label="ROI" name="mac3" />
      <el-tab-pane label="码流信息叠加" name="mac4" />
    </el-tabs>
    <div>
      <Video v-if="activeName === 'mac1'" />
      <Audio v-if="activeName === 'mac2'" />
      <ROI v-if="activeName === 'mac3'" />
      <StreamInfoOverlay v-if="activeName === 'mac4'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { TabsPaneContext } from 'element-plus'
import Video from '@/pages/cameraMana/views/page/message/audio/audioTab/Video.vue'
import Audio from '@/pages/cameraMana/views/page/message/audio/audioTab/Audio.vue'
import ROI from '@/pages/cameraMana/views/page/message/audio/audioTab/ROI.vue'
import StreamInfoOverlay from '@/pages/cameraMana/views/page/message/audio/audioTab/StreamInfoOverlay.vue'

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
