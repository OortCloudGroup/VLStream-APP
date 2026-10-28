<template>
  <div class="video-page">
    <div class="top-bg" :style="{ backgroundImage: `url(${bgImg})` }" />

    <div class="video-header">
      <div class="top-bar">
        <div class="top-title">
          视频
        </div>
        <div class="top-actions">
          <img class="action-icon" :src="ssImg" alt="" @click="onSearch" />
          <img class="action-icon" :src="sxImg" alt="" @click="onFilter" />
        </div>
      </div>

      <van-search
        v-if="showSearch"
        v-model="keyword"
        class="header-search"
        shape="round"
        placeholder="搜索设备名称或设备ID"
      />

      <div class="tabs-row">
        <van-tabs
          v-model:active="activeTopTab"
          class="top-tabs"
          :swipe-threshold="3"
          line-width="0"
        >
          <van-tab
            v-for="tab in topTabs"
            :key="tab.value"
            :title="tab.label"
            :name="tab.value"
          />
        </van-tabs>
        <img class="tabs-menu-icon" :src="sx2Img" alt="" @click="onMenu" />
      </div>

      <template v-if="activeTopTab === 'govern'">
        <van-tabs
          v-model:active="activeSubTab"
          class="status-tabs"
          line-width="28"
        >
          <van-tab
            v-for="tab in subTabs"
            :key="tab.value"
            :title="tab.label"
            :name="tab.value"
          />
        </van-tabs>
      </template>

      <template v-else-if="activeTopTab === 'device'">
        <van-tabs
          v-model:active="activeDeviceMode"
          class="status-tabs"
          line-width="28"
        >
          <van-tab
            v-for="tab in modeTabs"
            :key="tab.value"
            :title="tab.label"
            :name="tab.value"
          />
        </van-tabs>
      </template>
    </div>

    <div class="video-content">
      <!-- 视频广场 -->
      <template v-if="activeTopTab === 'square'">
        <VideoSquare :keyword="keyword" />
      </template>

      <!-- 我的视频 -->
      <template v-else-if="activeTopTab === 'my'">
        <MyVideo :keyword="keyword" />
      </template>

      <!-- 视频回放 -->
      <template v-else-if="activeTopTab === 'playback'">
        <VideoPlaybackList :keyword="keyword" />
      </template>

      <!-- 算法仓库 -->
      <template v-else-if="activeTopTab === 'algo'">
        <AlgorithmRepo />
      </template>

      <!-- 智能分析 -->
      <template v-else-if="activeTopTab === 'analysis'">
        <SmartAnalysis />
      </template>

      <!-- 场景治理 -->
      <template v-else-if="activeTopTab === 'govern'">
        <NowGovern v-if="activeSubTab === 'now'" />
        <LoopGovern v-else />
      </template>

      <!-- 设备管理 -->
      <template v-else-if="activeTopTab === 'device'">
        <template v-if="activeDeviceMode !== 'map'">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            class="video-list"
            @load="onLoad"
          >
            <DeviceManage :active-mode="activeDeviceMode" :keyword="keyword" :tag-name="filterTagName || ''" />
          </van-list>
        </template>
        <template v-else>
          <DeviceManage style="width: 100%;height: 100%" :active-mode="activeDeviceMode" :keyword="keyword" :tag-name="filterTagName || ''" />
        </template>
      </template>

      <!-- 其它 tab 占位 -->
      <div v-else class="building">
        功能建设中
      </div>
    </div>

    <VideoFilterPanel v-model:show="showFilter" @confirm="onFilterConfirm" />

    <van-action-sheet
      v-model:show="showMenu"
      :actions="menuActions"
      title="切换模块"
      cancel-text="取消"
      close-on-click-action
      @select="onMenuSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { List as VanList } from 'vant'
import config from '@/config'
import ssImg from '@/assets/img/VLStreamCloud/ss.png'
import sxImg from '@/assets/img/VLStreamCloud/sx.png'
import sx2Img from '@/assets/img/VLStreamCloud/sx2.png'
import NowGovern from '@/pages/VLStreamCloud/page/components/scenarioManagement/NowGovern.vue'
import LoopGovern from '@/pages/VLStreamCloud/page/components/scenarioManagement/LoopGovern.vue'
import DeviceManage from '@/pages/VLStreamCloud/page/components/deviceManagement/DeviceManage.vue'
import VideoSquare from '@/pages/VLStreamCloud/page/components/videoPlaza/VideoSquare.vue'
import VideoPlaybackList from '@/pages/VLStreamCloud/page/components/videoPlayback/VideoPlaybackList.vue'
import AlgorithmRepo from '@/pages/VLStreamCloud/page/components/algorithmRepository/AlgorithmRepo.vue'
import SmartAnalysis from '@/pages/VLStreamCloud/page/components/intelligentAnalysis/SmartAnalysis.vue'
import VideoFilterPanel from '@/pages/VLStreamCloud/page/components/Filter/VideoFilterPanel.vue'
import MyVideo from '@/pages/VLStreamCloud/page/components/myVideo/MyVideo.vue'
import bgImg from '@/assets/img/VLStreamCloud/bg.png'

