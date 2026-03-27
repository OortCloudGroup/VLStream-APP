<template>
  <div class="roi_top">
    <!-- 左侧：视频预览 -->
    <div class="roi_left_video">
      <div class="video_bg">
        <OPlayer
          v-model:roi-points="roiPointsProxy"
          :src="_videoInfo.src"
          :type="_videoInfo.type"
          :roi-enabled="drawEnabled"
          @roi-complete="$emit('roi-complete')"
        />
        <!-- OSD 字符叠加矩形显示层 -->
        <div
          v-if="hasOsdRects"
          ref="osdRectsLayer"
          class="osd_rects_layer"
          @mousedown="handleLayerMouseDown"
        >
          <div
            v-for="(line, index) in enabledOsdLines"
            :key="index"
            class="osd_rect"
            :class="{ active: activeRectIndex === index }"
            :style="getRectStyle(line.rect)"
            @mousedown.stop="handleRectMouseDown($event, index)"
          >
            <div v-if="line.text" class="osd_rect_text">
              {{ line.text }}
            </div>
            <div
              v-for="handle in resizeHandles"
              :key="handle.position"
              class="resize-handle"
              :class="`handle-${handle.position}`"
              :style="getHandleStyle(handle.position, line.rect)"
              @mousedown.stop="handleResizeStart($event, index, handle.position)"
            />
          </div>
        </div>
      </div>
      <div class="roi_left_con">
        <div class="video_bottom_left">
          <el-tooltip content="绘制" placement="top">
            <img
              src="@/assets/img/camera/kshz.png"
              alt=""
              :style="{ opacity: drawEnabled ? 1 : 0.85 }"
              @click="toggleDraw"
            />
          </el-tooltip>
          <el-tooltip content="清除" placement="top">
            <img
              src="@/assets/img/camera/qc.png"
              alt=""
              style="cursor: pointer;"
              @click="clearRoi"
            />
          </el-tooltip>
        </div>
        <div class="video_bottom_right">
          <el-tooltip content="录制" placement="top">
            <img
              src="@/assets/img/camera/lp.png"
              alt=""
              class="lp"
              :style="{ opacity: recordLoading ? 0.6 : 1, cursor: recordLoading ? 'not-allowed' : 'pointer' }"
              @click="toggleRecord"
            />
          </el-tooltip>
          <el-tooltip content="抓图" placement="top">
            <img
              src="@/assets/img/camera/zt.png"
              alt=""
              :style="{ opacity: snapshotLoading ? 0.6 : 1, cursor: snapshotLoading ? 'not-allowed' : 'pointer' }"
              @click="handleSnapshot"
            />
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 中间：PTZ控制 -->
    <div class="roi_center_ptz">
      <div class="move_top_f">
        PTZ
      </div>
      <div class="move_top">
        <div class="move_top_direction">
          <img class="direction_arrow direction_up" src="@/assets/img/camera/jt.png" alt="上" />
          <img class="direction_arrow direction_left" src="@/assets/img/camera/jt.png" alt="左" />
          <img class="direction_arrow direction_center" src="@/assets/img/camera/jz.png" alt="重置" />
          <img class="direction_arrow direction_right" src="@/assets/img/camera/jt.png" alt="右" />
          <img class="direction_arrow direction_down" src="@/assets/img/camera/jt.png" alt="下" />
        </div>
      </div>
      <div class="move_top_f">
        光学变倍控制
      </div>
      <div class="move_top_btn flexRowAC">
        <img class="move_top_btn_img" src="@/assets/img/camera/btn/hrb1.png" alt="" />
        <div class="move_top_b_f">
          变倍
        </div>
        <img class="move_top_btn_img" src="@/assets/img/camera/btn/hrb2.png" alt="" />
      </div>
      <div class="ho_op_one flexRowAC">
        <div class="ho_op_one_1 flexRowAC">
          <img src="@/assets/img/camera/btn/hrf1.png" alt="" />
          <span class="line" />
          <img src="@/assets/img/camera/btn/hrf4.png" alt="" />
        </div>
        <div class="ho_op_one_1 flexRowAC">
          <img src="@/assets/img/camera/btn/hrf2.png" alt="" />
          <span class="line" />
          <img src="@/assets/img/camera/btn/hrf5.png" alt="" />
        </div>
        <div class="ho_op_one_1 flexRowAC">
          <img src="@/assets/img/camera/btn/hrf3.png" alt="" />
          <span class="line" />
          <img src="@/assets/img/camera/btn/hrf6.png" alt="" />
        </div>
      </div>
    </div>

    <!-- 右侧：预置点列表 -->
    <div class="roi_right_presets">
      <div class="ho_op_font">
        <div class="ho_op_c act">
          <span>预置点1</span>
          <img class="ho_op_c_setting" src="@/assets/img/camera/btn/setting.png" alt="设置" />
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
        <div class="ho_op_c">
          预置点1
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import OPlayer from '@/components/OPlayer.vue'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { startMediaRecord, stopMediaRecord, snapshotMedia, fileMedia } from '@/api/cameraMana/index'
import { downloadBlob } from '@/utils/downloadEx'

