<template>
  <div class="recordPlanTab">
    <div class="top_row">
      <el-checkbox v-model="form.enabled">
        启用
      </el-checkbox>
    </div>

    <div class="mode_row">
      <el-form class="mode_form" label-position="top" :model="form">
        <el-form-item>
          <el-select v-model="form.stream_type" class="mode_select" placeholder="请选择">
            <el-option
              v-for="item in modeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <RecordPlanTime
      v-model:record-plan-time="form.schedule_time"
      :advanced-params="{
        loop_writing: form.loop_writing,
        pre_record_time: form.pre_record_time,
        record_delay: form.record_delay,
        code_stream_type: form.code_stream_type
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
import { reactive, onMounted } from 'vue'
import RecordPlanTime from '@/pages/cameraMana/views/page/message/storage/planTab/RecordPlanTime.vue'
import { getRecordingPlan, saveRecordingPlan } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

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

const form = reactive({
  enabled: false,
  code_stream_type: '关闭',
  loop_writing: true,
  pre_record_time: 5,
  record_delay: 5,
  stream_type: '关闭',
  schedule_time: {
    frequency: '每天',
    time_periods: [] as TimePeriods
  } as ScheduleTime
})

const modeOptions = [
  { label: '关闭', value: '关闭' },
  { label: '定时', value: '定时' }
]

const applistFn = (payload: { loop_writing: boolean; pre_record_time: number; record_delay: number; code_stream_type: string }) => {
  form.loop_writing = payload.loop_writing
  form.pre_record_time = payload.pre_record_time
  form.record_delay = payload.record_delay
  form.code_stream_type = payload.code_stream_type
}

const fetchRecordingPlan = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getRecordingPlan(params)
  if (res.code === 200 && res.data) {
    Object.assign(form, res.data)
  }
}

const onSave = async() => {
  const params: any = {
    ...form,
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await saveRecordingPlan(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchRecordingPlan()
  } else {
    ElMessage.error(res.message || '保存失败')
  }
}

onMounted(() => {
  fetchRecordingPlan()
})
</script>

<style lang="scss" scoped>
.recordPlanTab {
  padding-left: 20px;
  width: 100%;
  max-width: 1100px;
}

.top_row {
  padding-top: 8px;
}

.mode_row {
  width: 480px;
  margin-top: 16px;
  margin-bottom: 20px;
}

.mode_form {
  width: 100%;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.mode_select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 44px;
    padding: 0 16px;
    border-radius: 6px;
    box-shadow: 0 0 0 1px #E5E7EB inset;
  }

  :deep(.el-input__inner) {
    font-size: 14px;
    color: #333;
  }

  :deep(.el-select__caret) {
    color: #9CA3AF;
    font-size: 18px;
  }
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

