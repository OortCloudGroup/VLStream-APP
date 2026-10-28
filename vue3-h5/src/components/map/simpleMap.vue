<template>
  <div class="select-point-form-map">
    <LMap
      v-if="configLoaded && !mapUnavailable"
      ref="mapRef"
      :base-map-options="baseMapOptions"
      :zoom="zoom"
      :center="center"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      @mapClick="mapClick"
      @mapReady="mapReady"
    />
    <div v-if="mapUnavailable" class="map-unavailable">
      地图服务不可用，请检查平台底图服务配置
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import LMap from './leafletMap.vue'

const emits = defineEmits(['mapReady', 'mapClick'])

const mapReady = () => {
  emits('mapReady')
}

const mapClick = (e) => {
  emits('mapClick', e)
}

const props = defineProps({
  appId: {
    type: String,
    default: AppConfig.VLStreamCloud.appId
  }
})
// 使用地图配置store
import { useMapConfigStore } from '@/store/modules/mapConfig'
const mapConfigStore = useMapConfigStore()
// 从store中获取地图配置
const baseMapOptions = computed(() => mapConfigStore.baseMapOptions)
const center = computed(() => mapConfigStore.center)
const zoom = computed(() => mapConfigStore.zoom)
const minZoom = computed(() => mapConfigStore.minZoom)
const maxZoom = computed(() => mapConfigStore.maxZoom)

import AppConfig from '@/config/AppConfig'
import config from '@/config'
import { useUserStore } from '@/store/modules/useraPaas'
import { mlsBaseMapList } from '@/api/geoserver'
const store = useUserStore()
const mapRef = ref(null)
// 底图配置服务不可用（单租户集群没有 apaas-map-server）时给出占位，不渲染裂图
const mapUnavailable = ref(false)
// 底图配置就绪后才挂载地图，避免默认底图先请求再落空
const configLoaded = ref(false)

const initMapBaseConfig = async() => {
  // 单租户集群不路由 apaas-map-server，发请求只会得到一条 Network Error 提示，直接判定地图不可用
  if (config.authMode === 'local') {
    mapConfigStore.setBaseMapArray([])
    mapUnavailable.value = true
    return
  }
  let data = {
    accessToken: store.userInfo.accessToken,
    current: 1,
    size: 999,
    platformAppId: props.appId
  }
  let records = []
  try {
    const res = await mlsBaseMapList(data)
    records = res?.data?.records || []
  } catch (error) {
    records = []
  }
  if (!records.length) {
    mapConfigStore.setBaseMapArray([])
    mapUnavailable.value = true
    return
  }
  // 保存底图列表
  records.forEach(item => {
    item.type = item.dataType
  })
  mapConfigStore.setBaseMapArray(records)
  // 获取当前生效的底图
  const currentMap = records.find((item) => item.status === 2)
  if (!currentMap) {
    mapUnavailable.value = true
    return
  }
  let tempBaseMapOptions = []
  if (currentMap.dataType === 'WMS') {
    tempBaseMapOptions = [{
      name: currentMap.name || '',
      url: currentMap.internetUrl, // 移动端的地址
      type: 'WMS',
      layer: currentMap.layer
    }]
  }
  if (currentMap.dataType === 'TILE') {
    // 将配置保存到store中
    let internetUrl = currentMap.internetUrl?.split(',')
    tempBaseMapOptions = internetUrl?.map(tt => ({
      name: currentMap.name,
      url: tt,
      type: currentMap.dataType
    }))
  }
  if (!tempBaseMapOptions.filter(tt => !!tt.url).length) {
    mapConfigStore.setBaseMapArray([])
    mapUnavailable.value = true
    return
  }
  // 将配置保存到store中
  mapConfigStore.updateMapConfig({
    baseMapOptions: tempBaseMapOptions.filter(tt => !!tt.url),
    maxZoom: currentMap.maxLevel,
    minZoom: currentMap.minLevel,
    zoom: currentMap.initLevel,
    center: [currentMap.centerXPoint, currentMap.centerYPoint]
  })
}

onMounted(async() => {
  await initMapBaseConfig()
  configLoaded.value = true
})

</script>

  <style lang="scss" scoped>

  .select-point-form-map {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
  }

  .map-unavailable {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 24px;
      background: #f5f6f8;
      border-radius: 8px;
      color: rgba(51, 51, 51, 0.6);
      font-size: 14px;
      text-align: center;
  }

  .map-header {
      width: 100%;
      height: 32px;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
      span {
          font-size: 14px;
          font-weight: 600;
          color: #000;
      }
  }

  .map-container {
      width: 100%;
      flex:1;
  }

  .bottom_btn {
      width: 100%;
      height: 60px;
      background-color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
  }
  .bottom_btn span {
      width: 100%;
      height: 100%;
      background-color: #fff;
      position: fixed;
  }

  .complete-button {
    width: 80%;
    margin: 0 auto;
    height: 36px;
    background: #2F69F8;
    border: none;
    border-radius: 18px;
    color: #FFFFFF;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;

    &:active {
      background: #1A53FF;
    }
  }

  </style>
