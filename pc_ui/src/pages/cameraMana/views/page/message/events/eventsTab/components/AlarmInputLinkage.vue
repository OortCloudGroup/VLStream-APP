<template>
  <div class="alarmInputLinkage">
    <div class="linkage-container">
      <!-- 第一列：常规联动 -->
      <div class="linkage-column">
        <div class="column-header">
          <el-checkbox v-model="form.regularHeader" @change="handleRegularLinkageChange" />
          常规联动
        </div>
        <div class="column-content">
          <div class="checkbox-item">
            <el-checkbox v-model="form.emailLinkage" @change="handleRegularLinkageItemChange">
              邮件联动
            </el-checkbox>
          </div>
          <div class="checkbox-item">
            <el-checkbox v-model="form.uploadCenter" @change="handleRegularLinkageItemChange">
              上传中心
            </el-checkbox>
          </div>
          <div class="checkbox-item">
            <el-checkbox v-model="form.uploadFtpSdNas" @change="handleRegularLinkageItemChange">
              上传 FTP / SD 卡 / NAS
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- 第二列：联动报警输出 -->
      <div class="linkage-column">
        <div class="column-header">
          <el-checkbox v-model="form.alarmOutputHeader" @change="handleAlarmOutputChange" />
          联动报警输出
        </div>
        <div class="column-content">
          <div class="checkbox-item">
            <el-checkbox v-model="form.alarmOutput" @change="handleAlarmOutputItemChange">
              A->1
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- 第三列：录像联动 -->
      <div class="linkage-column">
        <div class="column-header">
          <el-checkbox v-model="form.recordingHeader" @change="handleRecordingLinkageChange" />
          录像联动
        </div>
        <div class="column-content">
          <div class="checkbox-item">
            <el-checkbox v-model="form.recordingLinkage" @change="handleRecordingLinkageItemChange">
              A1
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- 第四列：PTZ联动通道 -->
      <div class="linkage-column">
        <div class="column-header">
          PTZ联动通道
          <el-select v-model="form.ptzChannel" placeholder="请选择" class="selectLike header-select">
            <el-option label="A1" value="A1" />
            <el-option label="A2" value="A2" />
          </el-select>
        </div>
        <div class="column-content">
          <div class="input-item">
            <div class="input-label-with-checkbox">
              <el-checkbox v-model="form.presetNumberEnabled" />
              <span>预置点序号</span>
            </div>
            <el-select v-model="form.presetNumber" placeholder="请选择" class="selectLike">
              <el-option label="1" value="1" />
              <el-option label="2" value="2" />
              <el-option label="3" value="3" />
            </el-select>
          </div>
          <div class="input-item">
            <div class="input-label-with-checkbox">
              <el-checkbox v-model="form.dwellTimeEnabled" />
              <span>停留时间</span>
            </div>
            <div class="dwellTimeWrapper">
              <el-select v-model="form.dwellTime" placeholder="请选择" class="dwellTimeSelect">
                <el-option label="5" value="5" />
                <el-option label="10" value="10" />
                <el-option label="15" value="15" />
                <el-option label="30" value="30" />
                <el-option label="60" value="60" />
              </el-select>
              <span class="unit-text">秒</span>
            </div>
          </div>
          <div class="input-item">
            <div class="input-label-with-checkbox">
              <el-checkbox v-model="form.cruiseNumberEnabled" />
              <span>巡航序号</span>
            </div>
            <el-select v-model="form.cruiseNumber" placeholder="请选择" class="selectLike">
              <el-option label="1" value="1" />
              <el-option label="2" value="2" />
              <el-option label="3" value="3" />
            </el-select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, nextTick } from 'vue'

interface LinkageMode {
  regular_linkage: boolean
  email_linkage: boolean
  upload_center: boolean
  upload_ftp_sd_card_nas: boolean
  linkage_alarm_output: boolean
  A_1: boolean
  linkage_video: boolean
  A1: boolean
  ptz_linkage_channel: string
  preset_point_number: boolean
  preset_point_value: number
  residence_time: string
  cruise_serial_number: boolean
  cruise_serial_value: number
}

const props = defineProps<{
  linkageMode?: LinkageMode
}>()

const emit = defineEmits<{
  'update:linkage-mode': [value: LinkageMode]
}>()

const form = reactive({
  regularHeader: false,
  emailLinkage: false,
  uploadCenter: false,
  uploadFtpSdNas: false,
  alarmOutputHeader: false,
  alarmOutput: false,
  recordingHeader: false,
  recordingLinkage: false,
  ptzChannel: 'A1',
  presetNumberEnabled: false,
  presetNumber: '1',
  dwellTimeEnabled: false,
  dwellTime: '0',
  cruiseNumberEnabled: false,
  cruiseNumber: '1'
})

const isUpdatingFromProps = ref(false)

