<!--
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
-->
<template>
  <div class="camera-detail">
    <nav-header-banner :title="$t('摄像头详情')" :is-call-back="true" @call-back="onBack">
      <span v-if="!management" class="header-action" @click="showApply = true">{{ $t('申请使用') }}</span>
    </nav-header-banner>

    <div class="detail-body">
      <div class="player-wrap">
        <video
          ref="videoRef"
          class="player-video"
          autoplay
          muted
          playsinline
          controls
        />
        <div v-if="playingTip" class="player-tip">
          <span class="tip-text">{{ playingTip }}</span>
          <van-button
            v-if="playbackState !== 'loading'"
            size="mini"
            plain
            type="primary"
            class="retry-btn"
            @click="startPlayback"
          >
            {{ $t('重新播放') }}
          </van-button>
        </div>
      </div>

      <label v-if="streams.length > 1" class="stream-picker">{{ $t('视频流') }}
        <select v-model="selectedStream" @change="startPlayback"><option v-for="stream in streams" :key="stream.id" :value="stream.id">{{ stream.channelId || stream.streamName || stream.id }}</option></select>
      </label>

      <div class="tab-header">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'info' }"
          @click="activeTab = 'info'"
        >
          {{ $t('设备信息') }}
          <div v-if="activeTab === 'info'" class="tab-underline" />
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'ptz' }"
          @click="activeTab = 'ptz'"
        >
          PTZ
          <div v-if="activeTab === 'ptz'" class="tab-underline" />
        </div>
      </div>

      <ProtocolActions v-if="management && detail?.device" :key="device.id" :device="device" />
      <div class="tab-body">
        <CameraInfoPanel v-if="activeTab === 'info'" :device="device" :detail="detail" :streams="streams" @refresh="refreshDetail" />
        <PTZPanel v-else :camera="device" />
      </div>
    </div>

    <VideoApplyForm
      v-model:show="showApply"
      :device-info-id="camera.id"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import NavHeaderBanner from '@/components/navHeaderBanner/index.vue'
import VideoApplyForm from '@/pages/VLStreamCloud/page/components/videoPlaza/VideoApplyForm.vue'
import CameraInfoPanel from '@/pages/VLStreamCloud/page/components/deviceManagement/CameraInfoPanel.vue'
import ProtocolActions from '../deviceManagement/ProtocolActions.vue'
import PTZPanel from '@/pages/VLStreamCloud/page/components/deviceManagement/PTZPanel.vue'
import {
  createWvpVlsDevicePreview,
  getWvpVlsDeviceDetail,
  getWvpVlsDeviceStreams
} from '@/api/VLStreamCloud/wvp'
import { addZlmLanCandidate, resolveZlmPlaybackUrl } from '@/utils/zlmPlaybackUrl'
import { CameraRtcPlayer, parseCameraRtcTarget } from '@/utils/cameraRtc'

