<template>
  <div class="recordPlanTimeline">
    <div class="toolbar_row">
      <div class="left_btn">
        <div class="btn_outline" @click="messVisi = true">
          <oort-svg-icon width="16" height="16" name="avg" />
          <span>高级参数</span>
        </div>
      </div>
      <div class="right_btns">
        <button-group
          :button-list="[
            { svg: 'del', name: '删除', clickFn: handleDelete },
            { svg: 'del', name: '删除全部', clickFn: handleDeleteAll },
          ]"
        />
      </div>
      <div class="legend">
        <div
          v-for="item in legend"
          :key="item.key"
          class="legend_item"
          :class="{ act: selectedLegendKey === item.key }"
          @click="selectedLegendKey = item.key"
        >
          <span class="dot" :style="{ background: item.color }" />
          <span class="legend_text">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="repeat_row">
      <div class="repeat_tabs">
        <div
          v-for="item in repeatTabs"
          :key="item.value"
          class="repeat_tab"
          :class="{ act: form.repeat === item.value }"
          @click="updateRepeat(item.value)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>

    <el-form v-if="form.repeat === 'next'" class="interval_form" label-position="top" :model="form">
      <el-form-item label="每隔">
        <el-input :model-value="form.interval" class="interval_input" @update:model-value="updateInterval">
          <template #suffix>
            天
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <div class="timeline_wrap">
      <div class="timeline_head">
        <div class="head_left" />
        <div class="head_right">
          <div class="ticks">
            <div
              v-for="(t, index) in ticks"
              :key="t"
              class="tick"
              :style="tickStyle(index)"
            >
              <div class="tick_num">
                {{ t }}
              </div>
              <div class="tick_line" />
            </div>
          </div>
        </div>
      </div>

      <div v-for="day in dayRows" :key="day.key" class="timeline_row">
        <div
          class="row_label"
          :class="{ selected: selectedDayKey === day.key }"
          @click="handleRowLabelClick(day.key)"
        >
          {{ day.label }}
        </div>
        <div
          class="row_track"
          @mousedown="handleTrackMouseDown($event, day.key)"
        >
          <div class="track_bg" />

          <div
            v-for="seg in segmentsByDay[day.key] || []"
            :key="seg.id"
            class="seg"
            :class="{ selected: selectedSegId === seg.id }"
            :style="segmentStyle(seg)"
            @mousedown.stop="handleSegmentMouseDown($event, day.key, seg)"
            @dblclick.stop="handleSegmentDelete(day.key, seg.id)"
          >
            <div class="seg_resize_left" @mousedown.stop="handleResizeStart($event, day.key, seg, 'left')" />
            <div class="seg_resize_right" @mousedown.stop="handleResizeStart($event, day.key, seg, 'right')" />
            <div class="seg_delete" @click.stop="handleSegmentDelete(day.key, seg.id)">
              <el-icon><Close /></el-icon>
            </div>
          </div>

          <div
            v-if="form.repeat === 'week' || form.repeat === 'month'"
            class="row_copy"
            @click.stop="handleCopyClick(day.key)"
          >
            <img src="@/assets/img/questionnaire/copy.png" alt="" />
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑时间段 -->
    <div v-if="editPop.visible" class="edit_pop_mask" @click.self="closeEditPop">
      <div class="edit_pop" :style="{ left: `${editPop.left}px`, top: `${editPop.top}px` }">
        <div class="edit_pop_close" @click="closeEditPop">
          ×
        </div>

        <div class="edit_time_row">
          <el-time-picker
            v-model="editPop.start"
            class="edit_time_picker"
            placeholder="开始时间"
            format="HH:mm"
            value-format="HH:mm:ss"
            :clearable="false"
          />
          <span class="edit_time_dash">-</span>
          <el-time-picker
            v-model="editPop.end"
            class="edit_time_picker"
            placeholder="结束时间"
            format="HH:mm"
            value-format="HH:mm:ss"
            :clearable="false"
          />
        </div>

        <div class="edit_actions">
          <div class="edit_delete" @click="handleEditDelete">
            删除
          </div>
          <div class="edit_save" @click="handleEditSave">
            保存
          </div>
        </div>
      </div>
    </div>

    <!-- 复制到... -->
    <div v-if="copyVisible" class="copy_pop_mask" @click.self="copyVisible = false">
      <div class="copy_pop">
        <div class="copy_pop_head">
          <span class="copy_pop_title">复制到…</span>
          <span class="copy_pop_close" @click="copyVisible = false">×</span>
        </div>

        <div class="copy_days">
          <label v-for="d in copyDaysOptions" :key="d.value" class="copy_day">
            <el-checkbox v-model="copyDays" :label="d.value">
              {{ d.label }}
            </el-checkbox>
          </label>
        </div>

        <div class="copy_actions">
          <div class="copy_cancel" @click="copyVisible = false">
            取消
          </div>
          <div class="copy_ok" @click="handleCopyConfirm">
            确定
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="messVisi"
      title="高级参数"
      width="35%"
      :close-on-click-modal="false"
    >
      <plan-tab-new :item="advancedParamsItem" @close="messVisi = false" @handle="handleAdvancedParams" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import ButtonGroup from '@/components/buttonGroup.vue'
