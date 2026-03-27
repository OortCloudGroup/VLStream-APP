<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="报警输入号" class="gridItem">
        <el-select v-model="form.inputNo" placeholder="请选择" class="selectLike">
          <el-option label="A->1" value="A->1" />
          <el-option label="A->2" value="A->2" />
        </el-select>
      </el-form-item>

      <el-form-item label="IP地址" class="gridItem">
        <el-input v-model="form.ip" disabled placeholder="本地" class="disabledLike" />
      </el-form-item>

      <el-form-item label="延时" class="gridItem">
        <el-select v-model="form.delay" placeholder="请选择" class="selectLike">
          <el-option label="5秒" value="5" />
          <el-option label="10秒" value="10" />
          <el-option label="30秒" value="30" />
        </el-select>
      </el-form-item>

      <el-form-item label="报警名称" class="gridItem">
        <el-input v-model="form.alarmName" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="报警状态" class="gridItem">
        <el-select v-model="form.alarmStatus" placeholder="请选择" class="selectLike">
          <el-option label="关闭" value="off" />
          <el-option label="开启" value="on" />
        </el-select>
      </el-form-item>
    </el-form>

    <div class="sectionTitle">
      <span class="line" />
      <span>布防时间</span>
    </div>
    <DefenseTime v-model:protection-time="form.protection_time" />

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import DefenseTime from './components/DefenseTime.vue'
import { getAlarmOutput, saveAlarmOutput } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  inputNo: 'A->1',
  ip: '本地',
  delay: '5',
  alarmName: '',
  alarmStatus: 'off',
  protection_time: {
    frequency: '每天',
    time_periods: []
  }
})

const alarmStatusMap: Record<string, boolean> = {
  off: false,
  on: true
}

const alarmStatusMapReverse: Record<string, string> = {
  false: 'off',
  true: 'on'
}

const fetchAlarmOutput = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getAlarmOutput(params)
  if (res.code === 200 && res.data) {
    form.inputNo = res.data.alarm_input_number || 'A->1'
    form.ip = res.data.ip_addr || '本地'
    const delayVal = res.data.delay || '5秒'
    form.delay = String(delayVal).replace('秒', '') || '5'
    form.alarmName = res.data.alarm_name || ''
    form.alarmStatus = alarmStatusMapReverse[String(res.data.alarm_state)] || 'off'
    if (res.data.protection_time) {
      form.protection_time = res.data.protection_time
    }
  }
}

const handleSave = async() => {
  const params: any = {
    alarm_input_number: form.inputNo,
    ip_addr: form.ip,
    delay: `${form.delay}秒`,
    alarm_name: form.alarmName,
    alarm_state: alarmStatusMap[form.alarmStatus] ?? false,
    protection_time: form.protection_time,
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await saveAlarmOutput(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchAlarmOutput()
  }
}

onMounted(() => {
  fetchAlarmOutput()
})
</script>

<style lang="scss" scoped>
.systemBasic {
  padding-left: 20px;
  width: 1000px;

  :deep(.toolbar_row){
    margin-top: 0 !important;
  }

  .sbForm {
    width: 480px;
    :deep(.el-input, .el-input__wrapper) {
      height: 44px !important;
      border-radius: 6px;
    }

    :deep(.el-form-item__label) {
      color: #666;
      font-size: 14px;
    }
  }
}

.gridItem {
  margin-bottom: 0;
}

.selectLike {
  cursor: pointer;

  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #E5E7EB inset;
  }

  :deep(input) {
    cursor: pointer;
  }
}

.disabledLike {
  :deep(.el-input__wrapper) {
    background: #F9FAFB;
    box-shadow: 0 0 0 1px #E5E7EB inset;
  }

  :deep(input) {
    color: #9CA3AF;
  }
}

.sectionTitle {
  margin: 24px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: var(--el-color-primary);

  .line {
    width: 3px;
    height: 18px;
    background: var(--el-color-primary);
  }
}

.submitBox {
  padding: 32px 20px 40px;
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
    cursor: pointer;
  }
}
</style>
