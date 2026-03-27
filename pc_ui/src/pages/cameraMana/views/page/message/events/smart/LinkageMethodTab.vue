<template>
  <div class="linkageMethodTab">
    <div class="linkage-container">
      <!-- 第一列：常规联动 -->
      <div class="linkage-column">
        <div class="column-header">
          <el-checkbox v-model="regularHeader" @change="handleRegularLinkageChange" />
          常规联动
        </div>
        <div class="column-content">
          <div class="checkbox-item">
            <el-checkbox v-model="emailLinkage" @change="handleRegularLinkageItemChange">
              邮件联动
            </el-checkbox>
          </div>
          <div class="checkbox-item">
            <el-checkbox v-model="uploadCenter" @change="handleRegularLinkageItemChange">
              上传中心
            </el-checkbox>
          </div>
          <div class="checkbox-item">
            <el-checkbox v-model="uploadFtpSdNas" @change="handleRegularLinkageItemChange">
              上传 FTP / SD 卡 / NAS
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- 第二列：联动报警输出 -->
      <div class="linkage-column">
        <div class="column-header">
          <el-checkbox v-model="alarmOutputHeader" @change="handleAlarmOutputChange" />
          联动报警输出
        </div>
        <div class="column-content">
          <div class="checkbox-item">
            <el-checkbox v-model="alarmOutputA1" @change="handleAlarmOutputItemChange">
              A->1
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- 第三列：录像联动 -->
      <div class="linkage-column">
        <div class="column-header">
          <el-checkbox v-model="recordingHeader" @change="handleVideoLinkageChange" />
          录像联动
        </div>
        <div class="column-content">
          <div class="checkbox-item">
            <el-checkbox v-model="recordingLinkageA1" @change="handleVideoLinkageItemChange">
              A1
            </el-checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface LinkageMode {
  regular_linkage: boolean
  email_linkage: boolean
  upload_center: boolean
  upload_ftp_sd_card_nas: boolean
  linkage_alarm_output: boolean
  A_1: boolean
  linkage_video: boolean
  A1: boolean
}

const props = defineProps<{
  linkageMode?: LinkageMode
}>()

const emit = defineEmits<{
  'update:linkage-mode': [value: LinkageMode]
}>()

const defaultLinkageMode: LinkageMode = {
  regular_linkage: false,
  email_linkage: false,
  upload_center: false,
  upload_ftp_sd_card_nas: false,
  linkage_alarm_output: false,
  A_1: false,
  linkage_video: false,
  A1: false
}

const form = computed({
  get: () => props.linkageMode || defaultLinkageMode,
  set: (val) => {
    emit('update:linkage-mode', val)
  }
})

// 映射字段到表单
const regularHeader = computed({
  get: () => form.value.regular_linkage,
  set: (val) => {
    emit('update:linkage-mode', { ...form.value, regular_linkage: val })
  }
})

const emailLinkage = computed({
  get: () => form.value.email_linkage,
  set: (val) => {
    emit('update:linkage-mode', { ...form.value, email_linkage: val })
  }
})

const uploadCenter = computed({
  get: () => form.value.upload_center,
  set: (val) => {
    emit('update:linkage-mode', { ...form.value, upload_center: val })
  }
})

const uploadFtpSdNas = computed({
  get: () => form.value.upload_ftp_sd_card_nas,
  set: (val) => {
    emit('update:linkage-mode', { ...form.value, upload_ftp_sd_card_nas: val })
  }
})

const alarmOutputHeader = computed({
  get: () => form.value.linkage_alarm_output,
  set: (val) => {
    emit('update:linkage-mode', { ...form.value, linkage_alarm_output: val })
  }
})

const alarmOutputA1 = computed({
  get: () => form.value.A_1,
  set: (val) => {
    emit('update:linkage-mode', { ...form.value, A_1: val })
  }
})

const recordingHeader = computed({
  get: () => form.value.linkage_video,
  set: (val) => {
    emit('update:linkage-mode', { ...form.value, linkage_video: val })
  }
})

const recordingLinkageA1 = computed({
  get: () => form.value.A1,
  set: (val) => {
    emit('update:linkage-mode', { ...form.value, A1: val })
  }
})

// 处理常规联动列头变化
const handleRegularLinkageChange = (checked: boolean) => {
  emit('update:linkage-mode', {
    ...form.value,
    regular_linkage: checked,
    email_linkage: checked,
    upload_center: checked,
    upload_ftp_sd_card_nas: checked
  })
}

// 处理联动报警输出列头变化
const handleAlarmOutputChange = (checked: boolean) => {
  emit('update:linkage-mode', {
    ...form.value,
    linkage_alarm_output: checked,
    A_1: checked
  })
}

// 处理录像联动列头变化
const handleVideoLinkageChange = (checked: boolean) => {
  emit('update:linkage-mode', {
    ...form.value,
    linkage_video: checked,
    A1: checked
  })
}

// 处理常规联动子项变化
const handleRegularLinkageItemChange = () => {
  const allChecked = form.value.email_linkage && form.value.upload_center && form.value.upload_ftp_sd_card_nas
  emit('update:linkage-mode', {
    ...form.value,
    regular_linkage: allChecked
  })
}

// 处理联动报警输出子项变化
const handleAlarmOutputItemChange = () => {
  emit('update:linkage-mode', {
    ...form.value,
    linkage_alarm_output: form.value.A_1
  })
}

// 处理录像联动子项变化
const handleVideoLinkageItemChange = () => {
  emit('update:linkage-mode', {
    ...form.value,
    linkage_video: form.value.A1
  })
}
</script>

<style lang="scss" scoped>
.linkageMethodTab {
  width: 100%;
}

// 三列联动布局
.linkage-container {
  width: 880px;
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
    padding: 16px 20px;
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
  }
}

.saveRow {
  margin-top: 22px;
}

.saveBtn {
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
</style>
