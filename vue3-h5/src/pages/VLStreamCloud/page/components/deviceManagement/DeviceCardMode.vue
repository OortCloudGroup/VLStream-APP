<template>
  <div class="card-wrap">
    <div class="card-list">
      <div v-for="row in filteredRows" :key="row.id" class="device-card" @click="openDetail(row)">
        <div class="card-header">
          <div class="name">
            {{ row.deviceName }}
          </div>
        </div>

        <div class="info-row">
          <img src="@/assets/img/VLStreamCloud/spgc/sbId.png" alt="" />
          <div class="label">
            {{ $t('设备ID') }}
          </div>
          <div class="value">
            {{ row.deviceId }}
          </div>
        </div>
        <div class="info-row">
          <img src="@/assets/img/VLStreamCloud/spgc/sbwz.png" alt="" />
          <div class="label">
            {{ $t('设备位置') }}
          </div>
          <div class="value">
            {{ row.address }}
          </div>
        </div>

        <div class="card-footer">
          <div class="chips">
            <div class="chip" :class="{ offline: row.status != '1' }">
              {{ row.status == '1' ? $t('在线') : $t('离线') }}
            </div>
            <div v-if="row.deviceType" class="chip">
              {{ row.deviceType }}
            </div>
            <div v-if="row.heightPosition" class="chip">
              {{ row.heightPosition }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 单租户：设备由视频平台推送接入，不提供业务表手工新增入口 -->
    <div v-if="!isLocalAuth" class="fab" @click="onAdd">
      <span class="fab-plus">+</span>
    </div>

    <oort-popup v-model="showDetail" position="right" style="width: 100%;height: 100%;" teleport="body">
      <CameraDetail
        v-if="showDetail && currentRow"
        :camera="currentRow"
        @close="showDetail = false"
      />
    </oort-popup>

    <oort-popup v-model="showAdd" position="right" style="width: 100%;height: 100%;" teleport="body">
      <EditDevice v-if="showAdd" @saved="fetchDevices" @close="showAdd = false" />
    </oort-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { closeToast, showToast } from 'vant'
import OortPopup from '@/components/popup/oort_popup.vue'
import CameraDetail from '@/pages/VLStreamCloud/page/components/cameraDetail/CameraDetail.vue'
import EditDevice from '@/pages/VLStreamCloud/page/components/deviceManagement/EditDevice.vue'
import { getDeviceList } from '@/api/VLStreamCloud/device'
import { getWvpVlsDeviceList } from '@/api/VLStreamCloud/wvp'
import { resolveWvpDeviceRow } from '@/utils/wvpDevice'
import { useUserStore } from '@/store/modules/useraPaas'
import config from '@/config'

const props = defineProps({
  tagName: {
    type: String,
    default: null
  },
  keyword: {
    type: String,
    default: ''
  }
})

const store = useUserStore()

// 单租户集群：业务设备表只有测试数据，真实设备在 WVP（VLStream 协议推送）
const isLocalAuth = config.authMode === 'local'

const { t } = useI18n()

const rows = ref([])

// 后端 /vlsDeviceInfo/page 的 SQL 不做条件过滤，标签/关键字统一在前端匹配
const filteredRows = computed(() => {
  let list = rows.value
  if (props.tagName) {
    list = list.filter(row => String(row.tag || '') === String(props.tagName))
  }
  const kw = (props.keyword || '').trim().toLowerCase()
  if (!kw) return list
  return list.filter(row =>
    String(row.deviceName || '').toLowerCase().includes(kw) ||
    String(row.deviceId || '').toLowerCase().includes(kw)
  )
})

// WVP 行归一化：status←online、address←ipAddr、deviceType←deviceModel
const normalizeWvpRow = (row) => ({
  ...row,
  status: row.online === true ? '1' : '0',
  address: row.ipAddr || '',
  deviceType: row.deviceModel || ''
})

const fetchDevices = async() => {
  if (isLocalAuth) {
    // 真实设备源：WVP VLStream 协议设备（RuoYi 分页格式 { code, rows }）
    const res = await getWvpVlsDeviceList({ pageNum: 1, pageSize: 200 })
    if (res && res.code === 200 && Array.isArray(res.rows)) {
      rows.value = res.rows.map(normalizeWvpRow)
    }
    return
  }
  const params = {
    accessToken: store.userInfo?.accessToken,
    current: 1,
    size: 200
  }
  const res = await getDeviceList(params)
  if (res.code === 200 && res.data && Array.isArray(res.data.records)) {
    rows.value = res.data.records
  }
}

onMounted(() => {
  fetchDevices()
})

const showDetail = ref(false)
const showAdd = ref(false)
const currentRow = ref(null)

const onAdd = () => {
  showAdd.value = true
}

// 点击设备打开摄像头详情
const openDetail = async(row) => {
  // 单租户：列表行本身就是 WVP 设备行，无需再按序列号解析
  if (isLocalAuth) {
    currentRow.value = row
    showDetail.value = true
    return
  }
  showToast({ message: t('正在打开设备详情…'), duration: 0, forbidClick: true })
  let wvpRow = null
  let failed = false
  try {
    wvpRow = await resolveWvpDeviceRow(row.deviceId)
  } catch (e) {
    failed = true
  } finally {
    // 不管成功失败都要关掉 forbidClick 的加载 toast，避免界面被永久遮罩卡死
    closeToast()
  }
  if (failed) {
    showToast(t('打开设备详情失败，请稍后重试'))
    return
  }
  if (!wvpRow) {
    showToast(t('该设备未接入视频平台'))
    return
  }
  currentRow.value = wvpRow
  showDetail.value = true
}
</script>

<style lang="scss" scoped>
.card-wrap {
  position: relative;
}

.card-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.device-card {
  position: relative;
  background: var(--vl-surface);
  border-radius: var(--vl-radius);
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

.fab {
  position: fixed;
  right: 18px;
  bottom: 92px;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #1c1c1e;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(28, 28, 30, 0.35);
  z-index: 20;
}

.fab-plus {
  font-size: 34px;
  line-height: 34px;
  color: #fff;
  font-weight: 500;
}
</style>