import PlanTabNew from '@/pages/cameraMana/views/page/message/storage/planTab/planTabNew.vue'
import OortSvgIcon from '@/components/oortSvgIcon/index.vue'

interface LegendItem {
  key: string
  label: string
  color: string
}

interface Seg {
  id: string
  start: number
  end: number
  color: string
  type: string
}

interface FormData {
  repeat: string
  interval: number
}

type TimePeriodItem =
  | { start: string; end: string; type: string }
  | { interval: number }
  | { weekday: number }
  | { day: number }

type TimePeriods =
  | TimePeriodItem[]
  | TimePeriodItem[][]

type AdvancedParamsPayload = {
  loop_writing: boolean
  pre_record_time: number
  record_delay: number
  code_stream_type: string
}

const props = defineProps<{
  form?: FormData
  timePeriods?: TimePeriods
  advancedParams?: Partial<AdvancedParamsPayload>
}>()

const emit = defineEmits<{
  'update:form': [value: FormData]
  'update:time-periods': [value: TimePeriods]
  'advanced-params-handle': [payload: AdvancedParamsPayload]
}>()

const defaultForm = reactive<FormData>({
  repeat: 'day',
  interval: 1
})

const form = computed(() => props.form || defaultForm)

const messVisi = ref<boolean>(false)

const advancedParamsItem = computed(() => ({
  loop_writing: props.advancedParams?.loop_writing ?? true,
  pre_record_time: props.advancedParams?.pre_record_time ?? 5,
  record_delay: props.advancedParams?.record_delay ?? 5,
  code_stream_type: props.advancedParams?.code_stream_type ?? 'timing'
}))

const legend: LegendItem[] = [
  { key: 'timing', label: '定时', color: '#22C55E' },
  { key: 'motion', label: '移动侦测', color: '#25B6FF' },
  { key: 'alarm', label: '报警', color: '#EF4444' },
  { key: 'motionOrAlarm', label: '动测或报警', color: '#F59E0B' },
  { key: 'motionAndAlarm', label: '动测和报警', color: '#7C3AED' },
  { key: 'event', label: '事件', color: '#FF2DB8' }
]

const selectedLegendKey = ref<string>(legend[0]?.key || 'timing')

const getLegendColor = (key: string): string => {
  const item = legend.find(l => l.key === key)
  return item ? item.color : '#25B6FF'
}

const uiTypeToApiTypeMap: Record<string, string> = {
  timing: 'timing',
  motion: 'motion_detection',
  alarm: 'alarm',
  motionOrAlarm: 'monitoring_or_alarm',
  motionAndAlarm: 'monitoring_and_alarm',
  event: 'event'
}

const apiTypeToUiTypeMap: Record<string, string> = {
  timing: 'timing',
  motion_detection: 'motion',
  alarm: 'alarm',
  monitoring_or_alarm: 'motionOrAlarm',
  monitoring_and_alarm: 'motionAndAlarm',
  event: 'event'
}

const uiTypeToApiType = (uiType: string): string => uiTypeToApiTypeMap[uiType] || uiType
const apiTypeToUiType = (apiType: string): string => apiTypeToUiTypeMap[apiType] || apiType

const segmentsByDay = reactive<Record<string, Seg[]>>({})

const selectedSegId = ref<string | null>(null)
const selectedDayKey = ref<string | null>(null)

const timeToHours = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + minutes / 60
}