const props = defineProps<{
  roiPoints: any
  osdLines?: Array<{ enable: boolean; text: string; rect: number[][] | null }>
}>()

const emit = defineEmits(['update:roiPoints', 'roi-complete', 'roi-clear', 'update:osdLines'])

const store: any = useUserStore()

// 画框开关
const drawEnabled = ref(false)
// 录制/抓图 loading
const isRecording = ref(false)
const recordLoading = ref(false)
const snapshotLoading = ref(false)

// 代理 v-model:roi-points
const roiPointsProxy = computed({
  get: () => props.roiPoints,
  set: (val) => emit('update:roiPoints', val)
})

const _videoInfo = ref({
  src: 'http://xx.xx.xx.xx:8082/videocall/AETY-00-NJN2-WJUB-00000100',
  type: 'cameraRTC'
})

const osdRectsLayer = ref<HTMLElement | null>(null)
const activeRectIndex = ref<number | null>(null)
const dragState = ref<{
  isDragging: boolean
  mode: 'move' | 'resize'
  rectIndex: number
  startX: number
  startY: number
  startRect: number[][]
  resizeHandle?: string
} | null>(null)

// 调整大小的控制点位置
const resizeHandles = [
  { position: 'nw' }, // 左上
  { position: 'ne' }, // 右上
  { position: 'sw' }, // 左下
  { position: 'se' }, // 右下
  { position: 'n' }, // 上
  { position: 's' }, // 下
  { position: 'w' }, // 左
  { position: 'e' } // 右
]

const enabledOsdLines = computed(() => {
  if (!props.osdLines) return []
  return props.osdLines
    .map((line, index) => ({ ...line, originalIndex: index }))
    .filter(line => line.enable && line.rect)
})

// 计算是否有 OSD 矩形需要显示
const hasOsdRects = computed(() => {
  return enabledOsdLines.value.length > 0
})

// 将归一化坐标转换为样式
const getRectStyle = (rect: number[][] | null) => {
  if (!rect || !Array.isArray(rect) || rect.length !== 2) return {}
  const p1 = rect[0]
  const p2 = rect[1]
  if (!Array.isArray(p1) || !Array.isArray(p2) || p1.length !== 2 || p2.length !== 2) return {}

  const x1 = Number(p1[0])
  const y1 = Number(p1[1])
  const x2 = Number(p2[0])
  const y2 = Number(p2[1])

  if ([x1, y1, x2, y2].some((n) => Number.isNaN(n))) return {}

  const left = Math.min(x1, x2)
  const top = Math.min(y1, y2)
  const right = Math.max(x1, x2)
  const bottom = Math.max(y1, y2)

  return {
    left: `${left * 100}%`,
    top: `${top * 100}%`,
    width: `${(right - left) * 100}%`,
    height: `${(bottom - top) * 100}%`
  }
}

