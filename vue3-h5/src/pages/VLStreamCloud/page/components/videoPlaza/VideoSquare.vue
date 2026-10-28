<template>
  <div ref="squareRef" class="video-square">
    <!-- 预览区域：铺满整个内容区，设备列表以抽屉形式浮在视频上方 -->
    <div
      ref="previewGridRef"
      class="preview-grid"
      :class="[`cols-${previewCols}`, `layout-${activeLayout}`, { 'fullscreen-mode': isFullscreen }]"
    >
      <div
        v-for="slot in previewSlots"
        :key="slot.id"
        class="preview-cell"
      >
        <!-- 有设备：播放 WVP 预览流 -->
        <div v-if="slot.device" class="preview-video-wrapper">
          <video
            :id="`vs-webrtc-${slot.device.id}`"
            class="preview-video"
            autoplay
            muted
            playsinline
            controls
          />
          <!-- 自定义全屏 -->
          <div class="cell-fullscreen-btn" @click.stop="enterCellFullscreen(slot.device.id)">
            <van-icon name="expand-o" />
          </div>
          <div v-if="previewStates[slot.device.id]" class="cell-status">
            {{ previewStates[slot.device.id] }}
          </div>
        </div>
        <!-- 无设备：占位 -->
        <div v-else class="preview-empty">
          {{ $t('无信号') }}
        </div>
      </div>
    </div>

    <!-- 布局切换（浮在视频上方） -->
    <div class="layout-row">
      <div class="layout-buttons">
        <div
          v-for="mode in layoutModes"
          :key="mode.value"
          class="layout-icon"
          @click="changeLayout(mode.value)"
        >
          <img :src="activeLayout === mode.value ? mode.activeImg : mode.img" alt="" class="layout-img" />
        </div>
      </div>

      <van-popover v-model:show="showModeMenu" trigger="click" placement="bottom-end">
        <template #reference>
          <img :src="moreImg" alt="" class="more-icon" />
        </template>
        <div class="mode-menu">
          <div
            v-for="item in modeMenu"
            :key="item.value"
            class="mode-menu-item"
            @click="onSelectMenu(item.value)"
          >
            <img :src="item.img" alt="" class="mode-menu-icon" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </van-popover>
    </div>

    <!-- 设备列表抽屉：往上拉覆盖视频全屏显示列表，往下拉隐藏列表 -->
    <div
      class="device-drawer"
      :class="{ dragging: drawerDragging }"
      :style="{ height: `${drawerHeight}px` }"
    >
      <div
        class="drawer-handle"
        @touchstart="onHandleTouchStart"
        @touchmove="onHandleTouchMove"
        @touchend="onHandleTouchEnd"
        @mousedown="onHandleMouseDown"
      >
        <div class="drawer-thumb" />
        <div class="drawer-title">
          {{ $t('设备列表') }}
        </div>
      </div>

      <div class="drawer-list">
        <div
          v-for="item in devices"
          :key="item.id"
          class="device-card"
          @click="openDetail(item)"
        >
          <div class="card-header">
            <div class="name">
              {{ item.deviceName }}
            </div>
            <span v-if="item.privacy" class="privacy-tag">
              {{ item.privacy }}
            </span>
          </div>

          <div class="info-row" style="width: 90%">
            <img src="@/assets/img/VLStreamCloud/spgc/sbId.png" alt="" />
            <div class="label">
              {{ $t('设备ID') }}
            </div>
            <div class="value">
              {{ item.deviceId }}
            </div>
          </div>
          <div class="info-row">
            <img src="@/assets/img/VLStreamCloud/spgc/sbwz.png" alt="" />
            <div class="label">
              {{ $t('设备位置') }}
            </div>
            <div class="value">
              {{ item.address }}
            </div>
          </div>

          <div class="card-footer">
            <div class="chips">
              <div class="chip" :class="{ offline: item.status != '1' }">
                {{ item.status == '1' ? $t('在线') : $t('离线') }}
              </div>
              <div v-if="item.deviceType" class="chip">
                {{ item.deviceType }}
              </div>
              <div v-if="item.heightPosition" class="chip">
                {{ item.heightPosition }}
              </div>
            </div>
          </div>
          <div class="play-btn">
            <img v-if="item.status == '1'" src="@/assets/img/VLStreamCloud/spgc/playing.png" alt="" />
            <img v-else src="@/assets/img/VLStreamCloud/spgc/no_playing.png" alt="" />
          </div>
        </div>
      </div>
    </div>

    <oort-popup v-model="showDetail" position="right" style="width: 100%;height: 100%;" teleport="body">
      <CameraDetail
        v-if="showDetail && currentDevice"
        :camera="currentDevice"
        @close="showDetail = false"
      />
    </oort-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getWvpVlsDeviceList, getWvpVlsDeviceDetail, getWvpVlsDeviceStreams, createWvpVlsDevicePreview } from '@/api/VLStreamCloud/wvp'
