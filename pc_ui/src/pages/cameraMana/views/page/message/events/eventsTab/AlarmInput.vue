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

      <el-form-item label="报警类型" class="gridItem">
        <el-select v-model="form.alarmType" placeholder="请选择" class="selectLike">
          <el-option label="常开" value="always_on" />
          <el-option label="常闭" value="always_off" />
        </el-select>
      </el-form-item>

      <el-form-item label="报警名称" class="gridItem">
        <el-input v-model="form.alarmName" placeholder="请输入" />
      </el-form-item>

      <el-form-item style="margin-top: 20px;">
        <el-checkbox v-model="form.handleAlarm">
          处理报警输入
        </el-checkbox>
      </el-form-item>
    </el-form>

    <el-tabs v-model="activeTab" class="alarm-input-tabs">
      <el-tab-pane label="布防时间" name="schedule" />
      <el-tab-pane label="联动方式" name="linkage" />
    </el-tabs>

    <DefenseTime v-if="activeTab === 'schedule'" v-model:protection-time="form.protection_time" />
    <AlarmInputLinkage v-if="activeTab === 'linkage'" v-model:linkage-mode="form.linkage_mode" />

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import DefenseTime from './components/DefenseTime.vue'
import AlarmInputLinkage from './components/AlarmInputLinkage.vue'
import { getAlarmInput, saveAlarmInput } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const alarmTypeMap: Record<string, string> = {
  'always_on': '常开',
  'always_off': '常闭'
}

const alarmTypeMapReverse: Record<string, string> = {
  '常开': 'always_on',
  '常闭': 'always_off'
}

const form = reactive({
  inputNo: 'A->1',
  ip: '本地',
  alarmType: 'always_on',
  alarmName: '',
  handleAlarm: false,
  protection_time: {
    frequency: '每天',
    time_periods: []
  },
  linkage_mode: {
    regular_linkage: false,
    email_linkage: false,
    upload_center: false,
    upload_ftp_sd_card_nas: false,
    linkage_alarm_output: false,
    A_1: false,
    linkage_video: false,
    A1: false,
    ptz_linkage_channel: 'A1',
    preset_point_number: false,
    preset_point_value: 1,
    residence_time: '0',
    cruise_serial_number: false,
    cruise_serial_value: 1
  }
})

const activeTab = ref('schedule')

const fetchAlarmInput = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  try {
    const res: any = await getAlarmInput(params)
    if (res.code === 200 && res.data) {
      form.inputNo = res.data.alarm_input_number || 'A->1'
      form.ip = res.data.ip_addr || '本地'
      form.alarmType = alarmTypeMapReverse[res.data.alarm_type] || 'always_on'
      form.alarmName = res.data.alarm_name || ''
      form.handleAlarm = res.data.handle_alarm_input || false

      if (res.data.protection_time) {
        form.protection_time = res.data.protection_time
      }

      if (res.data.linkage_mode) {
        form.linkage_mode = res.data.linkage_mode
      }
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
}

const handleSave = async() => {
  const params: any = {
    alarm_input_number: form.inputNo,
    ip_addr: form.ip,
    alarm_type: alarmTypeMap[form.alarmType] || '常开',
    alarm_name: form.alarmName,
    handle_alarm_input: form.handleAlarm,
    protection_time: form.protection_time,
    linkage_mode: form.linkage_mode,
    accessToken: store.userInfo?.accessToken
  }
  try {
    const res: any = await saveAlarmInput(params)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      await fetchAlarmInput()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  fetchAlarmInput()
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

// 标签页样式
:deep(.alarm-input-tabs) {
  .el-tabs__item {
    color: #999999;
    font-size: 16px;
  }

  .el-tabs__item.is-active {
    color: var(--el-color-primary);
  }

  .el-tabs__header {
    padding-top: 0;
    margin-bottom: 20px;

    .el-tabs__nav-wrap::after {
      display: none;
    }
  }
}

.gridItem {
  margin-bottom: 0;
}

.suffixIcon {
  color: #9CA3AF;
  font-size: 16px;
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
    letter-spacing: 0;
    cursor: pointer;
  }
}
</style>

