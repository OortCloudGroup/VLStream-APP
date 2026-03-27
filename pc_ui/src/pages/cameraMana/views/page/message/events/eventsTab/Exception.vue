<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="异常类型">
        <el-select v-model="form.exceptionType" placeholder="请选择" class="exceptionTypeSelect">
          <el-option label="硬盘满" value="disk_full" />
          <el-option label="硬盘错误" value="disk_error" />
          <el-option label="网络断开" value="network_disconnect" />
        </el-select>
      </el-form-item>
    </el-form>

    <div class="linkageMethod">
      <div class="linkage-container">
        <!-- 常规联动 -->
        <div class="linkage-column">
          <div class="column-header">
            <el-checkbox v-model="form.regularHeader" @change="handleRegularHeaderChange" />
            常规联动
          </div>
          <div class="column-content">
            <div class="checkbox-item">
              <el-checkbox v-model="form.emailLinkage" @change="handleRegularItemChange">
                邮件联动
              </el-checkbox>
            </div>
            <div class="checkbox-item">
              <el-checkbox v-model="form.uploadCenter" @change="handleRegularItemChange">
                上传中心
              </el-checkbox>
            </div>
          </div>
        </div>

        <!-- 联动报警输出 -->
        <div class="linkage-column">
          <div class="column-header">
            <el-checkbox v-model="form.alarmOutputHeader" @change="handleAlarmOutputHeaderChange" />
            联动报警输出
          </div>
          <div class="column-content">
            <div class="checkbox-item">
              <el-checkbox v-model="form.alarmOutputA1" @change="handleAlarmOutputItemChange">
                A->1
              </el-checkbox>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { getException, saveException } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const exceptionTypeMap: Record<string, string> = {
  disk_full: '硬盘满',
  disk_error: '硬盘错误',
  network_disconnect: '网络断开'
}

const exceptionTypeMapReverse: Record<string, string> = {
  '硬盘满': 'disk_full',
  '硬盘错误': 'disk_error',
  '网络断开': 'network_disconnect'
}

const form = reactive({
  exceptionType: 'disk_full',
  regularHeader: false,
  emailLinkage: false,
  uploadCenter: false,
  alarmOutputHeader: false,
  alarmOutputA1: false
})

const fetchException = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getException(params)
  if (res.code === 200 && res.data) {
    form.exceptionType = exceptionTypeMapReverse[res.data.exception_type] || 'disk_full'
    form.regularHeader = res.data.regular_linkage ?? false
    form.emailLinkage = res.data.email_linkage ?? false
    form.uploadCenter = res.data.upload_center ?? false
    form.alarmOutputHeader = res.data.linkage_alarm_output ?? false
    form.alarmOutputA1 = res.data.A_1 ?? false
  }
}

const handleSave = async() => {
  const params = {
    exception_type: exceptionTypeMap[form.exceptionType] || '硬盘满',
    regular_linkage: form.regularHeader,
    linkage_alarm_output: form.alarmOutputHeader,
    email_linkage: form.emailLinkage,
    upload_center: form.uploadCenter,
    A_1: form.alarmOutputA1,
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await saveException(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchException()
  }
}

const handleRegularHeaderChange = (checked: boolean) => {
  form.emailLinkage = checked
  form.uploadCenter = checked
}

const handleRegularItemChange = () => {
  form.regularHeader = form.emailLinkage && form.uploadCenter
}

const handleAlarmOutputHeaderChange = (checked: boolean) => {
  form.alarmOutputA1 = checked
}

const handleAlarmOutputItemChange = () => {
  form.alarmOutputHeader = form.alarmOutputA1
}

onMounted(() => {
  fetchException()
})
</script>

<style lang="scss" scoped>
.systemBasic {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    width: 480px;

    :deep(.el-form-item__label) {
      color: #666;
      font-size: 14px;
    }

    :deep(.el-select__wrapper) {
      height: 44px;
      border-radius: 6px;
      box-shadow: 0 0 0 1px #E5E7EB inset;
    }
  }
}

.exceptionTypeSelect {
  width: 100%;

  :deep(input) {
    cursor: pointer;
  }
}

// 联动方式（模仿 LinkageMethod）
.linkageMethod {
  margin-top: 18px;
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

