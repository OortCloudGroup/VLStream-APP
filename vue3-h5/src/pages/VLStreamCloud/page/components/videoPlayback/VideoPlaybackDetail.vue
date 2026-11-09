<template>
  <div class="playback-detail">
    <nav-header-banner :title="$t('查看回放')" :is-call-back="true" @call-back="onBack" />

    <div class="detail-body">
      <!-- 日期选择 -->
      <div class="date-row">
        <div class="date-item" @click="onPick('year')">
          {{ $t('{year}年', { year: currentYear }) }}
          <van-icon name="arrow-down" />
        </div>
        <div class="date-item" @click="onPick('month')">
          {{ $t('{month}月', { month: currentMonth }) }}
          <van-icon name="arrow-down" />
        </div>
        <div class="date-item" @click="onPick('day')">
          {{ $t('{day}日', { day: currentDay }) }}
          <van-icon name="arrow-down" />
        </div>
      </div>

      <!-- 底部弹出日期选择 -->
      <van-popup v-model:show="showDatePicker" round position="bottom" teleport="body">
        <van-date-picker
          v-model="pickerValues"
          :columns-type="pickerColumnsType"
          :max-date="maxDate"
          @confirm="onDateConfirm"
          @cancel="showDatePicker = false"
        />
      </van-popup>

      <!-- 顶部播放区域 -->
      <div class="player-wrap">
        <video
          v-if="videoSrc"
          ref="videoPlayer"
          :src="videoSrc"
          class="player-video"
          controls
          @loadedmetadata="onVideoLoaded"
          @error="onVideoError"
        />
        <!-- 当日无录像：不出现播放按钮，避免误以为可以播放 -->
        <div v-else-if="playerState === 'empty'" class="player-status">
          <van-icon name="video-o" class="player-status-icon" />
          <div class="player-status-title">
            {{ $t('当日暂无录像') }}
          </div>
          <div class="player-status-desc">
            {{ $t('可切换日期查看其他录像') }}
          </div>
        </div>
        <!-- 有录像但取流失败：明确提示并允许重试 -->
        <div v-else-if="playerState === 'error'" class="player-status" @click="retryActiveClip">
          <van-icon name="warning-o" class="player-status-icon" />
          <div class="player-status-title">
            {{ $t('录像加载失败') }}
          </div>
          <div class="player-status-desc">
            {{ $t('点击重试') }}
          </div>
        </div>
        <div v-else class="player-placeholder">
          <img v-if="heroImg" :src="heroImg" alt="" class="player-img" />
        </div>
        <div v-if="clipLoading" class="player-loading">
          <van-loading size="24px" vertical>
            {{ $t('正在加载视频…') }}
          </van-loading>
        </div>
      </div>

      <!-- 视频列表 -->
      <div class="list-title">
        {{ $t('视频列表') }}
      </div>
      <div v-if="clips.length" class="clip-list">
        <div
          v-for="clip in clips"
          :key="clip.id"
          class="clip-item"
          :class="{ active: activeClipId === clip.id }"
          @click="playClip(clip)"
        >
          <div class="thumb-wrap">
            <img v-if="clip.thumb" :src="clip.thumb" class="thumb-img" alt="" />
            <div class="thumb-play">
              <img :src="playImg" alt="" class="thumb-play-icon" />
            </div>
            <div class="thumb-duration">
              {{ clip.duration }}
            </div>
          </div>

          <div class="clip-info">
            <div class="clip-time">
              {{ clip.start }}{{ clip.end ? ' - ' + clip.end : '' }}
            </div>
            <div class="clip-device-name">
              {{ clip.deviceName }}
            </div>
            <div
              v-if="activeClipId === clip.id"
              class="playing-tag"
            >
              <img src="@/assets/img/VLStreamCloud/bfz.png" alt="" class="playing-tag-icon" />
              <span>{{ $t('播放中') }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 空态 -->
      <div v-else class="empty-clips">
        {{ $t('暂无录像') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, nextTick, ref, watch } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/useraPaas'
import type { DatePickerColumnType } from 'vant'
import NavHeaderBanner from '@/components/navHeaderBanner/index.vue'
import playImg from '@/assets/img/VLStreamCloud/play.png'
import { getPlayback, getPlaybackStream, resolveVlsDeviceIds } from '@/api/VLStreamCloud/videoPlayback'
import { getEventListByDevice, getEventMediaViewUrl, getEventMediaDownloadUrl } from '@/api/VLStreamCloud/eventManagement'

const props = defineProps<{
  device: any
}>()

const emit = defineEmits(['close'])
const store = useUserStore()
const { t } = useI18n()
const onBack = () => {
  // 弹层关闭后组件仍挂载，先暂停，避免录像在后台继续播放出声
  videoPlayer.value?.pause()
  emit('close')
}

// 默认当天；只能选到今天，未来日期不可能有录像
const today = new Date()
const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth() + 1)
const currentDay = ref(today.getDate())

const activeClipId = ref<number | string>('')
const videoSrc = ref<string>('')
const videoPlayer = ref<HTMLVideoElement | null>(null)
const clipLoading = ref(false)
// 首次查询完成前不展示空态，避免进入页面时闪一下「暂无录像」
const fetched = ref(false)
// 当前片段取流失败（接口报错、空文件、视频解码失败）
const playError = ref(false)
// 每次切换片段/日期自增，丢弃过期的异步结果，避免旧片段覆盖新片段
let playSeq = 0

// 底部日期选择器
const showDatePicker = ref(false)
const pickerValues = ref<string[]>([])

const pad2 = (value: number | string) => String(value).padStart(2, '0')

const pickerColumnsType = computed<DatePickerColumnType[]>(() => ['year', 'month', 'day'])

type ClipItem = {
  id: number | string
  kind: 'videoRecord' | 'event'
  thumb: string
  deviceName: string
  start: string
  end: string
  duration: string
  mediaId?: string
  raw?: any
}

const clips = ref<ClipItem[]>([])

// 播放区状态：empty 当日无录像 / error 取流失败 / idle 其余（加载中或待播放）
const playerState = computed<'empty' | 'error' | 'idle'>(() => {
  if (videoSrc.value || clipLoading.value) return 'idle'
  if (fetched.value && !clips.value.length) return 'empty'
  if (playError.value) return 'error'
  return 'idle'
})

const extractTime = (dateTimeStr?: any) => {
  const s = String(dateTimeStr || '')
  const m = s.match(/(\d{2}:\d{2}:\d{2})/)
  return m?.[1] || '--'
}

const formatDuration = (seconds: any) => {
  const s = Number(seconds)
  if (!Number.isFinite(s) || s <= 0) return '--'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`
  return `${pad2(m)}:${pad2(sec)}`
}

const buildRangeParams = () => {
  const dateStr = `${currentYear.value}-${pad2(currentMonth.value)}-${pad2(currentDay.value)}`
  return {
    dateStr,
    startTime: `${dateStr} 00:00:00`,
    endTime: `${dateStr} 23:59:59`
  }
}

// 云端录像（/vlsVideoRecord/playback 按 vls_device_info.id 查询，由序列号换取）
const mapRecordClip = (r: any, idx: number, fallbackName: string): ClipItem => ({
  id: r.id ?? `r${idx}`,
  kind: 'videoRecord',
  thumb: r.thumbnailPath || '',
  deviceName: r.deviceName || fallbackName,
  start: extractTime(r.recordStartTime),
  end: extractTime(r.recordEndTime),
  duration: formatDuration(r.duration),
  raw: r
})

// 事件录像（设备 AI 事件触发后上传的 MP4，mediaId 经 /vlsDeviceMedia 换取播放地址）
const mapEventClip = (e: any, idx: number, fallbackName: string): ClipItem => ({
  id: `e-${e.id ?? idx}`,
  kind: 'event',
  thumb: e.reportImg && /^https?:/.test(String(e.reportImg)) ? e.reportImg : '',
  deviceName: e.eventType || e.eventDesc || fallbackName,
  start: extractTime(e.reportTime),
  end: '',
  duration: t('事件'),
  mediaId: e.mediaId ? String(e.mediaId) : '',
  raw: e
})

const fetchPlayback = async() => {
  const device = props.device || {}
  // device 为 WVP 设备行：id 是 WVP 行 id（与录像表无关），deviceId 是设备序列号
  const serial = String(device.deviceId ?? '').trim()
  const fallbackName = String(device.deviceName ?? '')
  // 切换日期/设备时先清掉上一次的播放内容，避免旧录像残留在播放区
  playSeq++
  setVideoSrc('')
  playError.value = false
  if (!serial) {
    clips.value = []
    activeClipId.value = ''
    fetched.value = true
    return
  }
  const { dateStr, startTime, endTime } = buildRangeParams()
  clipLoading.value = true
  let firstClip: ClipItem | null = null
  try {
    // 录像表 device_id 为 vls_device_info.id，需先按序列号换取
    const [vlsId] = await resolveVlsDeviceIds([serial])
    const [recordRes, eventRes]: any[] = await Promise.all([
      vlsId
        ? getPlayback({ accessToken: store.userInfo?.accessToken, deviceId: vlsId, startTime, endTime })
        : Promise.resolve(null),
      serial
        ? getEventListByDevice(serial, { current: 1, size: 100 })
        : Promise.resolve(null)
    ])

    const list: ClipItem[] = []
    if (recordRes && recordRes.code === 200 && Array.isArray(recordRes.data)) {
      recordRes.data.forEach((r: any, idx: number) => {
        list.push(mapRecordClip(r, idx, fallbackName))
      })
    }
    const evtRecords = eventRes && eventRes.code === 200 && eventRes.data && Array.isArray(eventRes.data.records)
      ? eventRes.data.records
      : []
    evtRecords.forEach((e: any, idx: number) => {
      // /list 按设备过滤但不按日期，前端按所选日期（reportTime 前缀）过滤
      if (!e.reportTime || !String(e.reportTime).startsWith(dateStr)) return
      list.push(mapEventClip(e, idx, fallbackName))
    })

    // 按开始时间倒序，最新的排在最前
    list.sort((a, b) => String(b.start).localeCompare(String(a.start)))
    clips.value = list
    activeClipId.value = list.length ? list[0].id : ''
    firstClip = list[0] || null
  } catch (e) {
    clips.value = []
    activeClipId.value = ''
  } finally {
    clipLoading.value = false
    fetched.value = true
  }
  // 列表加载完成后再自动播放第一个，playClip 自己管理加载态
  if (firstClip) playClip(firstClip)
}

const heroImg = computed(() => {
  const active = clips.value.find(c => c.id === activeClipId.value)
  return active?.thumb || ''
})

// 服务端异常时可能返回 JSON 错误体（responseType blob 下仍是 Blob），需识别避免当成视频播放
const readBlobError = async(blob: Blob) => {
  try {
    const text = await blob.text()
    const err = JSON.parse(text)
    if (err?.msg) showToast(err.msg)
  } catch (e) {
    // 非 JSON 内容，忽略
  }
}

const setVideoSrc = (src: string) => {
  if (videoSrc.value && videoSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(videoSrc.value)
  }
  videoSrc.value = src
}

// 事件录像：mediaId 换取短期私有地址，view-url 失败时回退 download-url
const playEventClip = async(clip: ClipItem) => {
  const mediaId = clip.mediaId || String(clip.raw?.mediaId || '')
  if (!mediaId) {
    playError.value = true
    return
  }
  const seq = playSeq
  clipLoading.value = true
  try {
    let url = ''
    const viewRes: any = await getEventMediaViewUrl(mediaId)
    if (viewRes && viewRes.code === 200 && viewRes.data) {
      url = String(viewRes.data)
    } else {
      const dlRes: any = await getEventMediaDownloadUrl(mediaId)
      if (dlRes && dlRes.code === 200 && dlRes.data) {
        url = String(dlRes.data)
      } else if (viewRes && viewRes.msg) {
        showToast(viewRes.msg)
      }
    }
    if (seq !== playSeq) return
    if (url) {
      setVideoSrc(url)
      // video 由 v-if 渲染，等 DOM 更新后再触发加载，避免空引用
      await nextTick()
      if (videoPlayer.value) {
        videoPlayer.value.load()
      }
    } else {
      setVideoSrc('')
      playError.value = true
    }
  } catch (error) {
    if (seq !== playSeq) return
    setVideoSrc('')
    playError.value = true
  } finally {
    if (seq === playSeq) clipLoading.value = false
  }
}

const playClip = async(clip: ClipItem) => {
  playSeq++
  activeClipId.value = clip.id
  playError.value = false
  setVideoSrc('')
  if (!clip.id) {
    playError.value = true
    return
  }

  if (clip.kind === 'event') {
    await playEventClip(clip)
    return
  }

  const seq = playSeq
  clipLoading.value = true
  try {
    // 调用接口获取视频流
    const params = { accessToken: store.userInfo?.accessToken }
    const res: any = await getPlaybackStream(clip.id, params)
    if (seq !== playSeq) return
    if (res && res instanceof Blob) {
      if (res.type && res.type.includes('json')) {
        await readBlobError(res)
        playError.value = true
      } else if (res.size > 0) {
        setVideoSrc(URL.createObjectURL(res))

        // video 由 v-if 渲染，等 DOM 更新后再触发加载，避免空引用
        await nextTick()
        if (videoPlayer.value) {
          videoPlayer.value.load()
        }
      } else {
        playError.value = true
      }
    } else {
      playError.value = true
    }
  } catch (error) {
    if (seq !== playSeq) return
    playError.value = true
  } finally {
    if (seq === playSeq) clipLoading.value = false
  }
}

// 文件能下载但浏览器无法解码（格式不支持/文件损坏）同样视为加载失败
const onVideoError = () => {
  setVideoSrc('')
  playError.value = true
}

const retryActiveClip = () => {
  const clip = clips.value.find(c => c.id === activeClipId.value)
  if (clip) playClip(clip)
}

const onVideoLoaded = () => {
  if (videoPlayer.value) {
    videoPlayer.value.play().catch(() => {
      // 自动播放失败，用户需要手动点击播放
    })
  }
}

const onPick = (_type: 'year' | 'month' | 'day') => {
  pickerValues.value = [
    String(currentYear.value),
    pad2(currentMonth.value),
    pad2(currentDay.value)
  ]
  showDatePicker.value = true
}

const onDateConfirm = ({ selectedValues }: any) => {
  if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
    showDatePicker.value = false
    return
  }
  currentYear.value = Number(selectedValues[0])
  currentMonth.value = Number(selectedValues[1])
  currentDay.value = Number(selectedValues[2])
  showDatePicker.value = false
  fetchPlayback()
}

onMounted(() => {
  fetchPlayback()
})

watch(
  () => props.device,
  () => {
    fetchPlayback()
  }
)

onBeforeUnmount(() => {
  // 清理 Blob URL，避免内存泄漏
  if (videoSrc.value && videoSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(videoSrc.value)
  }
})
</script>

<style scoped lang="scss">
.playback-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.date-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 10px 16px 8px;
  color:#333333;
  font-size:14px;
}

.date-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
  object-fit: contain;
}

.player-loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
}

.player-status {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.85);
}

.player-status-icon {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.45);
}

.player-status-title {
  font-size: 14px;
  line-height: 20px;
}

.player-status-desc {
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.5);
}

.player-placeholder {
  position: relative;
  width: 100%;
  height: 100%;
}

.player-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.list-title {
  line-height: 24px;
  font-weight: 500;
  color: #969799;
  font-size: 12px;
  padding: 20px 16px 10px;
}

.clip-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-clips {
  padding: 40px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.clip-item {
  display: flex;
  gap: 12px;
}

.thumb-wrap {
  position: relative;
  width: 120px;
  height: 88px;
  border: 2px solid rgba(28, 28, 30, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-play {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-play-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.thumb-duration {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 1px 3px;
  border-radius:4px;
  font-size:8px;
  background:rgba(0, 0, 0, 0.3);
  color: #fff;
}

.clip-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.clip-time {
  line-height: 18px;
  font-weight: 500;
  color: #333333;
  font-size: 14px;
}

.clip-device-name {
  line-height: 22px;
  color:#7a7c85;
  font-size:14px;
}
.playing-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width:64px;
  height:22px;
  background: rgba(28, 28, 30, 0.12);
  border-radius: 4px;
  line-height: 16px;
  font-weight: 500;
  color: #1c1c1e;
  font-size: 12px;
  padding: 5px 6px;
  box-sizing: border-box;
  .playing-tag-icon{
    width: 12px;
    height: 12px;
  }
}
</style>