const hoursToTime = (hours: number): string => {
  const h = Math.floor(hours)
  const m = Math.floor((hours - h) * 60)
  const s = 0
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const handleRowLabelClick = (dayKey: string) => {
  selectedDayKey.value = selectedDayKey.value === dayKey ? null : dayKey
  selectedSegId.value = null
}

const handleSegmentDelete = (dayKey: string, segId: string) => {
  const segments = segmentsByDay[dayKey]
  if (segments) {
    const index = segments.findIndex(s => s.id === segId)
    if (index > -1) {
      segments.splice(index, 1)
    }
  }
  if (selectedSegId.value === segId) {
    selectedSegId.value = null
  }
}

const handleDelete = () => {
  if (selectedDayKey.value) {
    delete segmentsByDay[selectedDayKey.value]
    selectedDayKey.value = null
    return
  }

  if (!selectedSegId.value) return

  Object.keys(segmentsByDay).forEach(dayKey => {
    const segments = segmentsByDay[dayKey]
    if (segments) {
      const index = segments.findIndex(s => s.id === selectedSegId.value)
      if (index > -1) {
        segments.splice(index, 1)
      }
    }
  })
  selectedSegId.value = null
}

const handleDeleteAll = () => {
  Object.keys(segmentsByDay).forEach(dayKey => {
    delete segmentsByDay[dayKey]
  })
  selectedSegId.value = null
  selectedDayKey.value = null
}

const repeatTabs = [
  { label: '每天', value: 'day' },
  { label: '隔天', value: 'next' },
  { label: '每周', value: 'week' },
  { label: '每月', value: 'month' }
]

const ticks = computed(() => [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])

// 刻度位置
const tickStyle = (index: number) => {
  const count = ticks.value.length - 1 || 1
  const leftPercent = (index / count) * 100
  return {
    left: `${leftPercent}%`,
    transform: 'translateX(-50%)'
  }
}

const dayRows = computed(() => {
  if (form.value.repeat === 'month') {
    return Array.from({ length: 31 }, (_, i) => ({
      key: `day${i + 1}`,
      label: `${i + 1}`
    }))
  } else if (form.value.repeat === 'week') {
    return [
      { key: 'mon', label: '星期一' },
      { key: 'tue', label: '星期二' },
      { key: 'wed', label: '星期三' },
      { key: 'thu', label: '星期四' },
      { key: 'fri', label: '星期五' },
      { key: 'sat', label: '星期六' },
      { key: 'sun', label: '星期日' }
    ]
  } else {
    return [{ key: 'day', label: '每天' }]
  }
})

const segmentStyle = (seg: Seg) => {
  const left = `${(seg.start / 24) * 100}%`
  const width = `${((seg.end - seg.start) / 24) * 100}%`
  return {
    left,
    width,
    background: seg.color
  }
}

const weekdayMap: Record<number, string> = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
  7: 'sun'
}

const weekdayMapReverse: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7
}

const convertTimePeriodsToSegments = (timePeriods: TimePeriods | undefined, repeat: string): Record<string, Seg[]> => {
  const result: Record<string, Seg[]> = {}

  if (!timePeriods) {
    return result
  }

  if (repeat === 'day') {
    if (!Array.isArray(timePeriods) || (timePeriods.length > 0 && Array.isArray(timePeriods[0]))) {
      return result
    }
    const periods = timePeriods as TimePeriodItem[]
    const segments: Seg[] = periods
      .filter((p: any) => p.start && p.end)
      .map((p: any, index: number) => ({
        id: `s${index + 1}`,
        start: timeToHours(p.start),
        end: timeToHours(p.end),
        type: apiTypeToUiType((p as any).type || 'timing'),
        color: getLegendColor(apiTypeToUiType((p as any).type || 'timing'))
      }))
    if (segments.length > 0) {
      result['day'] = segments
    }
  } else if (repeat === 'next') {
    if (!Array.isArray(timePeriods) || (timePeriods.length > 0 && Array.isArray(timePeriods[0]))) {
      return result
    }
    const periods = timePeriods as TimePeriodItem[]
    const segments: Seg[] = periods
      .filter((p: any) => p.start && p.end)
      .map((p: any, index: number) => ({
        id: `s${index + 1}`,
        start: timeToHours(p.start),
        end: timeToHours(p.end),
        type: apiTypeToUiType((p as any).type || 'timing'),
        color: getLegendColor(apiTypeToUiType((p as any).type || 'timing'))
      }))
    if (segments.length > 0) {
      result['day'] = segments
    }
  } else if (repeat === 'week') {
    if (!Array.isArray(timePeriods) || timePeriods.length === 0) {
      return result
    }
    if (!Array.isArray(timePeriods[0])) {
      return result
    }
    const periods = timePeriods as TimePeriodItem[][]
    periods.forEach((dayPeriods) => {
      if (!Array.isArray(dayPeriods)) {
        return
      }
      const weekdayObj = dayPeriods.find((p: any) => p.weekday) as { weekday: number } | undefined
      if (weekdayObj) {
        const weekdayKey = weekdayMap[weekdayObj.weekday]
        if (weekdayKey) {
          const segments: Seg[] = dayPeriods
            .filter((p: any) => p.start && p.end)
            .map((p: any, index: number) => ({
              id: `s${index + 1}`,
              start: timeToHours(p.start),
              end: timeToHours(p.end),
              type: apiTypeToUiType((p as any).type || 'timing'),
              color: getLegendColor(apiTypeToUiType((p as any).type || 'timing'))
            }))
          if (segments.length > 0) {
            result[weekdayKey] = segments
          }
        }
      }
    })
  } else if (repeat === 'month') {
    if (!Array.isArray(timePeriods) || timePeriods.length === 0) {
      return result
    }
    if (!Array.isArray(timePeriods[0])) {
      return result
    }
    const periods = timePeriods as TimePeriodItem[][]
    periods.forEach((dayPeriods) => {
      if (!Array.isArray(dayPeriods)) {
        return
      }
      const dayObj = dayPeriods.find((p: any) => p.day !== undefined) as { day: number } | undefined
      if (dayObj) {
        const dayKey = `day${dayObj.day}`
        const segments: Seg[] = dayPeriods
          .filter((p: any) => p.start && p.end)
          .map((p: any, index: number) => ({
            id: `s${index + 1}`,
            start: timeToHours(p.start),
            end: timeToHours(p.end),
            type: apiTypeToUiType((p as any).type || 'timing'),
            color: getLegendColor(apiTypeToUiType((p as any).type || 'timing'))
          }))
        if (segments.length > 0) {
          result[dayKey] = segments
        }
      }
    })
  }

  return result
}

