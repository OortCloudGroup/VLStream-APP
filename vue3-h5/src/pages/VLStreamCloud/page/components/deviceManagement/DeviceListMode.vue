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
        <div v-if="loaded && !filteredRows.length" class="table-empty">
          {{ mineOnly ? $t('还没有添加设备，点击右下角 + 添加') : $t('暂无数据') }}
        </div>
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
import { ensureVlstreamUserId } from '@/utils/vlstreamAuth'
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
  },
  // 只显示当前用户添加的设备（按 VLStream 本地用户 ID 匹配 createUser）
  mineOnly: {
    type: Boolean,
    default: false
  }
})

const store = useUserStore()

// 单租户集群：业务设备表只有测试数据，真实设备在 WVP（VLStream 协议推送）
const isLocalAuth = config.authMode === 'local'

const { t } = useI18n()

const rows = ref([])
const loaded = ref(false)
const myUserId = ref('')

// 后端 /vlsDeviceInfo/page 的 SQL 不做条件过滤，标签/关键字统一在前端匹配
const filteredRows = computed(() => {
  let list = rows.value
  if (props.mineOnly) {
    list = myUserId.value ? list.filter(row => String(row.createUser || '') === myUserId.value) : []
  }
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
    loaded.value = true
    return
  }
  if (props.mineOnly && !myUserId.value) {
    myUserId.value = await ensureVlstreamUserId()
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
  loaded.value = true
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

.table-empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--vl-text-3);
}

.table-card {
  background: var(--vl-surface);
  border-radius: var(--vl-radius);
  overflow: hidden;
  margin-top: 16px;
}

.table-head {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.8fr;
  padding: 10px 12px;
  background: var(--vl-surface-2);
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
  border-radius: 999px;
  padding: 0 8px;
  font-size: 12px;
  line-height:18px;
}

.status-tag.online {
  color: rgba(48, 164, 108, 1);
  border-color: rgba(48, 164, 108, 0.15);
  background: rgba(48, 164, 108, 0.08);
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
  background: var(--vl-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(255, 106, 0, 0.32);
  z-index: 20;
}

.fab-plus {
  font-size: 34px;
  line-height: 34px;
  color: #fff;
  font-weight: 500;
}
</style>

<style lang="scss" scoped>
@use '@/styles/vl-mixins' as *;

.list-wrap.list-wrap {
  @include vl-device-table;
}
</style>