import { CameraRtcPlayer, parseCameraRtcTarget } from '@/utils/cameraRtc'
import { setImmersive } from '@/utils/shellStatusBar'
import OortPopup from '@/components/popup/oort_popup.vue'
import CameraDetail from '@/pages/VLStreamCloud/page/components/cameraDetail/CameraDetail.vue'
import p1 from '@/assets/img/VLStreamCloud/spgc/p1.png'
import p4 from '@/assets/img/VLStreamCloud/spgc/p4.png'
import p6 from '@/assets/img/VLStreamCloud/spgc/p6.png'
import p8 from '@/assets/img/VLStreamCloud/spgc/p8.png'
import p9 from '@/assets/img/VLStreamCloud/spgc/p9.png'
import p16 from '@/assets/img/VLStreamCloud/spgc/p16.png'
import p1_c from '@/assets/img/VLStreamCloud/spgc/p1_c.png'
import p4_c from '@/assets/img/VLStreamCloud/spgc/p4_c.png'
import p6_c from '@/assets/img/VLStreamCloud/spgc/p6_c.png'
import p8_c from '@/assets/img/VLStreamCloud/spgc/p8_c.png'
import p9_c from '@/assets/img/VLStreamCloud/spgc/p9_c.png'
import p16_c from '@/assets/img/VLStreamCloud/spgc/p16_c.png'
import moreImg from '@/assets/img/VLStreamCloud/spgc/more.png'
import qp from '@/assets/img/VLStreamCloud/spgc/qp.png'

const props = defineProps<{
  keyword?: string
}>()

const { t } = useI18n()

// ========= 设备列表抽屉（浮在满屏视频上方） =========
const squareRef = ref<HTMLElement | null>(null)
const containerHeight = ref(0)
// 收起时仅露出把手一行；展开时抽屉高度等于容器高度（列表覆盖视频全屏显示）
const COLLAPSED_HEIGHT = 64
const drawerHeight = ref(COLLAPSED_HEIGHT)
const drawerDragging = ref(false)
let dragStartY = 0
let dragStartHeight = COLLAPSED_HEIGHT
let dragMoved = false

const isDrawerExpanded = () => containerHeight.value > 0 && drawerHeight.value >= containerHeight.value - 4

const clampHeight = (height: number) => {
  if (containerHeight.value <= 0) return height
  return Math.min(Math.max(height, COLLAPSED_HEIGHT), containerHeight.value)
}

const toggleDrawer = () => {
  drawerHeight.value = isDrawerExpanded() ? COLLAPSED_HEIGHT : containerHeight.value
}

// 拖拽结束后的落点：上拉超过阈值展开到全屏列表，下拉超过阈值收起只留把手，小幅位移就近吸附
const snapDrawer = (deltaY: number) => {
  const full = containerHeight.value
  if (deltaY <= -40) {
    drawerHeight.value = full
  } else if (deltaY >= 40) {
    drawerHeight.value = COLLAPSED_HEIGHT
  } else {
    const mid = (full + COLLAPSED_HEIGHT) / 2
    drawerHeight.value = drawerHeight.value > mid ? full : COLLAPSED_HEIGHT
  }
}

