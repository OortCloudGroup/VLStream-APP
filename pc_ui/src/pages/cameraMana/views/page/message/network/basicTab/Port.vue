<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="HTTP端口">
        <el-input v-model="form.http_port" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="RTSP端口">
        <el-input v-model="form.rtsp_port" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="HTTPS端口">
        <el-input v-model="form.https_port" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="服务端口">
        <el-input v-model="form.server_port" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="服务增强型端口">
        <el-input v-model="form.service_enhanced_port" placeholder="请输入" />
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
import { onMounted, reactive } from 'vue'
import { getPort, savePort } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  http_port: '',
  rtsp_port: '',
  https_port: '',
  server_port: '',
  service_enhanced_port: ''
})

const fetchPort = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getPort(params)
  if (res.code === 200 && res.data) {
    form.http_port = res.data.http_port || ''
    form.rtsp_port = res.data.rtsp_port || ''
    form.https_port = res.data.https_port || ''
    form.server_port = res.data.server_port || ''
    form.service_enhanced_port = res.data.service_enhanced_port || ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    http_port: form.http_port,
    rtsp_port: form.rtsp_port,
    https_port: form.https_port,
    server_port: form.server_port,
    service_enhanced_port: form.service_enhanced_port
  }
  const res: any = await savePort(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchPort()
  }
}

onMounted(() => {
  fetchPort()
})
</script>

<style lang="scss" scoped>
.systemBasic {
  padding-left: 20px;
  width: 480px;

  .sbForm {
    .el-input {
      height: 40px;
    }
  }
}

.submitBox {
  padding: 40px 0;

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
