<template>
  <div class="camera-info">
    <div class="title-row">
      <span class="device-name">{{ device.deviceName || '--' }}</span>
      <span class="status-tag" :class="{ offline: !device.online }">{{ device.online ? '在线' : '离线' }}</span>
    </div>

    <div class="info-card">
      <div v-for="item in infoList" :key="item.label" class="info-row">
        <div class="info-label">
          <img :src="item.icon" alt="" class="info-icon" />
          <span>{{ item.label }}</span>
        </div>
        <div class="info-value" :class="{ 'is-warning': item.warning }">
          {{ item.value }}
        </div>
      </div>
    </div>

    <div class="section-heading">
      设备运行模型
    </div>
    <div class="table-card">
      <div v-if="models.length" class="table-body">
        <div v-for="(model, index) in models" :key="model.modelId || index" class="model-row">
          <div class="model-main">
            <span class="model-name">{{ model.modelName || model.modelId || '--' }}</span>
            <span class="model-id">{{ model.modelId }}</span>
          </div>
          <div class="model-meta">
            <span v-if="model.format" class="model-format">{{ model.format }}</span>
            <span class="model-status">{{ modelStatusText(model.status) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-text">
        {{ device.modelsJson == null ? '设备尚未上报模型信息' : '设备上报的模型列表为空' }}
      </div>
    </div>

    <div class="section-heading">
      视频源
    </div>
    <div class="table-card">
      <div v-if="streamRows.length" class="table-body">
        <div v-for="(stream, index) in streamRows" :key="stream.id || index" class="stream-row">
          <div class="stream-main">
            <span class="stream-channel">{{ stream.channelId || stream.streamName || '--' }}</span>
            <span class="stream-tag">{{ stream.streamType || '--' }}</span>
            <span class="stream-tag">{{ stream.protocol || '--' }}</span>
            <span v-if="stream.defaultStream" class="stream-tag primary">默认流</span>
            <span v-if="stream.available === false" class="stream-tag warning">不可用</span>
          </div>
          <div class="stream-url">
            {{ stream.sourceUrl || stream.url || '未上报' }}
          </div>
        </div>
      </div>
      <div v-else class="empty-text">
        设备没有上报视频源
      </div>
    </div>

    <template v-if="upgrades.length">
      <div class="section-heading">
        可用固件升级
      </div>
      <div class="table-card">
        <div v-for="item in upgrades" :key="item.firmwareId" class="upgrade-row">
          <span>{{ item.fileName || 'RootFS' }}</span>
          <span class="upgrade-version">{{ item.currentVersion }} → {{ item.latestVersion }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import sbid from '@/assets/img/VLStreamCloud/sbgl/sbid.png'
import sbbq from '@/assets/img/VLStreamCloud/sbgl/sbbq.png'
import sbwz from '@/assets/img/VLStreamCloud/sbgl/sbwz.png'
import sbzb from '@/assets/img/VLStreamCloud/sbgl/sbzb.png'
import cjsj from '@/assets/img/VLStreamCloud/sbgl/cjsj.png'
import yysf from '@/assets/img/VLStreamCloud/sbgl/yysf.png'
import {
  capabilityText,
  deviceBootTimeText,
  deviceLocationText,
  deviceOnlineDurationText,
  formatDeviceTime,
  modelStatusText,
  parseSnapshot
} from '@/utils/deviceState'

const props = defineProps({
  device: {
    type: Object,
    default: () => ({})
  },
  detail: {
    type: Object,
    default: () => null
  },
  streams: {
    type: Array,
    default: () => []
  }
})

const now = ref(Date.now())
const clock = setInterval(() => {
  now.value = Date.now()
}, 30000)
onBeforeUnmount(() => clearInterval(clock))

const models = computed(() => parseSnapshot(props.device?.modelsJson) || [])
const streamRows = computed(() => Array.isArray(props.streams) ? props.streams : [])
const upgrades = computed(() => Array.isArray(props.detail?.availableUpgrades) ? props.detail.availableUpgrades : [])

const firmwareValue = computed(() => {
  const current = props.device?.firmwareVersion || '--'
  const latest = upgrades.value[0]?.latestVersion
  return latest ? `${current}（可升级至 ${latest}）` : current
})

const infoList = computed(() => [
  { label: '设备名称', value: props.device?.deviceName || '--', icon: sbbq },
  { label: '设备ID', value: props.device?.deviceId || '--', icon: sbid },
  { label: '设备型号', value: props.device?.deviceModel || '--', icon: sbbq },
  { label: '在线状态', value: props.device?.online ? '在线' : '离线', icon: sbid },
  { label: 'IP 地址', value: props.device?.ipAddr || '--', icon: sbwz },
  { label: 'RootFS 版本', value: firmwareValue.value, icon: yysf, warning: upgrades.value.length > 0 },
  { label: '开机时间', value: deviceBootTimeText(props.device), icon: cjsj },
  { label: '在线时长', value: deviceOnlineDurationText(props.device, now.value), icon: cjsj },
  { label: '最后心跳', value: formatDeviceTime(props.device?.lastHeartbeatTime), icon: cjsj },
  { label: '设备能力', value: capabilityText(props.device?.capabilitiesJson), icon: sbbq },
  { label: '位置坐标', value: deviceLocationText(props.device), icon: sbzb }
])
</script>

<style scoped lang="scss">
.camera-info {
  display: flex;
  flex-direction: column;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
}

.device-name {
  font-size: 16px;
  font-weight: 700;
  color: #333333;
}

.status-tag {
  padding: 0 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  color: #00ba52;
  background: rgba(0, 186, 82, 0.08);
  border: 1px solid rgba(0, 186, 82, 0.15);

  &.offline {
    color: #999999;
    background: rgba(153, 153, 153, 0.08);
    border-color: rgba(153, 153, 153, 0.15);
  }
}

.info-card {
  margin-top: 12px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  font-size: 14px;

  &:first-child {
    margin-top: 0;
  }
}

.info-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 96px;
  line-height: 22px;
  color: #7a7c85;
}

.info-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.info-value {
  flex: 1;
  line-height: 22px;
  color: #333333;
  word-break: break-all;

  &.is-warning {
    color: #ff8d22;
  }
}

.section-heading {
  margin: 12px 4px 8px;
  font-size: 15px;
  font-weight: 600;
  color: #333333;
}

.table-card {
  background: #fff;
  border-radius: 8px;
  padding: 4px 16px;
}

.table-body {
  padding: 4px 0;
}

.model-row,
.stream-row,
.upgrade-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 0;
  border-top: 1px solid rgba(235, 237, 240, 1);
  font-size: 14px;
  color: #333333;

  &:first-child {
    border-top: 0;
  }
}

.model-main,
.stream-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.model-name {
  font-weight: 500;
}

.model-id {
  font-size: 12px;
  color: #7a7c85;
}

.model-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #7a7c85;
  white-space: nowrap;
}

.stream-row {
  flex-direction: column;
  align-items: flex-start;
}

.stream-channel {
  font-weight: 500;
}

.stream-tag {
  padding: 0 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  color: #7a7c85;
  background: #f0f2f5;

  &.primary {
    color: #2f69f8;
    background: rgba(47, 105, 248, 0.1);
  }

  &.warning {
    color: #ff8d22;
    background: rgba(255, 141, 34, 0.1);
  }
}

.stream-url {
  width: 100%;
  font-size: 12px;
  line-height: 18px;
  color: #7a7c85;
  word-break: break-all;
}

.upgrade-version {
  font-size: 12px;
  color: #ff8d22;
  white-space: nowrap;
}

.empty-text {
  padding: 16px 0;
  text-align: center;
  font-size: 14px;
  color: #999999;
}
</style>