const onHandleTouchStart = (e: TouchEvent) => {
  drawerDragging.value = true
  dragMoved = false
  dragStartY = e.touches[0].clientY
  dragStartHeight = drawerHeight.value
}

const onHandleTouchMove = (e: TouchEvent) => {
  if (!drawerDragging.value) return
  const deltaY = e.touches[0].clientY - dragStartY
  if (Math.abs(deltaY) > 6) dragMoved = true
  drawerHeight.value = clampHeight(dragStartHeight - deltaY)
}

const onHandleTouchEnd = (e: TouchEvent) => {
  if (!drawerDragging.value) return
  drawerDragging.value = false
  const deltaY = e.changedTouches[0].clientY - dragStartY
  if (!dragMoved) {
    toggleDrawer()
    return
  }
  snapDrawer(deltaY)
}

// PC 端鼠标拖拽（配合 window 级 mousemove/mouseup）
const onHandleMouseDown = (e: MouseEvent) => {
  drawerDragging.value = true
  dragMoved = false
  dragStartY = e.clientY
  dragStartHeight = drawerHeight.value
}

const onWindowMouseMove = (e: MouseEvent) => {
  if (!drawerDragging.value) return
  const deltaY = e.clientY - dragStartY
  if (Math.abs(deltaY) > 6) dragMoved = true
  drawerHeight.value = clampHeight(dragStartHeight - deltaY)
}

const onWindowMouseUp = (e: MouseEvent) => {
  if (!drawerDragging.value) return
  drawerDragging.value = false
  const deltaY = e.clientY - dragStartY
  if (!dragMoved) {
    toggleDrawer()
    return
  }
  snapDrawer(deltaY)
}

const measureContainer = async() => {
  await nextTick()
  if (!squareRef.value) return
  containerHeight.value = squareRef.value.clientHeight
  if (isDrawerExpanded()) drawerHeight.value = containerHeight.value
}

const layoutModes = [
  { value: 'p1', img: p1, activeImg: p1_c },
  { value: 'p4', img: p4, activeImg: p4_c },
  { value: 'p6', img: p6, activeImg: p6_c },
  { value: 'p8', img: p8, activeImg: p8_c },
  { value: 'p9', img: p9, activeImg: p9_c },
  { value: 'p16', img: p16, activeImg: p16_c }
]

const activeLayout = ref('p4')

const showModeMenu = ref(false)

const modeMenu = computed(() => [
  { value: 'full', label: t('全屏'), img: qp }
])

const previewGridRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

// CSS 兜底全屏（ArkWeb 不支持 Fullscreen API 时）也要联动原生沉浸式隐藏状态栏
watch(isFullscreen, value => {
  setImmersive(value)
})

// 全屏相关函数
const enterFullscreen = async() => {
  const element = previewGridRef.value
  if (!element) return

  try {
    if (element.requestFullscreen) {
      await element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      // Safari
      await (element as any).webkitRequestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
      // Firefox
      await (element as any).mozRequestFullScreen()
    } else if ((element as any).msRequestFullscreen) {
      // IE/Edge
      await (element as any).msRequestFullscreen()
    }
    isFullscreen.value = true
  } catch (error) {
    // 全屏失败时忽略错误
  }
}

const exitFullscreen = async() => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      await (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      await (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      await (document as any).msExitFullscreen()
    }
    isFullscreen.value = false
  } catch (error) {
    // 退出全屏失败时忽略错误
  }
}

const toggleFullscreen = async() => {
  if (isFullscreen.value) {
    await exitFullscreen()
  } else {
    await enterFullscreen()
  }
}

