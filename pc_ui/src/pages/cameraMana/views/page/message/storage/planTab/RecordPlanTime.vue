<template>
  <div class="recordPlanTime">
    <RecordPlanTimeline
      :form="formValue"
      :time-periods="timePeriodsValue"
      :advanced-params="advancedParams"
      @update:form="handleFormUpdate"
      @update:time-periods="handleTimePeriodsUpdate"
      @advanced-params-handle="handleAdvancedParams"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed, ref } from 'vue'
import RecordPlanTimeline from './RecordPlanTimeline.vue'

type TimePeriodItem =
  | { start: string; end: string; type: string }
  | { interval: number }
  | { weekday: number }
  | { day: number }

type TimePeriods =
  | TimePeriodItem[]
  | TimePeriodItem[][]

interface RecordPlanTime {
  frequency: string
  time_periods: TimePeriods
}

interface FormData {
  repeat: string
  interval: number
}

type AdvancedParamsPayload = {
  loop_writing: boolean
  pre_record_time: number
  record_delay: number
  code_stream_type: string
}

const props = defineProps<{
  recordPlanTime?: RecordPlanTime
  advancedParams?: Partial<AdvancedParamsPayload>
}>()

const emit = defineEmits<{
  'update:record-plan-time': [value: RecordPlanTime]
  'advanced-params-handle': [payload: AdvancedParamsPayload]
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
  repeat: 'day',
  interval: 1
})

const formValue = computed<FormData>(() => {
  if (props.recordPlanTime) {
    const repeat = frequencyMap[props.recordPlanTime.frequency] || 'day'
    let interval = 1

    if (repeat === 'next' && props.recordPlanTime.time_periods) {
      const periods = props.recordPlanTime.time_periods as TimePeriodItem[]
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
  return timePeriodsCache[key] ?? props.recordPlanTime?.time_periods
})

const handleFormUpdate = (val: FormData) => {
  if (props.recordPlanTime) {
    const currentKey = frequencyMap[props.recordPlanTime.frequency] || 'day'
    timePeriodsCache[currentKey] = props.recordPlanTime.time_periods

    const nextFrequency = frequencyMapReverse[val.repeat] || '每天'
    let nextTimePeriods: TimePeriods = timePeriodsCache[val.repeat] ?? []

    if (val.repeat === 'next') {
      nextTimePeriods = normalizeNextTimePeriods(nextTimePeriods, val.interval)
      timePeriodsCache.next = nextTimePeriods
    }

    if (val.repeat === 'next' && (!Array.isArray(nextTimePeriods) || nextTimePeriods.length === 0)) {
      nextTimePeriods = [{ interval: val.interval }]
    }

    if (nextFrequency === props.recordPlanTime.frequency && isTimePeriodsEqual(nextTimePeriods, props.recordPlanTime.time_periods)) {
      return
    }

    isUpdatingFromEmit.value = true
    const updated: RecordPlanTime = {
      frequency: nextFrequency,
      time_periods: nextTimePeriods
    }
    emit('update:record-plan-time', updated)
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
  if (props.recordPlanTime) {
    if (isTimePeriodsEqual(val, props.recordPlanTime.time_periods)) {
      return
    }
    const key = frequencyMap[props.recordPlanTime.frequency] || 'day'
    timePeriodsCache[key] = val
    isUpdatingFromEmit.value = true
    const updated: RecordPlanTime = {
      frequency: props.recordPlanTime.frequency,
      time_periods: val
    }
    emit('update:record-plan-time', updated)
    setTimeout(() => {
      isUpdatingFromEmit.value = false
    }, 0)
  }
}

const handleAdvancedParams = (payload: AdvancedParamsPayload) => {
  emit('advanced-params-handle', payload)
}

watch(
  () => props.recordPlanTime,
  (val) => {
    if (isUpdatingFromEmit.value) {
      return
    }
    if (val) {
      defaultForm.repeat = frequencyMap[val.frequency] || 'day'

      if (defaultForm.repeat === 'next' && val.time_periods) {
        const periods = val.time_periods as TimePeriodItem[]
        const intervalObj = periods.find((p: any) => p.interval !== undefined) as { interval: number } | undefined
        if (intervalObj) {
          defaultForm.interval = intervalObj.interval
        }
      }

      const key = frequencyMap[val.frequency] || 'day'
      if (!isTimePeriodsEqual(timePeriodsCache[key], val.time_periods)) {
        timePeriodsCache[key] = val.time_periods
      }
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.recordPlanTime {
  width: 100%;

  :deep(.toolbar_row) {
    margin-top: 0 !important;
  }
}
</style>
