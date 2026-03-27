<template>
  <div>
    <el-form ref="sbForm" label-position="top" class="sbForm" :model="form">
      <el-form-item label="设备名称">
        <el-input v-model="form.device_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="设备编号">
        <el-input v-model="form.device_num" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="设备型号">
        <el-input v-model="form.device_type" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="设备序列号">
        <el-input v-model="form.device_serial_number" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="主控版本">
        <el-input v-model="form.master_version" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="编码版本">
        <el-input v-model="form.encoded_version" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="Web版本">
        <el-input v-model="form.web_version" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="Plugin版本">
        <el-input v-model="form.plugin_version" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="通道个数">
        <el-input v-model="form.channel_num" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="硬盘个数">
        <el-input v-model="form.hard_disk_num" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="报警输入个数">
        <el-input v-model="form.alarm_input_num" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="报警输出个数">
        <el-input v-model="form.alarm_output_num" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="主控版本属性">
        <el-input v-model="form.master_version_mode" placeholder="请输入" />
      </el-form-item>
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
import { getBasicInfo, saveBasicInfo } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  device_name: '',
  device_num: '',
  device_type: '',
  device_serial_number: '',
  master_version: '',
  encoded_version: '',
  web_version: '',
  plugin_version: '',
  channel_num: '',
  hard_disk_num: '',
  alarm_input_num: '',
  alarm_output_num: '',
  master_version_mode: ''
})

const fetchBasicInfo = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await getBasicInfo(params)
  if (res.code === 200 && res.data) {
    form.value = res.data
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    device_name: form.value.device_name,
    device_num: form.value.device_num,
    device_type: form.value.device_type,
    device_serial_number: form.value.device_serial_number,
    master_version: form.value.master_version,
    encoded_version: form.value.encoded_version,
    web_version: form.value.web_version,
    plugin_version: form.value.plugin_version,
    channel_num: Number(form.value.channel_num) || 0,
    hard_disk_num: Number(form.value.hard_disk_num) || 0,
    alarm_input_num: Number(form.value.alarm_input_num) || 0,
    alarm_output_num: Number(form.value.alarm_output_num) || 0,
    master_version_mode: form.value.master_version_mode
  }
  const res = await saveBasicInfo(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchBasicInfo()
  }
}

onMounted(() => {
  fetchBasicInfo()
})
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