// 单个分屏视频全屏（移动端优先走 video 的 webkitEnterFullscreen）
const enterCellFullscreen = async(deviceId: string | number) => {
  const el = document.getElementById(`vs-webrtc-${deviceId}`) as any
  if (!el) return
  try {
    // iOS Safari（最常用）
    if (typeof el.webkitEnterFullscreen === 'function') {
      el.webkitEnterFullscreen()
      return
    }
    // 标准 Fullscreen API
    if (typeof el.requestFullscreen === 'function') {
      await el.requestFullscreen()
      return
    }
    // 兼容旧 webkit
    if (typeof el.webkitRequestFullscreen === 'function') {
      await el.webkitRequestFullscreen()
    }
  } catch (e) {
    // 忽略全屏失败
  }
}

// 监听全屏状态变化
const handleFullscreenChange = () => {
  const isCurrentlyFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
  isFullscreen.value = isCurrentlyFullscreen
}

// 原生壳返回手势退出沉浸式全屏时（vl-exit-fullscreen 事件）同步退出 H5 侧全屏
const handleNativeExitFullscreen = () => {
  if (isFullscreen.value) {
    exitFullscreen()
  }
}

const onSelectMenu = async(value: string) => {
  showModeMenu.value = false

  if (value === 'full') {
    await toggleFullscreen()
  }
}

const layoutCountMap: Record<string, number> = {
  p1: 1,
  p4: 4,
  p6: 6,
  p8: 8,
  p9: 9,
  p16: 16
}

const layoutColsMap: Record<string, number> = {
  p1: 1,
  p4: 2,
  p6: 3,
  p8: 4,
  p9: 3,
  p16: 4
}

const changeLayout = async(value: string) => {
  activeLayout.value = value
  // 切换布局后，重新刷新当前布局的播放流
  await refreshAllPreviewStreams()
}

// 预览窗口槽位
const previewSlots = computed(() => {
  const count = layoutCountMap[activeLayout.value] || 4
  return Array.from({ length: count }, (_v, index) => ({
    id: index + 1,
    device: devices.value[index] || null
  }))
})

const previewCols = computed(() => layoutColsMap[activeLayout.value] || 2)

const allDevices = ref<any[]>([])

// 顶部搜索框的关键字在前缀匹配设备名称/设备ID上过滤，列表与分屏共用同一份结果
const devices = computed(() => {
  const kw = (props.keyword || '').trim().toLowerCase()
  if (!kw) return allDevices.value
  return allDevices.value.filter(item => String(item.deviceName || '').toLowerCase().includes(kw) || String(item.deviceId || '').toLowerCase().includes(kw))
})

watch(
  () => props.keyword,
  () => {
    refreshAllPreviewStreams()
  }
)

// ========= WVP 预览播放（移动端多分屏） =========
// 每个分屏一路 CameraRTC 会话：详情校验在线 → 取流列表 → 创建预览 → 信令播放
const previewPlayers: Record<string, CameraRtcPlayer> = {}
const previewStates = ref<Record<string, string>>({})

const stopPreviewForDevice = (rowId: string) => {
  const player = previewPlayers[rowId]
  if (!player) return
  try {
    player.stop()
  } catch (e) {
    // 忽略单个播放器销毁时的异常
  }
  delete previewPlayers[rowId]
  delete previewStates.value[rowId]
}

const stopAllPreviews = () => {
  Object.keys(previewPlayers).forEach(rowId => stopPreviewForDevice(rowId))
}

const startPreviewForDevice = async(device: any) => {
  const videoEl = document.getElementById(`vs-webrtc-${device.id}`) as HTMLVideoElement | null
  if (!videoEl) return

  stopPreviewForDevice(device.id)

  const setState = (message: string) => {
    previewStates.value = { ...previewStates.value, [device.id]: message }
  }

  try {
    const detail: any = await getWvpVlsDeviceDetail(device.id)
    if (detail?.data?.device?.online !== true) {
      setState(t('设备离线，不允许播放'))
      return
    }
    const streamsRes: any = await getWvpVlsDeviceStreams(device.id)
    const streams = Array.isArray(streamsRes?.data) ? streamsRes.data : []
    const stream = streams.find((item: any) => item.defaultStream) || streams[0]
    if (!stream) {
      setState(t('设备没有上报可用视频流'))
      return
    }
    const previewRes: any = await createWvpVlsDevicePreview(device.id, stream.id)
    const preview = previewRes?.data || {}
    const target = preview.playMode === 'cameraRTC' && preview.url ? parseCameraRtcTarget(preview.url) : null
    if (!target) {
      setState(t('WVP 未返回可用播放地址'))
      return
    }
    const player = new CameraRtcPlayer({
      videoElement: videoEl,
      deviceId: target.cameraId,
      socketUrl: target.socketUrl,
      onStatus: status => {
        setState(status.state === 'playing' ? '' : status.message)
      }
    })
    previewPlayers[device.id] = player
    player.start()
  } catch (e: any) {
    setState(e?.response?.data?.msg || e?.message || t('创建预览失败'))
  }
}

