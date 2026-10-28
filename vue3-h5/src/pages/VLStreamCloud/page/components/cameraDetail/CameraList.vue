<!--
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
-->
<template>
  <div class="camera-list">
    <div v-if="loading" class="list-state">
      {{ $t('正在加载摄像头…') }}
    </div>
    <div v-else-if="loadError" class="list-state">
      <span>{{ loadError }}</span>
      <van-button size="mini" plain type="primary" @click="fetchCameras">
        {{ $t('重新加载') }}
      </van-button>
    </div>
    <div v-else-if="!devices.length" class="list-state">
      {{ $t('暂无摄像头') }}
    </div>

    <div v-for="item in devices" :key="item.id" class="device-card" @click="openDetail(item)">
      <div class="card-header">
        <div class="name">
          {{ item.deviceName }}
        </div>
      </div>

      <div class="info-row">
        <img src="@/assets/img/VLStreamCloud/spgc/sbId.png" alt="" />
        <div class="label">
          {{ $t('设备ID') }}
        </div>
        <div class="value">
          {{ item.deviceId }}
        </div>
      </div>
      <div class="info-row">
        <img src="@/assets/img/VLStreamCloud/spgc/sbwz.png" alt="" />
        <div class="label">
          {{ $t('设备位置') }}
        </div>
        <div class="value">
          {{ item.address }}
        </div>
      </div>

      <div class="card-footer">
        <div class="chips">
          <div class="chip" :class="{ offline: item.online !== true }">
            {{ item.online === true ? $t('在线') : $t('离线') }}
          </div>
          <div v-if="item.deviceType" class="chip">
            {{ item.deviceType }}
          </div>
        </div>
      </div>
      <div class="play-btn">
        <img v-if="item.online === true" src="@/assets/img/VLStreamCloud/spgc/playing.png" alt="" />
        <img v-else src="@/assets/img/VLStreamCloud/spgc/no_playing.png" alt="" />
      </div>
    </div>

    <oort-popup v-model="showDetail" position="right" style="width: 100%;height: 100%;" teleport="body">
      <CameraDetail
        v-if="showDetail && currentCamera"
        :camera="currentCamera"
        @close="showDetail = false"
      />
    </oort-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import OortPopup from '@/components/popup/oort_popup.vue'
import CameraDetail from './CameraDetail.vue'
import { getWvpVlsDeviceList } from '@/api/VLStreamCloud/wvp'

const props = defineProps({
  keyword: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()

const rows = ref([])
const loading = ref(false)
const loadError = ref('')
const showDetail = ref(false)
const currentCamera = ref(null)

// 搜索在前端过滤设备名称/设备ID，与视频广场同一口径
const devices = computed(() => {
  const kw = (props.keyword || '').trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter(item =>
    String(item.deviceName || '').toLowerCase().includes(kw) ||
    String(item.deviceId || '').toLowerCase().includes(kw)
  )
})

const fetchCameras = async() => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getWvpVlsDeviceList({ pageNum: 1, pageSize: 200 })
    if (res.code !== 200 || !Array.isArray(res.rows)) {
      loadError.value = res.msg || t('摄像头列表加载失败')
      rows.value = []
      return
    }
    rows.value = res.rows.map(item => ({
      ...item,
      deviceType: item.deviceType || item.deviceModel,
      address: item.address || item.ipAddr
    }))
  } catch (e) {
    loadError.value = e?.response?.data?.msg || e?.message || t('摄像头列表加载失败')
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchCameras)

const openDetail = (item) => {
  currentCamera.value = item
  showDetail.value = true
}
</script>

<style scoped lang="scss">
.camera-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 12px;
}

.list-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
  font-size: 14px;
  color: #999999;
}

.device-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
}

.name {
  line-height: 25px;
  font-weight: 700;
  color: #333333;
  font-size: 16px;
}

.info-row {
  display: flex;
  margin-top: 4px;
  font-size: 14px;
  line-height: 20px;

  img {
    width: 20px;
    height: 20px;
    margin-right: 4px;
  }
}

.label {
  min-width: 80px;
  color: #7a7c85;
}

.value {
  flex: 1;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.chips {
  display: flex;
  gap: 8px;
}

.chip {
  background: rgba(47, 105, 248, 1);
  border-radius: 2px;
  line-height: 16px;
  color: #ffffff;
  font-size: 12px;
  padding: 4px 12px;
}

.chip.offline {
  background: rgba(216, 216, 216, 1);
  color: #ffffff;
}

.play-btn {
  position: absolute;
  top: 16px;
  right: 12px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
