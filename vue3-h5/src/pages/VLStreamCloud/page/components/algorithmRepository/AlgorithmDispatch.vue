<template>
  <div class="algo-dispatch">
    <nav-header-banner :title="$t('算法下发')" :is-call-back="true" @call-back="onBack" />

    <div class="dispatch-content">
      <!-- 关键字搜索：WVP VLStream 设备列表无标签/设备树维度，统一在前端过滤 -->
      <van-search
        v-model="keyword"
        :placeholder="$t('请输入设备名称/设备ID')"
        class="device-search"
      />

      <!-- 列表标题 -->
      <div class="list-header-bar">
        <span class="list-title">{{ $t('设备列表') }}</span>
        <div class="list-actions">
          <img src="@/assets/img/VLStreamCloud/xf.png" alt="" />
          <span class="all-push" @click="onDispatchAll">{{ $t('全部下发') }}</span>
        </div>
      </div>

      <!-- 设备列表：与设备管理页一致的 table-card 风格，数据源为 WVP VLStream 协议设备 -->
      <div class="table-card">
        <div class="table-head">
          <div class="col checkbox">
            <van-checkbox :model-value="isAllChecked" shape="square" @click.stop="toggleAll" />
          </div>
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

        <van-checkbox-group v-model="checkedIds">
          <div
            v-for="dev in filteredDevices"
            :key="dev.id"
            class="table-row"
            @click="onToggleDevice(dev)"
          >
            <div class="col checkbox">
              <van-checkbox :name="String(dev.deviceId)" shape="square" @click.stop />
            </div>
            <div class="col name">
              {{ dev.deviceName }}
            </div>
            <div class="col id">
              {{ dev.deviceId }}
            </div>
            <div class="col">
              <van-tag
                v-if="dev.online === true"
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
        </van-checkbox-group>

        <!-- 加载中 -->
        <div v-if="loading" class="list-state">
          <van-loading size="24px" vertical>
            {{ $t('正在加载摄像头…') }}
          </van-loading>
        </div>

        <!-- 空态 -->
        <div v-else-if="!filteredDevices.length" class="no_data">
          <img src="@/assets/img/daily_activity/no_data.png" />
          <span>{{ $t('暂无数据') }}</span>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="footer-bar">
      <van-button type="primary" block round class="push-btn" @click="onDispatch">
        {{ $t('下发') }}
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { getWvpVlsDeviceList } from '@/api/VLStreamCloud/wvp'
import { dispatchAlgorithmToDevices } from '@/api/VLStreamCloud/device'
import NavHeaderBanner from '@/components/navHeaderBanner/index.vue'

const emit = defineEmits(['close'])

const { t } = useI18n()

// 可选算法ID
const props = defineProps<{
  algorithmId?: string | number
}>()

// WVP VLStream 协议设备列表
const devices = ref<any[]>([])
const loading = ref(false)
// 关键字（前端过滤设备名称/设备ID）
const keyword = ref('')
// 已勾选的设备序列号（WVP 行 deviceId，下发接口要求的取值口径）
const checkedIds = ref<string[]>([])

// 关键字在设备名称/设备ID上做前端匹配
const filteredDevices = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return devices.value
  return devices.value.filter(dev =>
    String(dev.deviceName || '').toLowerCase().includes(kw) ||
    String(dev.deviceId || '').toLowerCase().includes(kw)
  )
})

const fetchDevices = async() => {
  loading.value = true
  try {
    const res: any = await getWvpVlsDeviceList({ pageNum: 1, pageSize: 200 })
    if (res && res.code === 200 && Array.isArray(res.rows)) {
      devices.value = res.rows
    } else {
      devices.value = []
    }
  } catch (e) {
    devices.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDevices()
})

const isAllChecked = computed(() => {
  const visible = filteredDevices.value
  if (!visible.length) return false
  return visible.every(dev => checkedIds.value.includes(String(dev.deviceId)))
})

// 全选/取消全选只作用于当前可见（过滤后）的设备
const toggleAll = () => {
  const visible = filteredDevices.value
  if (!visible.length) return
  if (isAllChecked.value) {
    const visibleIds = new Set(visible.map(dev => String(dev.deviceId)))
    checkedIds.value = checkedIds.value.filter(id => !visibleIds.has(id))
  } else {
    const merged = new Set(checkedIds.value)
    visible.forEach(dev => merged.add(String(dev.deviceId)))
    checkedIds.value = [...merged]
  }
}

// 点击整行切换勾选（checkbox 自身点击由 vant 处理，仅阻止冒泡避免二次切换）
const onToggleDevice = (dev: any) => {
  const id = String(dev.deviceId)
  if (checkedIds.value.includes(id)) {
    checkedIds.value = checkedIds.value.filter(item => item !== id)
  } else {
    checkedIds.value = [...checkedIds.value, id]
  }
}

// 全部下发
const onDispatchAll = async() => {
  if (!filteredDevices.value.length) {
    showToast({ type: 'fail', message: t('暂无可下发设备') })
    return
  }
  checkedIds.value = filteredDevices.value.map(dev => String(dev.deviceId))
  await onDispatch()
}

// 下发算法到选中的设备
// 对齐平台：POST /vlsDeviceInfo/{algorithmId}/algorithms，deviceIds 为设备序列号逗号串
const onDispatch = async() => {
  if (!props.algorithmId) {
    showToast({ type: 'fail', message: t('缺少算法ID') })
    return
  }
  if (!checkedIds.value.length) {
    showToast({ type: 'fail', message: t('请先选择设备') })
    return
  }

  const res: any = await dispatchAlgorithmToDevices(props.algorithmId, checkedIds.value.join(','))
  if (res && res.code === 200) {
    showToast({ type: 'success', message: res.msg })
  }
}

const onBack = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.algo-dispatch {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9faff;
}

.dispatch-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 12px;
}

.device-search {
  background: transparent;
  padding: 8px 12px 0;
}

.list-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 0;
  font-size: 14px;
  color: #374151;
}

.list-title {
  line-height: 24px;
  font-weight: 500;
  color: #969799;
  font-size: 12px;
}

.list-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1a53ff;
  font-size: 12px;

  img {
    width: 16px;
    height: 16px;
  }
}

.table-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
  margin: 12px 12px 0;
}

.table-head {
  display: grid;
  grid-template-columns: 40px 1.3fr 1.2fr 0.8fr;
  padding: 10px 12px;
  background: #fafafa;
  line-height: 18px;
  color: #333333;
  font-size: 14px;
}

.table-row {
  display: grid;
  grid-template-columns: 40px 1.3fr 1.2fr 0.8fr;
  padding: 16px 12px;
  border-top: 1px solid rgba(235, 237, 240, 1);
  background: #ffffff;
  color: #333333;
  font-size: 14px;

  .col {
    display: flex;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .col.checkbox {
    overflow: visible;
  }
}

.status-tag {
  border-radius: 4px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
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

.list-state {
  display: flex;
  justify-content: center;
  padding: 24px 0;
  color: #999999;
}

// 暂无数据（同 VideoPlaybackList.vue）
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

.footer-bar {
  padding: 10px 16px 24px;
  background: #f9faff;
}

.push-btn {
  font-size: 16px;
}
</style>
