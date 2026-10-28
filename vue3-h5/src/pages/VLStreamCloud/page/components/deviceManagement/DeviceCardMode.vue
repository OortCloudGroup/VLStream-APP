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

    <div class="fab" @click="onAdd">
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
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import OortPopup from '@/components/popup/oort_popup.vue'
import CameraDetail from '@/pages/VLStreamCloud/page/components/cameraDetail/CameraDetail.vue'
import EditDevice from '@/pages/VLStreamCloud/page/components/deviceManagement/EditDevice.vue'
import { getDeviceList } from '@/api/VLStreamCloud/device'
import { resolveWvpDeviceRow } from '@/utils/wvpDevice'
import { useUserStore } from '@/store/modules/useraPaas'

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

const { t } = useI18n()

const rows = ref([])

// 关键字统一在设备名称/设备编号上做前缀匹配
const filteredRows = computed(() => {
  const kw = (props.keyword || '').trim().toLowerCase()
  if (!kw) return rows.value
  return rows.value.filter(row =>
    String(row.deviceName || '').toLowerCase().includes(kw) ||
    String(row.deviceId || '').toLowerCase().includes(kw)
  )
})

const fetchDevices = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    current: 1,
    size: 200
  }
  // 如果传入了 tagName，则添加到请求参数中
  if (props.tagName) {
    params.tag = props.tagName
  }
  const res = await getDeviceList(params)
  if (res.code === 200 && res.data && Array.isArray(res.data.records)) {
    rows.value = res.data.records
  }
}

onMounted(() => {
  fetchDevices()
})

// 监听 tagName 变化，重新获取设备列表
watch(
  () => props.tagName,
  () => {
    fetchDevices()
  }
)

const showDetail = ref(false)
const showAdd = ref(false)
const currentRow = ref(null)

const onAdd = () => {
  showAdd.value = true
}

// 点击设备打开摄像头详情：先按设备序列号找到 WVP 设备行
const openDetail = async(row) => {
  showToast({ message: t('正在打开设备详情…'), duration: 0, forbidClick: true })
  const wvpRow = await resolveWvpDeviceRow(row.deviceId)
  showToast.clear()
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
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
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

.fab {
  position: fixed;
  right: 18px;
  bottom: 92px;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #2f69f8;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(47, 105, 248, 0.35);
  z-index: 20;
}

.fab-plus {
  font-size: 34px;
  line-height: 34px;
  color: #fff;
  font-weight: 500;
}
</style>