const route = useRoute()

const topTabs = ref([
  { label: '视频广场', value: 'square' },
  { label: '我的视频', value: 'my' },
  { label: '视频回放', value: 'playback' },
  { label: '算法仓库', value: 'algo' },
  { label: '智能分析', value: 'analysis' },
  { label: '场景治理', value: 'govern' },
  { label: '设备管理', value: 'device' }
])
const activeTopTab = ref(route.query.topTab || 'square')

const subTabs = ref([
  { label: '即时治理', value: 'now' },
  { label: '循环治理', value: 'loop' }
])
const activeSubTab = ref('now')

const modeTabsAll = [
  { label: '列表模式', value: 'list' },
  { label: '地图模式', value: 'map' },
  { label: '卡片模式', value: 'card' }
]
// 单租户集群没有底图服务（apaas-map-server），地图模式会是一片裂图，直接不提供入口
const modeTabs = ref(config.authMode === 'local' ? modeTabsAll.filter(tab => tab.value !== 'map') : modeTabsAll)
const activeDeviceMode = ref('list')

const loading = ref(false)
const finished = ref(false)
const showFilter = ref(false)
const filterTagName = ref(null)
const showSearch = ref(false)
const keyword = ref('')
const showMenu = ref(false)

const menuActions = topTabs.value.map(tab => ({ name: tab.label, value: tab.value }))

const onLoad = () => {
  // 这里可以根据业务追加数据，当前直接标记为加载完成
  loading.value = false
  finished.value = true
}

const onSearch = () => {
  showSearch.value = !showSearch.value
  if (!showSearch.value) keyword.value = ''
}

const onFilter = () => {
  showFilter.value = true
}

const onFilterConfirm = (filters) => {
  keyword.value = (filters.keyword || '').trim()
  filterTagName.value = filters.tagName || null
  // 关键字与标签都来自筛选面板，打开搜索框让用户能看到当前生效的条件
  showSearch.value = !!keyword.value
  showFilter.value = false
}

const onMenu = () => {
  showMenu.value = true
}

const onMenuSelect = (action) => {
  if (!action || !action.value) return
  activeTopTab.value = action.value
  showMenu.value = false
}

</script>

<style lang="scss" scoped>
.video-page {
  height: calc(100vh - 50px);
  position: relative;
  padding: 0 16px 24px;
  display: flex;
  flex-direction: column;
  background: #F9FAFF;
}

.top-bg {
  position: absolute;
  top: -15px;
  left: -20px;
  right: -20px;
  height: 200px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 0;
}

.top-bar {
  position: relative;
  z-index: 1;
  padding-top: 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.top-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.top-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.header-search {
  position: relative;
  z-index: 1;
  padding: 8px 0;
  background: transparent;
}

.header-search :deep(.van-search__content) {
  background: rgba(255, 255, 255, 0.85);
}

.action-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.video-header {
  flex-shrink: 0;
}

.video-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.tabs-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  margin-top: 12px;
}

.top-tabs {
  flex: 1;
  --van-tabs-nav-background: transparent;
}

.tabs-menu-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.top-tabs :deep(.van-tabs__wrap) {
  padding-right: 8px;
}

.top-tabs :deep(.van-tab) {
  padding: 0 10px 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(51, 51, 51, 0.55);
}

.top-tabs :deep(.van-tab--active) {
  color: #222;
  font-weight: 700;
  position: relative;
}

.top-tabs :deep(.van-tab--active::after) {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 2px;
  width: 18px;
  height: 6px;
  border-radius: 6px;
  background: #2f69f8;
}

.status-tabs {
  position: relative;
  z-index: 1;
  --van-tabs-nav-background: transparent;
}

.status-tabs :deep(.van-tab--active .van-tab__text) {
  color: #2f69f8;
}

.status-tabs :deep(.van-tabs__line) {
  background: #2f69f8;
}

.mode-tabs {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  padding: 12px 6px 0;
  margin-top: 6px;
  color: rgba(51, 51, 51, 0.45);
  font-size: 18px;
  font-weight: 600;
}

.mode-tab {
  position: relative;
  padding-bottom: 12px;
  flex: 1;
  text-align: center;

  &.active {
    color: #1a53ff;

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 2px;
      width: 46px;
      height: 4px;
      border-radius: 4px;
      background: #1a53ff;
    }
  }
}

.video-list {
  margin-top: 16px;
}

.building {
  position: relative;
  z-index: 1;
  margin-top: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 18px 16px;
  color: rgba(51, 51, 51, 0.6);
  font-size: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
}

</style>
