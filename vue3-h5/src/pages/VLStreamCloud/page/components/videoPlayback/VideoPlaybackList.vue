<template>
  <div class="playback-list">
    <van-pull-refresh
      v-model="refreshing"
      :success-text="$t('刷新成功')"
      @refresh="onRefresh"
    >
      <van-list
        v-if="showDevices.length"
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('没有更多了')"
        @load="onLoad"
      >
        <div
          v-for="item in showDevices"
          :key="item.id"
          class="playback-card"
          @click="openDetail(item)"
        >
          <div class="card-main">
            <div class="card-title-row">
              <div class="card-title">
                {{ item.deviceName }}
              </div>
            </div>

            <div class="info-row" style="width: 90%">
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
                <div class="chip" :class="{ offline: item.status != '1' }">
                  {{ item.status == '1' ? $t('在线') : $t('离线') }}
                </div>
                <div v-if="item.deviceType" class="chip">
                  {{ item.deviceType }}
                </div>
                <div v-if="item.heightPosition" class="chip">
                  {{ item.heightPosition }}
                </div>
              </div>
            </div>
            <div class="play-btn">
              <img v-if="item.status == '1'" src="@/assets/img/VLStreamCloud/spgc/playing.png" alt="" />
              <img v-else src="@/assets/img/VLStreamCloud/spgc/no_playing.png" alt="" />
            </div>
          </div>
        </div>
      </van-list>

      <!-- 空态 -->
      <div v-else class="no_data">
        <img src="@/assets/img/daily_activity/no_data.png" />
        <span>{{ $t('暂无数据') }}</span>
      </div>
    </van-pull-refresh>
    <oort-popup v-model="showDetail" position="right" style="width: 100%;height: 100%;" teleport="body">
      <!-- 详情页需要 WVP 行 id（云端录像查询）与 deviceId 序列号（事件录像过滤），传整行 -->
      <!-- 每次打开都重建详情页：日期回到当天，不沿用上次选的日期与播放状态 -->
      <VideoPlaybackDetail
        v-if="currentDevice"
        :key="detailKey"
        :device="currentDevice"
        @close="showDetail = false"
      />
    </oort-popup>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import OortPopup from '@/components/popup/oort_popup.vue'
import VideoPlaybackDetail from './VideoPlaybackDetail.vue'
import { getWvpVlsDeviceList } from '@/api/VLStreamCloud/wvp'

const props = defineProps({
  keyword: {
    type: String,
    default: ''
  }
})

const devices = ref<any[]>([])

// 后端 /vlsDeviceInfo/list 不支持关键字过滤，统一在前端按设备名称/设备ID匹配
const showDevices = computed(() => {
  const kw = (props.keyword || '').trim().toLowerCase()
  if (!kw) return devices.value
  return devices.value.filter(item =>
    String(item.deviceName || '').toLowerCase().includes(kw) ||
    String(item.deviceId || '').toLowerCase().includes(kw)
  )
})

// 分页 & 刷新状态
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 真实设备源：WVP VLStream 协议设备（与平台视频回放/视频广场同口径）
// WVP 行无 status/address 字段，归一化为列表模板所需结构
const normalizeWvpRow = (row: any) => ({
  ...row,
  status: row.online === true ? '1' : '0',
  address: row.ipAddr || '',
  deviceType: row.deviceModel || ''
})

const fetchDevices = async() => {
  try {
    // WVP 列表为 RuoYi 分页格式：{ code, rows, total }
    const res: any = await getWvpVlsDeviceList({ pageNum: page.value, pageSize: pageSize.value })
    if (res && res.code === 200 && Array.isArray(res.rows)) {
      const list = res.rows.map(normalizeWvpRow)
      if (page.value === 1) {
        devices.value = list
      } else {
        devices.value = [...devices.value, ...list]
      }

      const total = Number(res.total) || 0
      if (!total || devices.value.length >= total || list.length === 0) {
        finished.value = true
      } else {
        page.value += 1
      }
    } else {
      if (page.value === 1) {
        devices.value = []
      }
      finished.value = true
    }
  } catch (e) {
    if (page.value === 1) {
      devices.value = []
    }
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

onMounted(() => {
  fetchDevices()
})

// 上拉加载更多
const onLoad = () => {
  if (loading.value || finished.value) return
  loading.value = true
  fetchDevices()
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  finished.value = false
  page.value = 1
  devices.value = []
  fetchDevices()
}

const showDetail = ref(false)
const currentDevice = ref<any | null>(null)
const detailKey = ref(0)

const openDetail = (item: any) => {
  currentDevice.value = item
  detailKey.value++
  showDetail.value = true
}
</script>

<style scoped lang="scss">
.playback-list {
  margin-top: 16px;
}

.playback-card {
  position: relative;
  background: var(--vl-surface);
  border-radius: var(--vl-radius);
  padding: 12px;
  margin-bottom: 12px;
}

.card-main {
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
}

.card-title {
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
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: #ffffff;
  color: var(--vl-ink);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
}

/* 第一个胶囊是在线状态：圆点指示 */
.chip:first-child::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--vl-success);
}

.chip.offline {
  color: var(--vl-text-2);

  &::before {
    background: #c7c7cc;
  }
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
}

.play-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

// 暂无数据（同 eventPat.vue）
.no_data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;

  img {
    width: 162px;
    height: auto;
  }

  span {
    margin: 4px 0;
    font-size: 16px;
    color: #999;
    text-align: center;
  }
}
</style>