// 获取调整大小控制点的样式
const getHandleStyle = (position: string, _rect: number[][] | null) => {
  const handleSize = 8

  const positions: Record<string, any> = {
    nw: { left: '0%', top: '0%', cursor: 'nw-resize' },
    ne: { left: '100%', top: '0%', cursor: 'ne-resize', transform: 'translate(-100%, 0)' },
    sw: { left: '0%', top: '100%', cursor: 'sw-resize', transform: 'translate(0, -100%)' },
    se: { left: '100%', top: '100%', cursor: 'se-resize', transform: 'translate(-100%, -100%)' },
    n: { left: '50%', top: '0%', cursor: 'n-resize', transform: 'translate(-50%, 0)' },
    s: { left: '50%', top: '100%', cursor: 's-resize', transform: 'translate(-50%, -100%)' },
    w: { left: '0%', top: '50%', cursor: 'w-resize', transform: 'translate(0, -50%)' },
    e: { left: '100%', top: '50%', cursor: 'e-resize', transform: 'translate(-100%, -50%)' }
  }

  return {
    ...positions[position],
    width: `${handleSize}px`,
    height: `${handleSize}px`
  }
}

// 获取归一化坐标
const getNormalizedPoint = (clientX: number, clientY: number) => {
  const layer = osdRectsLayer.value
  if (!layer) return null
  const rect = layer.getBoundingClientRect()
  if (!rect.width || !rect.height) return null
  const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
  return [x, y]
}

// 处理矩形鼠标按下
const handleRectMouseDown = (e: MouseEvent, index: number) => {
  if (e.button !== 0) return
  const line = enabledOsdLines.value[index]
  if (!line || !line.rect) return

  activeRectIndex.value = index
  const startPoint = getNormalizedPoint(e.clientX, e.clientY)
  if (!startPoint) return

  dragState.value = {
    isDragging: true,
    mode: 'move',
    rectIndex: line.originalIndex,
    startX: e.clientX,
    startY: e.clientY,
    startRect: JSON.parse(JSON.stringify(line.rect))
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  e.preventDefault()
  e.stopPropagation()
}

// 处理调整大小开始
const handleResizeStart = (e: MouseEvent, index: number, handle: string) => {
  if (e.button !== 0) return
  const line = enabledOsdLines.value[index]
  if (!line || !line.rect) return

  activeRectIndex.value = index
  dragState.value = {
    isDragging: true,
    mode: 'resize',
    rectIndex: line.originalIndex,
    startX: e.clientX,
    startY: e.clientY,
    startRect: JSON.parse(JSON.stringify(line.rect)),
    resizeHandle: handle
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  e.preventDefault()
  e.stopPropagation()
}

// 处理图层鼠标按下
const handleLayerMouseDown = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    activeRectIndex.value = null
  }
}