const convertSegmentsToTimePeriods = (
  segments: Record<string, Seg[]>,
  repeat: string,
  interval: number
): TimePeriods => {
  if (repeat === 'day') {
    const daySegments = segments['day'] || []
    return daySegments.map(seg => ({
      start: hoursToTime(seg.start),
      end: hoursToTime(seg.end),
      type: uiTypeToApiType(seg.type || 'timing')
    }))
  }

  if (repeat === 'next') {
    const daySegments = segments['day'] || []
    const periods: TimePeriodItem[] = [{ interval }]
    daySegments.forEach(seg => {
      periods.push({
        start: hoursToTime(seg.start),
        end: hoursToTime(seg.end),
        type: uiTypeToApiType(seg.type || 'timing')
      })
    })
    return periods
  }

  if (repeat === 'week') {
    const result: TimePeriodItem[][] = []
    Object.keys(segments).forEach(key => {
      const weekdayNum = weekdayMapReverse[key]
      if (!weekdayNum) return
      const segs = segments[key] || []
      if (!segs.length) return
      const dayPeriods: TimePeriodItem[] = [{ weekday: weekdayNum }]
      segs.forEach(seg => {
        dayPeriods.push({
          start: hoursToTime(seg.start),
          end: hoursToTime(seg.end),
          type: uiTypeToApiType(seg.type || 'timing')
        })
      })
      result.push(dayPeriods)
    })
    return result
  }

  if (repeat === 'month') {
    const result: TimePeriodItem[][] = []
    Object.keys(segments).forEach(key => {
      if (!key.startsWith('day')) return
      const dayNum = parseInt(key.replace('day', ''), 10)
      if (Number.isNaN(dayNum)) return
      const segs = segments[key] || []
      if (!segs.length) return
      const dayPeriods: TimePeriodItem[] = [{ day: dayNum }]
      segs.forEach(seg => {
        dayPeriods.push({
          start: hoursToTime(seg.start),
          end: hoursToTime(seg.end),
          type: uiTypeToApiType(seg.type || 'timing')
        })
      })
      result.push(dayPeriods)
    })
    return result
  }

  return []
}

const isUpdatingFromProps = ref(false)

const getRepeatKeys = (repeat: string): string[] => {
  if (repeat === 'day') return ['day']
  if (repeat === 'next') return ['day']
  if (repeat === 'week') return ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  if (repeat === 'month') return Array.from({ length: 31 }, (_, i) => `day${i + 1}`)
  return []
}

