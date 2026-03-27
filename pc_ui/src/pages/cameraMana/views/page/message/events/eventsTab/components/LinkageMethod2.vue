<template>
  <div class="linkageMethod">
    <div class="linkage-container">
      <!-- 第一列：常规联动 -->
      <div class="linkage-column">
        <div class="column-header">
          <el-checkbox v-model="form.regular_linkage" @change="handleRegularLinkageChange" />
          常规联动
        </div>
        <div class="column-content">
          <div class="checkbox-item">
            <el-checkbox v-model="form.email_linkage" @change="handleRegularLinkageItemChange">
              邮件联动
            </el-checkbox>
          </div>
          <div class="checkbox-item">
            <el-checkbox v-model="form.upload_center" @change="handleRegularLinkageItemChange">
              上传中心
            </el-checkbox>
          </div>
          <div class="checkbox-item">
            <el-checkbox v-model="form.upload_ftp_sd_card_nas" @change="handleRegularLinkageItemChange">
              上传 FTP / SD 卡 / NAS
            </el-checkbox>
          </div>
        </div>
      </div>

      <!-- 第二列：联动报警输出 -->
      <div class="linkage-column">
        <div class="column-header">
          <el-checkbox v-model="form.linkage_alarm_output" @change="handleAlarmOutputChange" />
          联动报警输出
        </div>
        <div class="column-content">
          <div class="checkbox-item">
            <el-checkbox v-model="form.A_1" @change="handleAlarmOutputItemChange">
              A->1
            </el-checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'

interface LinkageMode {
  regular_linkage: boolean
  linkage_alarm_output: boolean
  email_linkage: boolean
  upload_center: boolean
  upload_ftp_sd_card_nas: boolean
  A_1: boolean
}

const props = defineProps<{
  linkageMode?: LinkageMode
}>()

const emit = defineEmits<{
  'update:linkage-mode': [value: LinkageMode]
}>()

const form = reactive<LinkageMode>({
  regular_linkage: false,
  linkage_alarm_output: false,
  email_linkage: false,
  upload_center: false,
  upload_ftp_sd_card_nas: false,
  A_1: false
})

// 监听 props 变化，更新 form
watch(
  () => props.linkageMode,
  (val) => {
    if (val) {
      Object.assign(form, val)
    }
  },
  { immediate: true, deep: true }
)

// 监听 form 变化，同步到父组件
watch(
  () => form,
  (val) => {
    if (props.linkageMode) {
      emit('update:linkage-mode', { ...val })
    }
  },
  { deep: true }
)

// 处理常规联动列头变化
const handleRegularLinkageChange = (checked: boolean) => {
  form.email_linkage = checked
  form.upload_center = checked
  form.upload_ftp_sd_card_nas = checked
}

// 处理联动报警输出列头变化
const handleAlarmOutputChange = (checked: boolean) => {
  form.A_1 = checked
}

// 处理常规联动子项变化
const handleRegularLinkageItemChange = () => {
  form.regular_linkage = form.email_linkage && form.upload_center && form.upload_ftp_sd_card_nas
}

// 处理联动报警输出子项变化
const handleAlarmOutputItemChange = () => {
  form.linkage_alarm_output = form.A_1
}
</script>

<style lang="scss" scoped>
.linkageMethod {
  width: 100%;
}

.linkage-container {
  width: 600px;
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
</style>
