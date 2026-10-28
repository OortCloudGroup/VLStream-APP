<!--
* @Created by: Qoder
* @Date: 2026-10-28
* @Copyright aPaaS-front-team. All rights reserved.
-->
<template>
  <div class="camera-detail">
    <nav-header-banner title="摄像头详情" :is-call-back="true" @call-back="onBack">
      <span class="header-action" @click="showApply = true">申请使用</span>
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
            重新播放
          </van-button>
        </div>
      </div>

      <div class="tab-header">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'info' }"
          @click="activeTab = 'info'"
        >
          设备信息
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

      <div class="tab-body">
        <CameraInfoPanel v-if="activeTab === 'info'" :device="device" :detail="detail" :streams="streams" />
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
import NavHeaderBanner from '@/components/navHeaderBanner/index.vue'
import VideoApplyForm from '@/pages/VLStreamCloud/page/components/videoPlaza/VideoApplyForm.vue'
import CameraInfoPanel from '@/pages/VLStreamCloud/page/components/deviceManagement/CameraInfoPanel.vue'
import PTZPanel from '@/pages/VLStreamCloud/page/components/deviceManagement/PTZPanel.vue'
import {
  createWvpVlsDevicePreview,
  getWvpVlsDeviceDetail,
  getWvpVlsDeviceStreams
} from '@/api/VLStreamCloud/wvp'
import { CameraRtcPlayer, parseCameraRtcTarget } from '@/utils/cameraRtc'

const props = defineProps({
  // WVP 设备行（列表里的记录，id 是行 id）
  camera: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const activeTab = ref('info')
const showApply = ref(false)
const detail = ref(null)
const streams = ref([])
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
  playbackMessage.value = '正在加载视频…'
  const row = props.camera || {}
  if (!row.id) {
    failPlayback('缺少摄像头信息')
    return
  }
  try {
    const detailRes = await getWvpVlsDeviceDetail(row.id)
    if (current !== generation) return
    detail.value = detailRes?.data || null
    if (detail.value?.device?.online !== true) {
      playbackState.value = 'offline'
      playbackMessage.value = '设备离线，无法播放'
      return
    }
    const streamsRes = await getWvpVlsDeviceStreams(row.id)
    if (current !== generation) return
    const list = Array.isArray(streamsRes?.data) ? streamsRes.data : []
    streams.value = list
    const stream = list.find(item => item.defaultStream) || list[0]
    if (!stream) {
      failPlayback('设备没有上报可用视频流')
      return
    }
    const previewRes = await createWvpVlsDevicePreview(row.id, stream.id)
    if (current !== generation) return
    const preview = previewRes?.data || {}
    const target = preview.playMode === 'cameraRTC' && preview.url ? parseCameraRtcTarget(preview.url) : null
    if (!target) {
      failPlayback('WVP 未返回可用播放地址')
      return
    }
    await nextTick()
    if (current !== generation || !videoRef.value) return
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
          failPlayback(status.message || '播放失败')
          return
        }
        playbackState.value = 'loading'
        playbackMessage.value = status.message
      }
    })
    player.start()
  } catch (e) {
    if (current !== generation) return
    failPlayback(e?.response?.data?.msg || e?.message || '创建预览失败')
  }
}

watch(
  () => props.camera?.id,
  () => {
    if (props.camera?.id) startPlayback()
  },
  { immediate: true }
)

onBeforeUnmount(stopPlayer)
</script>

<style scoped lang="scss">
.camera-detail {
  height: 100vh;
  background: #f6f8ff;
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
  color: #fff;
  border-color: rgba(255, 255, 255, 0.6);
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
    color: #2f69f8;
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
  background: #1c6cff;
}

.tab-body {
  padding: 12px 12px 24px;
}
</style>