// 当设备列表或布局变化后，刷新当前分屏中的预览流
const refreshAllPreviewStreams = async() => {
  await nextTick()
  const slots = previewSlots.value
  // 先停止所有，再为当前槽位中有设备的重新启动
  stopAllPreviews()
  await Promise.all(
    slots
      .filter(slot => !!slot.device)
      .map(slot => startPreviewForDevice(slot.device))
  )
}

const fetchDevices = async() => {
  // 搜索在前端过滤，一次多取一些设备，避免关键字只能命中首屏 16 条
  const res: any = await getWvpVlsDeviceList({ pageNum: 1, pageSize: 50 })
  // wvp 分页是 RuoYi 格式，记录直接在顶层 rows 上
  if (res.code === 200 && Array.isArray(res.rows)) {
    allDevices.value = res.rows.map((item: any) => ({
      ...item,
      status: item.online === true ? '1' : '0',
      deviceType: item.deviceType || item.deviceModel,
      address: item.address || item.ipAddr
    }))
    await refreshAllPreviewStreams()
  }
}

onMounted(async() => {
  measureContainer()
  window.addEventListener('resize', measureContainer)
  window.addEventListener('mousemove', onWindowMouseMove)
  window.addEventListener('mouseup', onWindowMouseUp)
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)
  document.addEventListener('vl-exit-fullscreen', handleNativeExitFullscreen)
  await fetchDevices()
})

onBeforeUnmount(async() => {
  window.removeEventListener('resize', measureContainer)
  window.removeEventListener('mousemove', onWindowMouseMove)
  window.removeEventListener('mouseup', onWindowMouseUp)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
  document.removeEventListener('vl-exit-fullscreen', handleNativeExitFullscreen)
  // 退出全屏
  if (isFullscreen.value) {
    await exitFullscreen()
  }
  // 离开页面兜底恢复系统栏（防止沉浸式状态泄漏到其它页面）
  setImmersive(false)
  stopAllPreviews()
})

const showDetail = ref(false)
const currentDevice = ref<any | null>(null)

const openDetail = (item: any) => {
  currentDevice.value = item
  showDetail.value = true
}
</script>

<style scoped lang="scss">
/* 满屏视频 + 底部抽屉：负边距吃掉父级 padding，让视频铺满整个内容区 */
.video-square {
  position: relative;
  z-index: 1;
  height: calc(100% + 24px);
  margin: 0 -16px -24px;
  overflow: hidden;
  background: #000;
}

/* 布局切换浮在视频上方 */
.layout-row {
  position: absolute;
  top: 10px;
  left: 12px;
  right: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.layout-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(6px);
}

.layout-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.more-icon {
  width: 26px;
  height: 26px;
  padding: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(6px);
  box-sizing: content-box;
  object-fit: contain;
}

.mode-menu {
  min-width: 140px;
}

.mode-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  font-size: 14px;
  color: #111827;
}

.mode-menu-icon {
  width: 22px;
  height: 22px;
  margin-right: 8px;
  object-fit: contain;
}

/* 预览分屏铺满整个内容区 */
.preview-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 全屏模式样式（CSS 兜底，ArkWeb 不支持 Fullscreen API 时） */
.preview-grid.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
  background: #000;
}