const isTimePeriodsEqual = (a: TimePeriods | undefined, b: TimePeriods | undefined): boolean => {
  if (a === b) return true
  if (!a || !b) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

watch(
  () => [props.timePeriods, form.value.repeat],
  (newVal, oldVal) => {
    if (props.timePeriods !== undefined) {
      const newTimePeriods = newVal[0] as TimePeriods | undefined
      const newRepeat = newVal[1] as string
      const oldTimePeriods = oldVal?.[0] as TimePeriods | undefined
      const oldRepeat = oldVal?.[1] as string

      if (newRepeat !== oldRepeat) {
        isUpdatingFromProps.value = true
        const converted = convertTimePeriodsToSegments(props.timePeriods, form.value.repeat)
        getRepeatKeys(form.value.repeat).forEach(key => {
          delete segmentsByDay[key]
        })
        Object.assign(segmentsByDay, converted)
        setTimeout(() => {
          isUpdatingFromProps.value = false
        }, 0)
        return
      }

      if (!isTimePeriodsEqual(newTimePeriods, oldTimePeriods)) {
        const currentConverted = convertSegmentsToTimePeriods(
          segmentsByDay,
          form.value.repeat,
          form.value.interval
        )
        if (isTimePeriodsEqual(currentConverted, newTimePeriods)) {
          return
        }

        isUpdatingFromProps.value = true
        const converted = convertTimePeriodsToSegments(props.timePeriods, form.value.repeat)
        getRepeatKeys(form.value.repeat).forEach(key => {
          delete segmentsByDay[key]
        })
        Object.assign(segmentsByDay, converted)
        setTimeout(() => {
          isUpdatingFromProps.value = false
        }, 0)
      }
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => [segmentsByDay, form.value.repeat, form.value.interval],
  () => {
    if (props.timePeriods !== undefined && !isUpdatingFromProps.value) {
      const converted = convertSegmentsToTimePeriods(
        segmentsByDay,
        form.value.repeat,
        form.value.interval
      )
      emit('update:time-periods', converted)
    }
  },
  { deep: true }
)

const copyVisible = ref(false)
const copyWeekDays = [
  { label: '星期一', value: 'mon' },
  { label: '星期二', value: 'tue' },
  { label: '星期三', value: 'wed' },
  { label: '星期四', value: 'thu' },
  { label: '星期五', value: 'fri' },
  { label: '星期六', value: 'sat' },
  { label: '星期日', value: 'sun' }
]

const copyDaysOptions = computed(() => {
  if (form.value.repeat === 'week') {
    return copyWeekDays
  } else if (form.value.repeat === 'month') {
    return Array.from({ length: 31 }, (_, i) => ({
      label: `${i + 1}`,
      value: `day${i + 1}`
    }))
  }
  return []
})

const copyDays = ref<string[]>([])

const sourceDayKey = ref<string>('')

const handleCopyClick = (dayKey: string) => {
  sourceDayKey.value = dayKey
  copyDays.value = []
  copyVisible.value = true
}

const handleCopyConfirm = () => {
  if (!sourceDayKey.value || copyDays.value.length === 0) {
    copyVisible.value = false
    return
  }

  const sourceSegments = segmentsByDay[sourceDayKey.value] || []
  if (sourceSegments.length === 0) {
    copyVisible.value = false
    return
  }

  copyDays.value.forEach(targetDayKey => {
    if (targetDayKey === sourceDayKey.value) return

    segmentsByDay[targetDayKey] = []
    sourceSegments.forEach(sourceSeg => {
      const newSeg: Seg = {
        id: generateSegId(),
        start: sourceSeg.start,
        end: sourceSeg.end,
        color: sourceSeg.color,
        type: sourceSeg.type
      }
      segmentsByDay[targetDayKey].push(newSeg)
    })
  })

  copyVisible.value = false
  copyDays.value = []
  sourceDayKey.value = ''
}

const updateRepeat = (value: string) => {
  const newForm = {
    ...form.value,
    repeat: value
  }
  if (props.form) {
    emit('update:form', newForm)
  } else {
    defaultForm.repeat = value
  }
}

const updateInterval = (value: string | number) => {
  const newForm = {
    ...form.value,
    interval: Number(value)
  }
  if (props.form) {
    emit('update:form', newForm)
  } else {
    defaultForm.interval = Number(value)
  }
}

// ========== 拖动 / 编辑 ==========
const dragState = ref<{
  isDragging: boolean
  mode: 'create' | 'move' | 'resize-left' | 'resize-right' | null
  dayKey: string
  segId: string | null
  startX: number
  startTime: number
  originalStart: number
  originalEnd: number
  moved: boolean
  segElement: HTMLElement | null
  trackElement: HTMLElement | null
}>({
  isDragging: false,
  mode: null,
  dayKey: '',
  segId: null,
  startX: 0,
  startTime: 0,
  originalStart: 0,
  originalEnd: 0,
  moved: false,
  segElement: null,
  trackElement: null
})

const getTimeFromMouseX = (e: MouseEvent, trackElement: HTMLElement): number => {
  const rect = trackElement.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = rect.width
  const time = Math.max(0, Math.min(24, (x / width) * 24))
  return Math.round(time * 100) / 100
}

let segIdCounter = 0
const generateSegId = () => {
  segIdCounter++
  return `seg_${Date.now()}_${segIdCounter}`
}

const checkOverlap = (dayKey: string, start: number, end: number, excludeId?: string): boolean => {
  const segments = segmentsByDay[dayKey] || []
  return segments.some(seg => {
    if (excludeId && seg.id === excludeId) return false
    return !(end <= seg.start || start >= seg.end)
  })
}

const handleTrackMouseDown = (e: MouseEvent, dayKey: string) => {
  if (e.button !== 0) return

  const target = e.target as HTMLElement
  if (target.closest('.seg') || target.closest('.row_copy') || target.closest('.seg_delete') ||
    target.closest('.seg_resize_left') || target.closest('.seg_resize_right')) {
    return
  }

  selectedSegId.value = null
  selectedDayKey.value = null

  const trackElement = e.currentTarget as HTMLElement
  const startTime = getTimeFromMouseX(e, trackElement)

  dragState.value = {
    isDragging: true,
    mode: 'create',
    dayKey,
    segId: null,
    startX: e.clientX,
    startTime,
    originalStart: startTime,
    originalEnd: startTime,
    moved: false,
    segElement: null,
    trackElement
  }

  if (!segmentsByDay[dayKey]) {
    segmentsByDay[dayKey] = []
  }
  const newSeg: Seg = {
    id: generateSegId(),
    start: startTime,
    end: startTime,
    color: getLegendColor(selectedLegendKey.value),
    type: selectedLegendKey.value
  }
  segmentsByDay[dayKey].push(newSeg)
  dragState.value.segId = newSeg.id

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  e.preventDefault()
}

const handleSegmentMouseDown = (e: MouseEvent, dayKey: string, seg: Seg) => {
  if (e.button !== 0) return
  if ((e.target as HTMLElement).closest('.seg_resize_left') ||
      (e.target as HTMLElement).closest('.seg_resize_right') ||
      (e.target as HTMLElement).closest('.seg_delete')) {
    return
  }

  selectedSegId.value = seg.id
  selectedDayKey.value = null

  const trackElement = (e.currentTarget as HTMLElement).closest('.row_track') as HTMLElement
  const startTime = getTimeFromMouseX(e, trackElement)

  dragState.value = {
    isDragging: true,
    mode: 'move',
    dayKey,
    segId: seg.id,
    startX: e.clientX,
    startTime,
    originalStart: seg.start,
    originalEnd: seg.end,
    moved: false,
    segElement: e.currentTarget as HTMLElement,
    trackElement
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  e.preventDefault()
  e.stopPropagation()
}

const handleResizeStart = (e: MouseEvent, dayKey: string, seg: Seg, side: 'left' | 'right') => {
  if (e.button !== 0) return

  const trackElement = (e.currentTarget as HTMLElement).closest('.row_track') as HTMLElement
  const startTime = getTimeFromMouseX(e, trackElement)

  dragState.value = {
    isDragging: true,
    mode: side === 'left' ? 'resize-left' : 'resize-right',
    dayKey,
    segId: seg.id,
    startX: e.clientX,
    startTime,
    originalStart: seg.start,
    originalEnd: seg.end,
    moved: false,
    segElement: null,
    trackElement
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  e.preventDefault()
  e.stopPropagation()
}

const handleMouseMove = (e: MouseEvent) => {
  if (!dragState.value.isDragging || !dragState.value.trackElement) return

  const currentTime = getTimeFromMouseX(e, dragState.value.trackElement)
  if (!dragState.value.moved) {
    const movedX = Math.abs(e.clientX - dragState.value.startX) > 3
    const movedT = Math.abs(currentTime - dragState.value.startTime) > 0.02
    if (movedX || movedT) {
      dragState.value.moved = true
    }
  }
  const segments = segmentsByDay[dragState.value.dayKey] || []
  const seg = segments.find(s => s.id === dragState.value.segId)

  if (!seg) return

  if (dragState.value.mode === 'create') {
    const start = Math.min(dragState.value.startTime, currentTime)
    const end = Math.max(dragState.value.startTime, currentTime)
    seg.start = start
    seg.end = end
  } else if (dragState.value.mode === 'move') {
    const duration = dragState.value.originalEnd - dragState.value.originalStart
    const offset = currentTime - dragState.value.startTime
    const newStart = Math.max(0, Math.min(24 - duration, dragState.value.originalStart + offset))
    const newEnd = newStart + duration

    if (!checkOverlap(dragState.value.dayKey, newStart, newEnd, seg.id)) {
      seg.start = newStart
      seg.end = newEnd
    }
  } else if (dragState.value.mode === 'resize-left') {
    const newStart = Math.max(0, Math.min(currentTime, dragState.value.originalEnd - 0.1))
    if (newStart < seg.end && !checkOverlap(dragState.value.dayKey, newStart, seg.end, seg.id)) {
      seg.start = newStart
    }
  } else if (dragState.value.mode === 'resize-right') {
    const newEnd = Math.min(24, Math.max(currentTime, dragState.value.originalStart + 0.1))
    if (newEnd > seg.start && !checkOverlap(dragState.value.dayKey, seg.start, newEnd, seg.id)) {
      seg.end = newEnd
    }
  }
}

const editPop = reactive<{
  visible: boolean
  dayKey: string
  segId: string
  left: number
  top: number
  start: string
  end: string
}>({
  visible: false,
  dayKey: '',
  segId: '',
  left: 0,
  top: 0,
  start: '00:00:00',
  end: '00:00:00'
})

const closeEditPop = () => {
  editPop.visible = false
  editPop.dayKey = ''
  editPop.segId = ''
}

const openEditPop = (dayKey: string, segId: string, anchorEl?: HTMLElement | null) => {
  const seg = (segmentsByDay[dayKey] || []).find(s => s.id === segId)
  if (!seg) return

  selectedSegId.value = segId
  editPop.dayKey = dayKey
  editPop.segId = segId

  editPop.start = hoursToTime(seg.start)
  editPop.end = hoursToTime(seg.end)

  let left = (window.innerWidth - 320) / 2
  let top = (window.innerHeight - 160) / 2
  if (anchorEl) {
    const rect = anchorEl.getBoundingClientRect()
    left = rect.left + rect.width / 2 - 160
    top = rect.top - 190
  }
  const popW = 320
  const popH = 140
  left = Math.max(10, Math.min(window.innerWidth - popW - 10, left))
  top = Math.max(10, Math.min(window.innerHeight - popH - 10, top))
  editPop.left = Math.round(left)
  editPop.top = Math.round(top)

  editPop.visible = true
}

const handleEditDelete = () => {
  if (!editPop.dayKey || !editPop.segId) return
  handleSegmentDelete(editPop.dayKey, editPop.segId)
  closeEditPop()
}

const handleEditSave = () => {
  if (!editPop.dayKey || !editPop.segId) return

  const start = timeToHours(editPop.start)
  const end = timeToHours(editPop.end)
  if (!(start >= 0 && start <= 24 && end >= 0 && end <= 24)) {
    ElMessage.error('时间范围不合法')
    return
  }
  if (end <= start) {
    ElMessage.error('结束时间必须大于开始时间')
    return
  }
  if (checkOverlap(editPop.dayKey, start, end, editPop.segId)) {
    ElMessage.error('时间段重叠，请调整时间')
    return
  }

  const seg = (segmentsByDay[editPop.dayKey] || []).find(s => s.id === editPop.segId)
  if (!seg) return
  seg.start = start
  seg.end = end
  closeEditPop()
}

const handleMouseUp = () => {
  if (dragState.value.isDragging) {
    if (dragState.value.mode === 'move' && dragState.value.segId && !dragState.value.moved) {
      const segments = segmentsByDay[dragState.value.dayKey] || []
      const seg = segments.find(s => s.id === dragState.value.segId)
      if (seg) {
        seg.start = dragState.value.originalStart
        seg.end = dragState.value.originalEnd
      }
      openEditPop(dragState.value.dayKey, dragState.value.segId, dragState.value.segElement)
    }

    if (dragState.value.mode === 'create' && dragState.value.segId) {
      const segments = segmentsByDay[dragState.value.dayKey] || []
      const seg = segments.find(s => s.id === dragState.value.segId)
      if (seg && (seg.end - seg.start < 0.1)) {
        const index = segments.indexOf(seg)
        if (index > -1) {
          segments.splice(index, 1)
        }
      }
    }

    dragState.value = {
      isDragging: false,
      mode: null,
      dayKey: '',
      segId: null,
      startX: 0,
      startTime: 0,
      originalStart: 0,
      originalEnd: 0,
      moved: false,
      segElement: null,
      trackElement: null
    }
  }

  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const handleAdvancedParams = (payload: AdvancedParamsPayload) => {
  emit('advanced-params-handle', payload)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style lang="scss" scoped>
.recordPlanTimeline {
  width: 100%;
}

.toolbar_row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.left_btn {
  display: flex;
  align-items: center;
}

.btn_outline {
  background: var(--el-color-primary-hb);
  border: 1px solid var(--el-color-primary);
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;

  span {
    font-size: 14px;
    color: var(--el-color-primary);
  }
}

.right_btns {
  display: flex;
  align-items: center;
}

.legend {
  margin-left: 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}

.legend_item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;

  &.act {
    color: var(--el-color-primary);
}

.dot {
    width: 12px;
    height: 12px;
  border-radius: 4px;
    display: inline-block;
  }
}

.repeat_row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.repeat_tabs {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid #2278FF;
  background: #fff;
  overflow: hidden;
}

.repeat_tab {
  padding: 10px 22px;
  font-size: 14px;
  color: #6B7280;
  cursor: pointer;
  background: transparent;
  margin: 2px;

  &.act {
    color: #2278FF;
    background: rgba(34, 120, 255, 0.1216);
    border-radius: 999px;
  }
}

.interval_form {
  width: 560px;
  margin-top: 18px;
  background-color: #fff;

  :deep(.el-form-item__label) {
    font-size: 16px;
    color: #333;
    padding-bottom: 10px;
  }

  :deep(.el-input) {
    height: 40px;
  }
}

.interval_input {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px;
    border-radius: 6px;
  }
}

.timeline_wrap {
  width: 100%;
  margin-top: 14px;
  background: #F3F4F6;
  border-radius: 8px;
  padding: 10px 14px 16px;
  padding-right: 60px;
}

.timeline_head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.head_left {
  width: 70px;
}

.head_right {
  flex: 1;
}

.ticks {
  position: relative;
  width: 100%;
  height: 24px;
}

.tick {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;

  .tick_num {
    font-size: 14px;
    color: #333;
  }

  .tick_line {
    width: 1px;
    height: 8px;
    background: #D1D5DB;
  }
}

.timeline_row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
}

.row_label {
  width: 70px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  user-select: none;

  &.selected {
    color: var(--el-color-primary);
  }
}

.row_track {
  flex: 1;
  position: relative;
  height: 34px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  cursor: crosshair;
  user-select: none;
}

.track_bg {
  position: absolute;
  inset: 0;
  background: #fff;
  pointer-events: none;
}

.seg {
  position: absolute;
  top: 0;
  height: 100%;
  cursor: move;
  user-select: none;
  overflow: hidden;

  &:hover {
    .seg_resize_left,
    .seg_resize_right {
      opacity: 1;
    }

    .seg_delete {
      opacity: 1;
    }
  }
}

.edit_pop_mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.edit_pop {
  position: fixed;
  width: 320px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  padding: 18px 18px 0;
  z-index: 1001;
}

.edit_pop_close {
  position: absolute;
  right: 14px;
  top: 8px;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.edit_time_row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 0 16px;
}

.edit_time_picker {
  width: 150px;

  :deep(.el-input__wrapper) {
    height: 38px;
    border-radius: 6px;
  }

  :deep(input) {
    text-align: center;
    cursor: pointer;
  }
}

.edit_time_dash {
  color: #6B7280;
  font-size: 14px;
  padding: 0 4px;
}

.edit_actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 -18px;
}

.edit_delete,
.edit_save {
  width: 50%;
  text-align: center;
  padding: 14px 0;
  cursor: pointer;
  font-size: 14px;
}

.edit_delete {
  color: #FF4D4F;
}

.edit_save {
  color: #2278FF;
  border-left: 1px solid #F3F4F6;
}

.seg_delete {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 20;
  pointer-events: none;

  .seg:hover & {
    opacity: 1;
    pointer-events: auto;
  }

  &:hover {
    background: rgba(255, 77, 79, 0.9);
    opacity: 1;
  }

  .el-icon {
    font-size: 12px;
    color: #fff;
  }
}

.seg_resize_left,
.seg_resize_right {
  position: absolute;
  top: 0;
  width: 4px;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  cursor: ew-resize;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 1);
    opacity: 1;
  }
}

.seg_resize_left {
  left: 0;
}

.seg_resize_right {
  right: 0;
}

.row_copy {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 18px;
    height: 18px;
  }
}

.copy_pop_mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.copy_pop {
  position: fixed;
  right: 400px;
  top: 240px;
  width: 360px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  padding: 16px 16px 12px;
  z-index: 1001;
}

.copy_pop_head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #F3F4F6;
}

.copy_pop_title {
  font-size: 16px;
  color: #333;
}

.copy_pop_close {
  font-size: 18px;
  color: #999;
  cursor: pointer;
}

.copy_days {
  padding: 14px 0 6px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px 12px;
}

.copy_day {
  display: flex;
  align-items: center;
}

.copy_actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
}

.copy_cancel {
  color: #FF4D4F;
  cursor: pointer;
  padding: 10px 0;
  width: 50%;
  text-align: center;
}

.copy_ok {
  color: #2278FF;
  cursor: pointer;
  padding: 10px 0;
  width: 50%;
  text-align: center;
  border-left: 1px solid #F3F4F6;
}
</style>