// 处理鼠标移动
const handleMouseMove = (e: MouseEvent) => {
  if (!dragState.value || !props.osdLines) return

  const state = dragState.value
  const currentPoint = getNormalizedPoint(e.clientX, e.clientY)
  if (!currentPoint) return

  const deltaX = (e.clientX - state.startX) / (osdRectsLayer.value?.getBoundingClientRect().width || 1)
  const deltaY = (e.clientY - state.startY) / (osdRectsLayer.value?.getBoundingClientRect().height || 1)

  const [p1, p2] = state.startRect
  const [x1, y1] = p1
  const [x2, y2] = p2

  let newRect: number[][]

  if (state.mode === 'move') {
    newRect = [
      [x1 + deltaX, y1 + deltaY],
      [x2 + deltaX, y2 + deltaY]
    ]
    const minX = Math.min(newRect[0][0], newRect[1][0])
    const minY = Math.min(newRect[0][1], newRect[1][1])
    const maxX = Math.max(newRect[0][0], newRect[1][0])
    const maxY = Math.max(newRect[0][1], newRect[1][1])
    if (minX < 0 || minY < 0 || maxX > 1 || maxY > 1) {
      const offsetX = minX < 0 ? -minX : (maxX > 1 ? 1 - maxX : 0)
      const offsetY = minY < 0 ? -minY : (maxY > 1 ? 1 - maxY : 0)
      newRect = [
        [newRect[0][0] + offsetX, newRect[0][1] + offsetY],
        [newRect[1][0] + offsetX, newRect[1][1] + offsetY]
      ]
    }
  } else {
    const handle = state.resizeHandle!
    const left = Math.min(x1, x2)
    const top = Math.min(y1, y2)
    const right = Math.max(x1, x2)
    const bottom = Math.max(y1, y2)

    let newLeft = left
    let newTop = top
    let newRight = right
    let newBottom = bottom

    if (handle.includes('n')) newTop = Math.max(0, Math.min(1, top + deltaY))
    if (handle.includes('s')) newBottom = Math.max(0, Math.min(1, bottom + deltaY))
    if (handle.includes('w')) newLeft = Math.max(0, Math.min(1, left + deltaX))
    if (handle.includes('e')) newRight = Math.max(0, Math.min(1, right + deltaX))

    if (newRight - newLeft < 0.01) {
      if (handle.includes('e')) newRight = newLeft + 0.01
      else newLeft = newRight - 0.01
    }
    if (newBottom - newTop < 0.01) {
      if (handle.includes('s')) newBottom = newTop + 0.01
      else newTop = newBottom - 0.01
    }

    newRect = [
      [newLeft, newTop],
      [newRight, newBottom]
    ]
  }

  const updatedLines = [...props.osdLines]
  if (updatedLines[state.rectIndex]) {
    updatedLines[state.rectIndex] = {
      ...updatedLines[state.rectIndex],
      rect: newRect
    }
    emit('update:osdLines', updatedLines)
  }
}