/* 基础 1/4/9/16 画面 */
.preview-grid.layout-p1 {
  grid-template-columns: repeat(1, 1fr);
  grid-template-rows: repeat(1, 1fr);
}

.preview-grid.layout-p4 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.preview-grid.layout-p9 {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
}

.preview-grid.layout-p16 {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
}

/* 6 画面布局：左侧 1 个大窗口，右侧上下 2 个小窗口，底部 3 个窗口 */
.preview-grid.layout-p6 {
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(3, 1fr);
}

.preview-grid.layout-p6 .preview-cell:nth-child(1) {
  /* 大窗口，占左侧 2 行 2 列 */
  grid-row: 1 / span 2;
  grid-column: 1 / span 2;
}

.preview-grid.layout-p6 .preview-cell:nth-child(2) {
  /* 右上小窗口 */
  grid-row: 1 / 2;
  grid-column: 3 / 4;
}

.preview-grid.layout-p6 .preview-cell:nth-child(3) {
  /* 右中小窗口 */
  grid-row: 2 / 3;
  grid-column: 3 / 4;
}

.preview-grid.layout-p6 .preview-cell:nth-child(4) {
  /* 底部左 */
  grid-row: 3 / 4;
  grid-column: 1 / 2;
}

.preview-grid.layout-p6 .preview-cell:nth-child(5) {
  /* 底部中 */
  grid-row: 3 / 4;
  grid-column: 2 / 3;
}

.preview-grid.layout-p6 .preview-cell:nth-child(6) {
  /* 底部右 */
  grid-row: 3 / 4;
  grid-column: 3 / 4;
}

/* 8 画面布局：左侧 1 个大窗口，右侧上下 2 个小窗口，底部 4 个窗口 */
.preview-grid.layout-p8 {
  grid-template-rows: repeat(4, 1fr);
  grid-template-columns: repeat(4, 1fr);
}

.preview-grid.layout-p8 .preview-cell:nth-child(1) {
  /* 大窗口，占左侧 3 行 3 列 */
  grid-row: 1 / span 3;
  grid-column: 1 / span 3;
}

.preview-grid.layout-p8 .preview-cell:nth-child(2) {
  /* 右上小窗口 */
  grid-row: 1 / 2;
  grid-column: 4 / 5;
}

.preview-grid.layout-p8 .preview-cell:nth-child(3) {
  /* 右中小窗口 */
  grid-row: 2 / 3;
  grid-column: 4 / 5;
}

.preview-grid.layout-p8 .preview-cell:nth-child(4) {
  /* 右中小窗口 */
  grid-row: 3 / 4;
  grid-column: 4 / 5;
}

.preview-video-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.preview-video,
.preview-empty {
  width: 100%;
  height: 100%;
}

.preview-cell {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  overflow: hidden;
}

.preview-video {
  display: block;
  object-fit: cover;
}

.cell-fullscreen-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
}

.cell-fullscreen-btn:active {
  background: rgba(0, 0, 0, 0.5);
}

.cell-status {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  padding: 4px 8px;
  font-size: 11px;
  line-height: 16px;
  text-align: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  background: #000;
}

/* 设备列表抽屉 */
.device-drawer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #F9FAFF;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(17, 24, 39, 0.14);
  transition: height 0.25s ease;
}

.device-drawer.dragging {
  transition: none;
}

.drawer-handle {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 9px 0 7px;
  cursor: grab;
  user-select: none;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.drawer-thumb {
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.18);
}

.drawer-title {
  font-size: 12px;
  line-height: 16px;
  color: #7a7c85;
}

.drawer-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 4px 16px 16px;
}

.device-card {
  position: relative;
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
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

.privacy-tag {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  background: rgba(255, 141, 34, 0.12);
  border-radius: 4px;
  line-height: 18px;
  color: #ff8d22;
  font-size: 12px;
  padding: 0 6px;
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

.play-btn {
  position: absolute;
  top: 16px;
  right: 12px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
