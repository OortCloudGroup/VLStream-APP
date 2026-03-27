<template>
  <div class="snapshotPlanTab">
    <defense-time
      v-model:protection-time="form.schedule_time"
      :advanced-params="{
        loop_writing: form.loop_writing,
        pre_record_time: form.pre_record_time,
        record_delay: form.record_delay,
        code_stream_type: form.code_stream_type || form.stream_type
      }"
      @advanced-params-handle="applistFn"
    />
    <div class="submitBox flexRowAC">
      <div class="submit" @click="onSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DefenseTime from './SnapshotPlanTime.vue'
import { getCapture, saveCapture } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

type TimePeriodItem =
  | { start: string; end: string }
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

const form = reactive({
  loop_writing: false,
  pre_record_time: 0,
  record_delay: 0,
  code_stream_type: '',
  stream_type: '',
  schedule_time: {
    frequency: '',
    time_periods: [] as TimePeriods
  } as ScheduleTime,
  timing_capture: false,
  picture_format1: '',
  resolution1: '',
  picture_quality1: '',
  grab_time_interval1: 0,
  event_capture: false,
  picture_format2: '',
  resolution2: '',
  picture_quality2: '',
  grab_time_interval2: 0,
  image_quantity: 0
})

const applistFn = (payload: { loop_writing: boolean; pre_record_time: number; record_delay: number; code_stream_type: string }) => {
  form.loop_writing = payload.loop_writing
  form.pre_record_time = payload.pre_record_time
  form.record_delay = payload.record_delay
  form.stream_type = payload.code_stream_type
  form.code_stream_type = payload.code_stream_type
}

const fetchCapture = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getCapture(params)
  if (res.code === 200 && res.data) {
    Object.assign(form, res.data)
    if (!form.code_stream_type && form.stream_type) {
      form.code_stream_type = form.stream_type
    }
  }
}

const onSave = async() => {
  const params: any = {
    ...form,
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await saveCapture(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchCapture()
  } else {
    ElMessage.error(res.message || '保存失败')
  }
}

onMounted(() => {
  fetchCapture()
})
</script>

<style lang="scss" scoped>
.snapshotPlanTab {
  width: 100%;
  max-width: 1100px;
}

.submitBox {
  padding: 40px 0 20px;

  .submit {
    height: 48px;
    width: 170px;
    text-align: center;
    line-height: 48px;
    background: var(--el-color-primary);
    border-radius: 2px;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;
  }
}
</style>

