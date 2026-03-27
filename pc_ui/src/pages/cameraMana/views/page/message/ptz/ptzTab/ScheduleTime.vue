<template>
  <div class="scheduleTime">
    <ScheduleTimeline
      :form="formValue"
      :time-periods="timePeriodsValue"
      @update:form="handleFormUpdate"
      @update:time-periods="handleTimePeriodsUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import ScheduleTimeline from '@/pages/cameraMana/views/page/message/components/ScheduleTimeline.vue'

type TimePeriodItem =
  | { start: string; end: string; type: string }
  | { interval: number }
  | { weekday: number }
  | { day: number }

type TimePeriods =
  | TimePeriodItem[]
  | TimePeriodItem[][]

interface ScheduleTime {
  frequency: string
  time_periods: TimePeriods
}

interface FormData {
  repeat: string
  interval: number
}

const props = defineProps<{
  scheduleTime?: ScheduleTime
}>()

const emit = defineEmits<{
  'update:schedule-time': [value: ScheduleTime]
}>()

const frequencyMap: Record<string, string> = {
  '每天': 'day',
  '隔天': 'next',
  '每周': 'week',
  '每月': 'month'
}

const frequencyMapReverse: Record<string, string> = {
  'day': '每天',
  'next': '隔天',
  'week': '每周',
  'month': '每月'
}

const defaultForm = reactive<FormData>({
  repeat: 'week',
  interval: 1
})

const formValue = computed<FormData>(() => {
  if (props.scheduleTime) {
    const repeat = frequencyMap[props.scheduleTime.frequency] || 'week'
    let interval = 1

    if (repeat === 'next' && props.scheduleTime.time_periods) {
      const periods = props.scheduleTime.time_periods as TimePeriodItem[]
      const intervalObj = periods.find((p: any) => p.interval !== undefined) as { interval: number } | undefined
      if (intervalObj) {
        interval = intervalObj.interval
      }
    }

    return {
      repeat,
      interval
    }
  }
  return defaultForm
})

const timePeriodsCache = reactive<Record<string, TimePeriods | undefined>>({
  day: undefined,
  next: undefined,
  week: undefined,
  month: undefined
})

const normalizeNextTimePeriods = (val: TimePeriods | undefined, interval: number): TimePeriods => {
  const periods = (Array.isArray(val) ? (val as TimePeriodItem[]) : []) as TimePeriodItem[]
  const segPeriods = periods.filter((p: any) => p.start && p.end) as TimePeriodItem[]
  return [{ interval }, ...segPeriods]
}

const timePeriodsValue = computed<TimePeriods | undefined>(() => {
  const key = formValue.value.repeat
  return timePeriodsCache[key] ?? props.scheduleTime?.time_periods
})

const handleFormUpdate = (val: FormData) => {
  if (props.scheduleTime) {
    const currentKey = frequencyMap[props.scheduleTime.frequency] || 'week'
    timePeriodsCache[currentKey] = props.scheduleTime.time_periods

    const nextFrequency = frequencyMapReverse[val.repeat] || '每周'
    let nextTimePeriods: TimePeriods = timePeriodsCache[val.repeat] ?? []

    if (val.repeat === 'next') {
      nextTimePeriods = normalizeNextTimePeriods(nextTimePeriods, val.interval)
      timePeriodsCache.next = nextTimePeriods
    }

    if (val.repeat === 'next' && (!Array.isArray(nextTimePeriods) || nextTimePeriods.length === 0)) {
      nextTimePeriods = [{ interval: val.interval }]
    }

    if (nextFrequency === props.scheduleTime.frequency && isTimePeriodsEqual(nextTimePeriods, props.scheduleTime.time_periods)) {
      return
    }

    isUpdatingFromEmit.value = true
    const updated: ScheduleTime = {
      frequency: nextFrequency,
      time_periods: nextTimePeriods
    }
    emit('update:schedule-time', updated)
    setTimeout(() => {
      isUpdatingFromEmit.value = false
    }, 0)
  }
}

const isUpdatingFromEmit = ref(false)

const isTimePeriodsEqual = (a: TimePeriods | undefined, b: TimePeriods | undefined): boolean => {
  if (a === b) return true
  if (!a || !b) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

const handleTimePeriodsUpdate = (val: TimePeriods) => {
  if (props.scheduleTime) {
    if (isTimePeriodsEqual(val, props.scheduleTime.time_periods)) {
      return
    }
    const key = frequencyMap[props.scheduleTime.frequency] || 'week'
    timePeriodsCache[key] = val
    isUpdatingFromEmit.value = true
    const updated: ScheduleTime = {
      frequency: props.scheduleTime.frequency,
      time_periods: val
    }
    emit('update:schedule-time', updated)
    setTimeout(() => {
      isUpdatingFromEmit.value = false
    }, 0)
  }
}

watch(
  () => props.scheduleTime,
  (val) => {
    if (isUpdatingFromEmit.value) {
      return
    }
    if (val) {
      defaultForm.repeat = frequencyMap[val.frequency] || 'week'

      if (defaultForm.repeat === 'next' && val.time_periods) {
        const periods = val.time_periods as TimePeriodItem[]
        const intervalObj = periods.find((p: any) => p.interval !== undefined) as { interval: number } | undefined
        if (intervalObj) {
          defaultForm.interval = intervalObj.interval
        }
      }

      const key = frequencyMap[val.frequency] || 'week'
      if (!isTimePeriodsEqual(timePeriodsCache[key], val.time_periods)) {
        timePeriodsCache[key] = val.time_periods
      }
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.scheduleTime {
  width: 1000px;

  :deep(.toolbar_row) {
    margin-top: 0 !important;
  }
}
</style>
