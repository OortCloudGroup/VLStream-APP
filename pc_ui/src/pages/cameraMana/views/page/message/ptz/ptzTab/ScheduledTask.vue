<template>
  <div class="scheduledTask">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.enablePrivacyMask">
          启用隐私遮蔽
        </el-checkbox>
      </el-form-item>

      <el-form-item>
        <el-select v-model="form.mode" class="full-select" placeholder="请选择">
          <el-option label="关闭" value="关闭" />
          <el-option label="开启" value="开启" />
        </el-select>
      </el-form-item>
    </el-form>

    <ScheduleTime v-model:schedule-time="form.schedule_time" />

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import ScheduleTime from './ScheduleTime.vue'
import { ElMessage } from 'element-plus'
import { getScheduledTask, saveScheduledTask } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

const form = reactive({
  enablePrivacyMask: true,
  mode: '关闭',
  schedule_time: {
    frequency: '每周',
    time_periods: [] as any[]
  }
})

const fetchScheduledTask = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getScheduledTask(params)
  if (res.code === 200 && res.data) {
    form.enablePrivacyMask = !!res.data.enable_privacy_mask
    form.mode = res.data.enable || '关闭'
    if (res.data.schedule_time) {
      form.schedule_time = res.data.schedule_time
    }
  }
}

const handleSave = async() => {
  const params: any = {
    enable_privacy_mask: form.enablePrivacyMask,
    enable: form.mode,
    schedule_time: form.schedule_time,
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await saveScheduledTask(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchScheduledTask()
  }
}

onMounted(() => {
  fetchScheduledTask()
})
</script>

<style lang="scss" scoped>
.scheduledTask {
  width: 1000px;
  padding: 0 20px 20px;
}

.sbForm {
  width: 640px;

  .el-input {
    height: 40px;
  }
}

.full-select {
  width: 560px;

  :deep(.el-select__wrapper) {
    height: 44px !important;
    border-radius: 6px;
  }
}

.submitBox {
  padding: 40px 20px;
  .submit {
    height: 48px;
    width: 170px;
    text-align: center;
    line-height: 48px;
    background: var(--el-color-primary);
    border-radius: 2px;
    font-size: 16px;
    color: #FFFFFF;
    cursor: pointer;
  }
}

</style>
