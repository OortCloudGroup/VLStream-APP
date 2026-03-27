<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <el-form label-position="top" class="sbForm" :model="form">
      <el-form-item label="时区">
        <el-select v-model="form.timezone" placeholder="请选择时区" class="timezone-select">
          <el-option
            v-for="item in timezoneOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="校时">
        <el-radio-group v-model="form.time">
          <el-radio :label="1">
            NTP校时
          </el-radio>
          <el-radio :label="2">
            手动校时
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <div v-if="form.time===1">
        <el-form-item label="服务器地址">
          <el-input v-model="form.server_addr" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="NTP端口">
          <el-input v-model="form.NTP_port" placeholder="请输入" />
        </el-form-item>
        <div class="cs">
          <el-form-item label="校时时间间隔">
            <div class="sync-interval-wrapper">
              <el-input v-model="form.syncInterval" placeholder="请输入" class="sync-interval-input">
                <template #suffix>
                  <span class="sync-interval-unit">分钟</span>
                </template>
              </el-input>
            </div>
          </el-form-item>
          <button class="test-button" type="button">
            <oort-svg-icon width="16" height="16" name="cs2" />
            <span>测试</span>
          </button>
        </div>
      </div>
      <div v-if="form.time===2">
        <el-form-item label="设备时间">
          <el-date-picker
            v-model="form.deviceTime"
            type="datetime"
            placeholder="请选择时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            disabled
            style="width: 100%;"
            class="sync-interval-input"
          />
        </el-form-item>
        <div class="cs2">
          <el-form-item label="设置时间">
            <div class="sync-interval-wrapper">
              <el-date-picker
                v-model="form.setTime"
                type="datetime"
                placeholder="请选择时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="sync-interval-input"
              />
            </div>
          </el-form-item>
          <el-checkbox v-model="form.syncWithComputer" class="sync-checkbox">
            与计算机时间同步
          </el-checkbox>
        </div>
      </div>
    </el-form>
    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getTimeConfig, saveTimeConfig } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  timezone: '',
  time: 1,
  server_addr: '',
  NTP_port: '',
  syncInterval: '',
  deviceTime: '',
  setTime: '',
  syncWithComputer: false
})

const fetchTimeConfig = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await getTimeConfig(params)
  if (res.code === 200 && res.data) {
    form.value.timezone = res.data.time_zone || ''
    // calibration_time: "NTP" -> 1, 其他 -> 2
    form.value.time = res.data.calibration_time === 'NTP' ? 1 : 2
    form.value.server_addr = res.data.server_addr || ''
    form.value.NTP_port = res.data.NTP_port || ''
    form.value.syncInterval = res.data.calibration_time_gap || ''
    form.value.deviceTime = res.data.device_time || ''
    form.value.setTime = res.data.set_time || ''
    form.value.syncWithComputer = res.data.sync_with_computer_time || false
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    time_zone: form.value.timezone,
    calibration_time: form.value.time === 1 ? 'NTP' : '手动',
    server_addr: form.value.server_addr,
    NTP_port: form.value.NTP_port,
    calibration_time_gap: form.value.syncInterval,
    device_time: form.value.deviceTime,
    set_time: form.value.setTime,
    sync_with_computer_time: form.value.syncWithComputer
  }
  const res = await saveTimeConfig(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchTimeConfig()
  }
}

onMounted(() => {
  fetchTimeConfig()
})

const timezoneOptions = [
  { label: '(GMT+08:00) 北京、乌鲁木齐、新加坡、珀斯', value: 'GMT+08:00' },
  { label: '(GMT+09:00) 首尔、东京', value: 'GMT+09:00' },
  { label: '(GMT+00:00) 伦敦、都柏林', value: 'GMT+00:00' },
  { label: '(GMT-05:00) 纽约、华盛顿', value: 'GMT-05:00' },
  { label: '(GMT+01:00) 巴黎、柏林', value: 'GMT+01:00' }
]
</script>

<style lang="scss" scoped>
.sbForm {
  .el-input {
    height: 40px !important;
  }

  .el-select {
    width: 100%;
  }
}

.timezone-select {
  width: 100%;
}

.sync-interval-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100% !important;

  .sync-interval-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      height: 40px !important;
    }
  }
}

:deep(.sync-interval-wrapper .el-input) {
  width: 100% !important;
}

.cs {
  width: 116%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cs2 {
  width: 126%;
  display: flex;
  align-items: center;
  gap: 16px;
}

.test-button {
  background: var(--el-color-primary-hb);
  border: 1px solid var(--el-color-primary);
  border-radius: 20px;
  padding: 10px 16px;
  margin-top: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  span {
    font-size: 14px;
    color: var(--el-color-primary);
  }
}

:deep(.sync-interval-unit) {
  font-size: 14px;
  color: #333333;
  white-space: nowrap;
  padding-right: 8px;
}

.sync-checkbox {
  white-space: nowrap;
  margin-top: 10px;
}

:deep(.sync-interval-input) {
  height: 40px !important;

  &.el-date-editor {
    height: 40px !important;
  }

  .el-input__wrapper {
    height: 40px !important;
  }

  .el-input__inner {
    height: 40px !important;
    line-height: 40px !important;
  }
}

:deep(.sync-interval-wrapper .el-date-editor) {
  height: 40px !important;

  .el-input__wrapper {
    height: 40px !important;
  }
}

.asterisk-left{
  flex: 1;
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