// 处理鼠标抬起
const handleMouseUp = () => {
  if (dragState.value) {
    dragState.value = null
  }
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 开启/重置画框
const toggleDraw = () => {
  if (!drawEnabled.value) drawEnabled.value = true
  clearRoiSilent()
  ElMessage.success('开启画框')
}

const clearRoiSilent = () => {
  roiPointsProxy.value = null
}

const clearRoi = () => {
  clearRoiSilent()
  ElMessage.success('清除画框')
  emit('roi-clear')
}

// 录制
const toggleRecord = async() => {
  if (recordLoading.value) return
  recordLoading.value = true
  try {
    const params = {
      accessToken: store.userInfo?.accessToken
    }

    if (!isRecording.value) {
      const res: any = await startMediaRecord(params)
      if (res?.code === 200 && res.data) {
        if (res.data.running) {
          isRecording.value = true
          ElMessage.success('开始录屏')
        } else {
          ElMessage.error('录屏启动失败')
        }
      } else {
        ElMessage.error('录屏启动失败')
      }
    } else {
      const res: any = await stopMediaRecord(params)
      if (res?.code === 200 && res.data) {
        isRecording.value = !!res.data.running
        const { filename } = res.data
        if (!res.data.running && filename) {
          const fileRes: any = await fileMedia({ name: filename })
          const blob = fileRes instanceof Blob ? fileRes : new Blob([fileRes])
          downloadBlob(blob, filename || 'record.avi')
          ElMessage.success('录屏完成，已开始下载')
        } else if (res.data.running) {
          ElMessage.warning('录屏仍在进行，无法下载文件')
        }
      } else {
        ElMessage.error('停止录屏失败')
      }
    }
  } finally {
    recordLoading.value = false
  }
}

// 抓图
const handleSnapshot = async() => {
  if (snapshotLoading.value) return
  snapshotLoading.value = true
  try {
    const params = {
      accessToken: store.userInfo?.accessToken
    }
    const res: any = await snapshotMedia(params)
    if (res?.code === 200 && res.data) {
      const { filename } = res.data
      if (filename) {
        const fileRes: any = await fileMedia({ name: filename })
        const blob = fileRes instanceof Blob ? fileRes : new Blob([fileRes])
        downloadBlob(blob, filename || 'snapshot.jpg')
        ElMessage.success('抓图成功')
      }
    } else {
      ElMessage.error('抓图失败')
    }
  } finally {
    snapshotLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.roi_top {
  display: flex;
  align-items: flex-start;
  height: 545px;
  gap: 20px;
}

.roi_left_video {
  position: relative;
  width: 560px;
  height: 500px;
  background-color: #dadada;

  .video_bg {
    position: relative;
    width: 100%;
    height: 456px;

    .osd_rects_layer {
      position: absolute;
      inset: 0;
      z-index: 10000;
      pointer-events: all;
    }

    .osd_rect {
      position: absolute;
      border: 2px solid #15CF87;
      background: rgba(21, 207, 135, 0.1);
      box-sizing: border-box;
      cursor: move;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      &.active {
        border-color: #2278FF;
        background: rgba(34, 120, 255, 0.15);
      }

      .osd_rect_text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-size: 14px;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        white-space: nowrap;
        pointer-events: none;
        z-index: 0;
        padding: 2px 4px;
      }

      .resize-handle {
        position: absolute;
        background: #2278FF;
        border: 1px solid #fff;
        border-radius: 50%;
        pointer-events: all;
        z-index: 1;
      }
    }
  }

  .roi_left_con {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;

    .video_bottom_left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .video_bottom_right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    img {
      width: 38px;
      height: 38px;
      cursor: pointer;
    }

    .lp {
      width: 30px;
      height: 30px;
      cursor: pointer;
      padding-bottom: 1px;
    }
  }
}

.roi_center_ptz {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .move_top_btn {
    position: relative;
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 40px;
    border-radius: 20px;
    background: rgba(34, 120, 255, 0.1216);
    padding: 26px 8px;
    box-sizing: border-box;
  }

  .move_top_b_f {
    font-size: 14px;
    color: #2278FF;
  }

  .move_top_btn_img {
    width: 24px;
    height: 24px;
  }

  .move_top {
    align-self: center;
    width: 240px;
    height: 240px;
    background: #E3EAFF;
    border-radius: 50%;
    margin-bottom: 30px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .move_top_direction {
    position: relative;
    width: 240px;
    height: 240px;
  }

  .direction_arrow {
    position: absolute;
    cursor: pointer;
    width: 48px;
    height: 27px;
  }

  .direction_up {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .direction_down {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) rotate(180deg);
  }

  .direction_left {
    left: 20px;
    top: 50%;
    transform: translateY(-50%) rotate(-90deg);
  }

  .direction_right {
    right: 20px;
    top: 50%;
    transform: translateY(-50%) rotate(90deg);
  }

  .direction_center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90px;
    height: 90px;
  }

  .move_top_f {
    font-size: 18px;
    color: #000000;
    margin-bottom: 12px;
  }
}

.roi_right_presets {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 调焦
.ho_op_one {
  gap: 10px;
  padding-top: 10px;

  .ho_op_one_1 {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 22px;

    > img {
      width: 48px;
      height: 48px;
    }

    .line{
      display: flex;
      width: 48px;
      height: 0.5px;
      background: #F0F2F5;
    }
  }
}

// 预置点
.ho_op_font {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  overflow-y: auto;

  .ho_op_c {
    font-size: 14px;
    padding: 13px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ho_op_c.act {
    color: #1A53FF;
    letter-spacing: 0.4px;
    line-height: 22px;
    font-weight: 400;
    background: rgba(26, 83, 255, 0.12);
  }

  .ho_op_c_setting {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}
</style>

