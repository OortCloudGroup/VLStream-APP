<template>
  <div class="list-wrap">
    <div class="table-card">
      <div class="table-head">
        <div class="col name">
          {{ $t('设备名称') }}
        </div>
        <div class="col id">
          {{ $t('设备ID') }}
        </div>
        <div class="col">
          {{ $t('状态') }}
        </div>
      </div>

      <div class="table-body">
        <div
          v-for="row in filteredRows"
          :key="row.id"
          class="table-row"
          @click="openDetail(row)"
        >
          <div class="col">
            {{ row.deviceName }}
          </div>
          <div class="col">
            {{ row.deviceId }}
          </div>
          <div class="col">
            <van-tag
              v-if="row.status == '1'"
              type="success"
              plain
              class="status-tag online"
            >
              {{ $t('在线') }}
            </van-tag>
            <van-tag v-else type="default" plain class="status-tag offline">
              {{ $t('离线') }}
            </van-tag>
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
import EditDevice from '../deviceManagement/EditDevice.vue'
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

// WVP 行无 status 字段，归一化在线状态供模板判断
const normalizeWvpRow = (row) => ({
  ...row,
  status: row.online === true ? '1' : '0'
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

const onAdd = () => {
  showAdd.value = true
}

</script>

<style lang="scss" scoped>
.list-wrap {
  position: relative;
}

.table-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  margin-top: 16px;
}

.table-head {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr;
  padding: 10px 12px;
  background:#fafafa;
  line-height:18px;
  color:#333333;
  font-size:14px;
}

.table-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr;
  padding: 20px 12px;
  border-top: 1px solid rgba(235, 237, 240, 1);
  color:#333333;
  font-size:14px;
  .col{
    display: flex;
    align-items: center;
  }
}

.status-tag {
  border-radius:4px;
  padding: 0 6px;
  font-size: 12px;
  line-height:18px;
}

.status-tag.online {
  color: rgba(0, 186, 82, 1);
  border-color: rgba(0, 186, 82, 0.15);
  background: rgba(0, 186, 82, 0.08);
}

.status-tag.offline {
  color: rgba(153, 153, 153, 1);
  border-color: rgba(153, 153, 153, 0.15);
  background: rgba(153, 153, 153, 0.08);
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

