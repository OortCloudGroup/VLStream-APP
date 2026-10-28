<template>
  <div class="ptz-panel">
    <div v-if="!canMove" class="ptz-notice">
      <van-icon name="info-o" class="notice-icon" />
      <span class="notice-text">{{ noticeText }}</span>
      <van-button
        v-if="canRetry"
        size="mini"
        plain
        type="primary"
        @click="checkCapabilities"
      >
        {{ $t('重新检查') }}
      </van-button>
    </div>

    <div class="control-wheel" :class="{ 'is-disabled': !canMove }">
      <div class="dir up" @pointerdown="startMove('up')" @pointerup="stopMove" @pointerleave="stopMove" @pointercancel="stopMove">
        <img src="@/assets/img/VLStreamCloud/PTZ/jt.png" alt="" />
      </div>
      <div class="dir left" @pointerdown="startMove('left')" @pointerup="stopMove" @pointerleave="stopMove" @pointercancel="stopMove">
        <img src="@/assets/img/VLStreamCloud/PTZ/jt.png" alt="" />
      </div>
      <div class="dir center" @click="stopMove">
        <img src="@/assets/img/VLStreamCloud/PTZ/jz.png" alt="" />
      </div>
      <div class="dir right" @pointerdown="startMove('right')" @pointerup="stopMove" @pointerleave="stopMove" @pointercancel="stopMove">
        <img src="@/assets/img/VLStreamCloud/PTZ/jt.png" alt="" />
      </div>
      <div class="dir down" @pointerdown="startMove('down')" @pointerup="stopMove" @pointerleave="stopMove" @pointercancel="stopMove">
        <img src="@/assets/img/VLStreamCloud/PTZ/jt.png" alt="" />
      </div>
    </div>

    <div class="speed-bar" :class="{ 'is-disabled': !canMove }">
      <span class="speed-label">{{ $t('速度') }}</span>
      <van-slider v-model="speed" :min="0.1" :max="1" :step="0.1" :disabled="!canMove" class="speed-slider" />
      <span class="speed-value">{{ speed.toFixed(1) }}</span>
    </div>

    <div v-if="canPreset" class="preset-section">
      <div class="preset-title">
        {{ $t('预置点') }}
      </div>
      <div class="preset-add">
        <van-field v-model="presetName" :placeholder="$t('请输入预置点名称')" class="preset-input" />
        <van-button size="small" type="primary" :disabled="!presetName.trim()" @click="addPreset">
          {{ $t('添加') }}
        </van-button>
      </div>
      <div v-if="presets.length" class="preset-list">
        <div v-for="item in presets" :key="item.token" class="preset-item">
          <span class="preset-name">{{ item.name || item.token }}</span>
          <div class="preset-actions">
            <span @click="gotoPreset(item)">{{ $t('调用') }}</span>
            <span class="danger" @click="deletePreset(item)">{{ $t('删除') }}</span>
          </div>
        </div>
      </div>
      <div v-else class="preset-empty">
        {{ presetsLoading ? $t('预置点加载中…') : $t('暂无预置点') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import {
  addOnvifPreset,
  getOnvifDeviceList,
  getOnvifPresets,
  getPtzCapabilities,
  gotoOnvifPreset,
  onvifPtzStart,
  onvifPtzStop,
  removeOnvifPreset
} from '@/api/VLStreamCloud/onvif'
import { getWvpVlsDeviceList } from '@/api/VLStreamCloud/wvp'
import {
  PTZ_DIRECTIONS,
  canUsePtzMovement,
  canUsePtzPresets,
  checkingCapabilities,
  createPtzHoldController,
  normalizePtzCapabilities,
  unsupportedCapabilities
} from '@/utils/onvifPtz'

const { t } = useI18n()

const props = defineProps({
  // 摄像头对象：WVP 设备行（ipAddr）或 vlsDeviceInfo 记录（deviceId，需要回查 WVP）
  camera: {
    type: Object,
    default: null
  }
})

const speed = ref(0.1)
const presetName = ref('')
const presets = ref([])
const presetsLoading = ref(false)
const capabilities = ref(null)
const presetParams = ref(null)

let generation = 0

const canMove = computed(() => canUsePtzMovement(capabilities.value))
const canPreset = computed(() => !!presetParams.value && canUsePtzPresets(capabilities.value))
const canRetry = computed(() => !!props.camera && capabilities.value && capabilities.value.status !== 'checking')
const noticeText = computed(() => {
  const state = capabilities.value
  if (!props.camera) return t('请选择摄像头')
  if (!state || state.status === 'checking') return t('正在检查云台能力，请稍候')
  if (state.status === 'supported') return t('该摄像头不支持连续方向控制')
  return state.reason || t('该摄像头不支持云台控制')
})

const hold = createPtzHoldController({
  startRequest: onvifPtzStart,
  stopRequest: onvifPtzStop
})

const startMove = direction => {
  if (!canMove.value) return
  hold.start({ id: capabilities.value.onvifId, direction: PTZ_DIRECTIONS[direction], speed: speed.value })
}

const stopMove = () => {
  hold.stop()
}

const stopWhenHidden = () => {
  if (document.hidden) stopMove()
}

const cameraKey = computed(() => {
  const camera = props.camera || {}
  return `${camera.ipAddr || camera.ip || ''}|${camera.deviceId || ''}|${camera.capabilitiesJson || ''}`
})

// vlsDeviceInfo 记录没有 IP，用设备序列号回查 WVP 推送设备拿到 ipAddr
const resolveCameraIp = async(camera) => {
  if (camera.ipAddr || camera.ip) return { ip: camera.ipAddr || camera.ip, capabilitiesJson: camera.capabilitiesJson }
  if (!camera.deviceId) return null
  const res = await getWvpVlsDeviceList({ pageNum: 1, pageSize: 200 })
  const rows = res && Array.isArray(res.rows) ? res.rows : []
  const matched = rows.find(item => item.deviceId === camera.deviceId)
  return matched ? { ip: matched.ipAddr, capabilitiesJson: matched.capabilitiesJson } : null
}

const checkCapabilities = async() => {
  const camera = props.camera
  if (!camera) return
  const current = ++generation
  capabilities.value = checkingCapabilities()
  presetParams.value = null
  presets.value = []
  try {
    const resolved = await resolveCameraIp(camera)
    if (current !== generation) return
    if (!resolved || !resolved.ip) {
      capabilities.value = unsupportedCapabilities(t('设备没有上报 IP 地址，无法检查云台能力'))
      return
    }
    const listRes = await getOnvifDeviceList({ page: 1, count: 200 })
    if (current !== generation) return
    const list = Array.isArray(listRes && listRes.data) ? listRes.data : []
    const onvifDevice = list.find(item => String(item.ip || '').trim() === String(resolved.ip).trim())
    if (!onvifDevice) {
      const declared = /"ptz"/.test(String(resolved.capabilitiesJson || ''))
      capabilities.value = unsupportedCapabilities(declared
        ? t('设备声明支持云台，但未接入 ONVIF 云台服务')
        : t('该摄像头不支持云台控制'))
      return
    }
    const capsRes = await getPtzCapabilities({ id: onvifDevice.id, refresh: true })
    if (current !== generation) return
    const normalized = normalizePtzCapabilities(capsRes && capsRes.data, onvifDevice.channel || '')
    capabilities.value = { ...normalized, onvifId: onvifDevice.id }
    if (normalized.presets) {
      presetParams.value = {
        ip: onvifDevice.ip,
        username: onvifDevice.userName,
        password: onvifDevice.password,
        profileToken: normalized.profileToken
      }
    }
  } catch (error) {
    if (current !== generation) return
    capabilities.value = normalizePtzCapabilities({
      status: 'unknown',
      reason: error?.response?.data?.msg || error?.message || t('云台能力检查失败')
    })
  }
}

watch(cameraKey, () => {
  stopMove()
  const camera = props.camera || {}
  if (!camera.ipAddr && !camera.ip && !camera.deviceId) {
    generation += 1
    presetParams.value = null
    presets.value = []
    capabilities.value = unsupportedCapabilities(t('请选择摄像头'))
    return
  }
  checkCapabilities()
}, { immediate: true })

const presetQuery = (extra = {}) => ({ ...(presetParams.value || {}), ...extra })

const loadPresets = async() => {
  if (!canPreset.value) {
    presets.value = []
    return
  }
  presetsLoading.value = true
  try {
    const res = await getOnvifPresets(presetQuery())
    presets.value = res && Array.isArray(res.data) ? res.data : []
  } catch (error) {
    presets.value = []
  } finally {
    presetsLoading.value = false
  }
}

const addPreset = async() => {
  const name = presetName.value.trim()
  if (!canPreset.value || !name) return
  const res = await addOnvifPreset(presetQuery({ presetToken: name }))
  if (res && res.code === 200) {
    presetName.value = ''
    showToast(t('操作成功'))
    await loadPresets()
  }
}

const gotoPreset = async(item) => {
  if (!canPreset.value || !item?.token) return
  const res = await gotoOnvifPreset(presetQuery({ presetToken: item.token }))
  if (res && res.code === 200) showToast(t('操作成功'))
}

const deletePreset = async(item) => {
  if (!canPreset.value || !item?.token) return
  const res = await removeOnvifPreset(presetQuery({ presetToken: item.token }))
  if (res && res.code === 200) {
    showToast(t('操作成功'))
    await loadPresets()
  }
}

watch(canPreset, () => loadPresets(), { immediate: true })

onMounted(() => {
  window.addEventListener('pointerup', stopMove)
  window.addEventListener('pointercancel', stopMove)
  window.addEventListener('blur', stopMove)
  document.addEventListener('visibilitychange', stopWhenHidden)
})

onBeforeUnmount(() => {
  stopMove()
  generation += 1
  window.removeEventListener('pointerup', stopMove)
  window.removeEventListener('pointercancel', stopMove)
  window.removeEventListener('blur', stopMove)
  document.removeEventListener('visibilitychange', stopWhenHidden)
})
</script>

<style scoped lang="scss">
.ptz-panel {
  background: #f6f8ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.ptz-notice {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 141, 34, 0.1);
  color: #c26a10;
  font-size: 13px;
  line-height: 18px;
  box-sizing: border-box;
}

.notice-icon {
  flex: none;
}

.notice-text {
  flex: 1;
}

.control-wheel {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(227, 234, 255, 1);
  position: relative;
  display: grid;
  place-items: center;

  &.is-disabled {
    opacity: 0.45;
  }
}

.dir {
  width: 44px;
  height: 24.75px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1c6cff;
  font-size: 22px;
  touch-action: none;

  img {
    width: 100%;
    height: 100%;
  }

  &.up {
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
  }

  &.down {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%) rotate(180deg);
  }

  &.left {
    left: 12px;
    top: 50%;
    transform: translateY(-50%) rotate(270deg);
  }

  &.right {
    right: 12px;
    top: 50%;
    transform: translateY(-50%) rotate(90deg);
  }

  &.center {
    width: 93.5px;
    height: 93.5px;
    border-radius: 50%;
  }
}

.speed-bar {
  width: 90%;
  max-width: 360px;
  background: #fff;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  box-sizing: border-box;

  &.is-disabled {
    opacity: 0.45;
  }
}

.speed-label {
  font-size: 14px;
  color: #333333;
  white-space: nowrap;
}

.speed-slider {
  flex: 1;
}

.speed-value {
  width: 28px;
  text-align: right;
  font-size: 14px;
  color: #1a53ff;
}

.preset-section {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
}

.preset-title {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 10px;
}

.preset-add {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preset-input {
  flex: 1;
  border: 1px solid #c3c3c3;
  border-radius: 8px;
  padding: 4px 8px;
}

.preset-list {
  margin-top: 8px;
}

.preset-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid rgba(235, 237, 240, 1);
  font-size: 14px;
  color: #333333;
}

.preset-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preset-actions {
  display: flex;
  gap: 16px;
  color: #2f69f8;
  font-size: 14px;

  .danger {
    color: #e33645;
  }
}

.preset-empty {
  margin-top: 8px;
  padding: 8px 0;
  text-align: center;
  font-size: 13px;
  color: #999999;
}
</style>