const updateFormFromProps = (val: LinkageMode) => {
  isUpdatingFromProps.value = true
  form.regularHeader = val.regular_linkage || false
  form.emailLinkage = val.email_linkage || false
  form.uploadCenter = val.upload_center || false
  form.uploadFtpSdNas = val.upload_ftp_sd_card_nas || false
  form.alarmOutputHeader = val.linkage_alarm_output || false
  form.alarmOutput = val.A_1 || false
  form.recordingHeader = val.linkage_video || false
  form.recordingLinkage = val.A1 || false
  form.ptzChannel = val.ptz_linkage_channel || 'A1'
  form.presetNumberEnabled = val.preset_point_number || false
  if (val.preset_point_number) {
    form.presetNumber = String(val.preset_point_value || 1)
  }
  if (val.residence_time && val.residence_time !== '0') {
    form.dwellTimeEnabled = true
    form.dwellTime = val.residence_time
  } else if (val.residence_time === '0') {
    form.dwellTimeEnabled = false
  } else {
    form.dwellTimeEnabled = false
    form.dwellTime = '0'
  }
  form.cruiseNumberEnabled = val.cruise_serial_number || false
  if (val.cruise_serial_number) {
    form.cruiseNumber = String(val.cruise_serial_value || 1)
  }
  nextTick(() => {
    isUpdatingFromProps.value = false
  })
}

watch(
  () => props.linkageMode,
  (val) => {
    if (val) {
      updateFormFromProps(val)
    }
  },
  { immediate: true, deep: true }
)

watch(
  () => [
    form.regularHeader,
    form.emailLinkage,
    form.uploadCenter,
    form.uploadFtpSdNas,
    form.alarmOutputHeader,
    form.alarmOutput,
    form.recordingHeader,
    form.recordingLinkage,
    form.ptzChannel,
    form.presetNumberEnabled,
    form.presetNumber,
    form.dwellTimeEnabled,
    form.dwellTime,
    form.cruiseNumberEnabled,
    form.cruiseNumber
  ],
  () => {
    if (isUpdatingFromProps.value) {
      return
    }
    if (!props.linkageMode) {
      return
    }
    nextTick(() => {
      const updated: LinkageMode = {
        regular_linkage: form.regularHeader,
        email_linkage: form.emailLinkage,
        upload_center: form.uploadCenter,
        upload_ftp_sd_card_nas: form.uploadFtpSdNas,
        linkage_alarm_output: form.alarmOutputHeader,
        A_1: form.alarmOutput,
        linkage_video: form.recordingHeader,
        A1: form.recordingLinkage,
        ptz_linkage_channel: form.ptzChannel,
        preset_point_number: form.presetNumberEnabled,
        preset_point_value: Number(form.presetNumber),
        residence_time: form.dwellTimeEnabled ? form.dwellTime : '0',
        cruise_serial_number: form.cruiseNumberEnabled,
        cruise_serial_value: Number(form.cruiseNumber)
      }
      emit('update:linkage-mode', updated)
    })
  }
)

const handleRegularLinkageChange = (checked: boolean) => {
  form.emailLinkage = checked
  form.uploadCenter = checked
  form.uploadFtpSdNas = checked
}

const handleAlarmOutputChange = (checked: boolean) => {
  form.alarmOutput = checked
}

const handleRecordingLinkageChange = (checked: boolean) => {
  form.recordingLinkage = checked
}

const handleRegularLinkageItemChange = () => {
  form.regularHeader = form.emailLinkage && form.uploadCenter && form.uploadFtpSdNas
}

const handleAlarmOutputItemChange = () => {
  form.alarmOutputHeader = form.alarmOutput
}

const handleRecordingLinkageItemChange = () => {
  form.recordingHeader = form.recordingLinkage
}
</script>

<style lang="scss" scoped>
.alarmInputLinkage {
  width: 100%;
}

.linkage-container {
  width: 1160px;
  display: flex;
  gap: 0;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #E5E7EB;
}

.linkage-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #E5E7EB;

  &:last-child {
    border-right: none;
  }

  .column-header {
    padding: 0 20px;
    height: 60px;
    font-size: 14px;
    color: #333;
    background-color: #F9FAFB;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    gap: 10px;

    :deep(.el-checkbox) {
      margin-right: 0;
    }
  }

  .column-content {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .checkbox-item {
      display: flex;
      align-items: center;

      :deep(.el-checkbox) {
        .el-checkbox__label {
          font-size: 14px;
          color: #333;
        }
      }
    }

    .input-item {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .input-label {
        font-size: 14px;
        color: #666;
      }

      .input-label-with-checkbox {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        color: #666;

        :deep(.el-checkbox) {
          margin-right: 0;
        }
      }
    }
  }
}

.selectLike {
  width: 100%;

  :deep(.el-select__wrapper) {
    height: 44px;
    border-radius: 6px;
    box-shadow: 0 0 0 1px #E5E7EB inset;
  }
}

.header-select {
  width: 140px;
}

.dwellTimeWrapper {
  display: flex;
  align-items: center;
  gap: 8px;

  .dwellTimeSelect {
    flex: 1;

    :deep(.el-select__wrapper) {
      height: 44px;
      border-radius: 6px;
      box-shadow: 0 0 0 1px #E5E7EB inset;
    }
  }

  .unit-text {
    font-size: 14px;
    color: #6B7280;
    white-space: nowrap;
  }
}
</style>