const props = defineProps({
  // WVP 设备行（列表里的记录，id 是行 id）
  management: Boolean,
  camera: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n()

const activeTab = ref('info')
const showApply = ref(false)
const detail = ref(null)
const streams = ref([])
const selectedStream = ref(null)
async function refreshDetail() {
  const id = props.camera.id
  try {
    const result = await getWvpVlsDeviceDetail(id)
    if (props.camera.id === id && result?.code === 200) detail.value = result.data
  } catch (error) {
    showToast(error.message || t('设备加载失败'))
  }
}
const playbackState = ref('loading')
const playbackMessage = ref('')
const videoRef = ref(null)

const device = computed(() => detail.value?.device || props.camera || {})
const playingTip = computed(() => playbackMessage.value)

let player = null
let generation = 0

const onBack = () => {
  emit('close')
}

const stopPlayer = () => {
  generation += 1
  if (!player) return
  try {
    player.stop()
  } catch (e) {
    // 播放器已销毁
  }
  player = null
}

const failPlayback = (message) => {
  playbackState.value = 'error'
  playbackMessage.value = message
}

// 详情校验在线 → 取默认流 → 创建预览 → CameraRTC 信令播放，与管理平台同一链路
const startPlayback = async() => {
  stopPlayer()
  const current = ++generation
  detail.value = null
  streams.value = []
  playbackState.value = 'loading'
  playbackMessage.value = t('正在加载视频…')
  const row = props.camera || {}
  if (!row.id) {
    failPlayback(t('缺少摄像头信息'))
    return
  }
  try {
    const detailRes = await getWvpVlsDeviceDetail(row.id)
    if (current !== generation) return
    if (detailRes?.code !== 200) throw new Error(detailRes?.msg || t('设备加载失败'))
    detail.value = detailRes.data
    const streamsRes = await getWvpVlsDeviceStreams(row.id)
    if (current !== generation) return
    if (streamsRes?.code !== 200) throw new Error(streamsRes?.msg || t('视频源加载失败'))
    const list = Array.isArray(streamsRes?.data) ? streamsRes.data : []
    streams.value = list
    if (detail.value?.device?.online !== true) {
      playbackState.value = 'offline'
      playbackMessage.value = t('设备离线，无法播放')
      return
    }
    const stream = list.find(item => item.id === selectedStream.value) || list.find(item => item.defaultStream) || list[0]
    selectedStream.value = stream?.id
    if (!stream) {
      failPlayback(t('设备没有上报可用视频流'))
      return
    }
    const previewRes = await createWvpVlsDevicePreview(row.id, stream.id)
    if (current !== generation) return
    const preview = previewRes?.data || {}
    const target = preview.playMode === 'cameraRTC' && preview.url ? parseCameraRtcTarget(preview.url) : null
    await nextTick()
    if (current !== generation || !videoRef.value) return
    if (!target) {
      const address = (location.protocol === 'https:' ? preview.rtcs : preview.rtc) || preview.webrtcUrl
      if (!address) throw new Error(t('WVP 未返回可用播放地址'))
      await playZlm(address, current)
      return
    }
    player = new CameraRtcPlayer({
      videoElement: videoRef.value,
      deviceId: target.cameraId,
      socketUrl: target.socketUrl,
      onStatus: (status) => {
        if (current !== generation) return
        if (status.state === 'playing') {
          playbackState.value = 'playing'
          playbackMessage.value = ''
          return
        }
        if (status.state === 'failed') {
          failPlayback(status.message || t('播放失败'))
          return
        }
        playbackState.value = 'loading'
        playbackMessage.value = status.message
      }
    })
    player.start()
  } catch (e) {
    if (current !== generation) return
    failPlayback(e?.response?.data?.msg || e?.message || t('创建预览失败'))
  }
}

async function playZlm(address, current) {
  const pc = new RTCPeerConnection()
  const controller = new AbortController()
  const element = videoRef.value
  player = { stop() { controller.abort(); pc.close(); element.srcObject = null } }
  pc.ontrack = event => {
    if (current !== generation) return
    element.srcObject = event.streams[0] || new MediaStream([event.track])
    element.onplaying = () => {
      if (current === generation) { playbackState.value = 'playing'; playbackMessage.value = '' }
    }
  }
  pc.onconnectionstatechange = () => {
    if (current === generation && pc.connectionState === 'failed') failPlayback(t('播放失败'))
  }
  pc.addTransceiver('video', { direction: 'recvonly' })
  pc.addTransceiver('audio', { direction: 'recvonly' })
  const offer = await pc.createOffer()
  if (current !== generation) return
  await pc.setLocalDescription(offer)
  const endpoint = resolveZlmPlaybackUrl(address)
  const result = await fetch(endpoint, { method: 'POST', body: offer.sdp, credentials: 'omit',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: controller.signal })
  const answer = await result.json()
  if (current !== generation) return
  if (!result.ok || answer.code !== 0 || !answer.sdp) throw new Error(t('媒体协商失败'))
  await pc.setRemoteDescription({ type: 'answer', sdp: addZlmLanCandidate(answer.sdp, undefined, endpoint) })
}

watch(
  () => props.camera?.id,
  () => {
    selectedStream.value = null
    if (props.camera?.id) startPlayback()
  },
  { immediate: true }
)

onBeforeUnmount(stopPlayer)
</script>

<style scoped lang="scss">
.stream-picker { display:flex; align-items:center; justify-content:space-between; padding:0 16px; }
.stream-picker select { min-height:44px; max-width:70%; }
.camera-detail {
  height: 100vh;
  background: var(--vl-bg);
  display: flex;
  flex-direction: column;
}

.header-action {
  font-size: 14px;
  color: #fff;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.player-wrap {
  position: relative;
  width: 100%;
  height: 210px;
  background: #000;
}

.player-video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.player-tip {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 24px;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
}

.retry-btn {
  height: 32px;
  margin-top: 4px;
  padding: 0 16px;
  font-size: 13px;
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  border-color: transparent;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.tab-header {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 0 16px;
  background: #fff;
}

.tab-item {
  position: relative;
  color: #333333;
  font-size: 14px;
  padding-bottom: 6px;

  &.active {
    color: var(--vl-accent);
    font-weight: 500;
  }
}

.tab-underline {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 32px;
  height: 3px;
  border-radius: 999px;
  background: var(--vl-primary);
}

.tab-body {
  padding: 12px 12px 24px;
}
</style>
