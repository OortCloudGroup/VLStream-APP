<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="IP地址">
        <el-input v-model="form.ip" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="码流类型">
        <el-select v-model="form.code_stream_type" placeholder="请选择" class="full-select">
          <el-option label="主码流" value="主码流" />
          <el-option label="子码流" value="子码流" />
          <el-option label="第三码流" value="第三码流" />
        </el-select>
      </el-form-item>
      <el-form-item label="视频端口">
        <el-input v-model="form.video_port" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="音频端口">
        <el-input v-model="form.audio_port" placeholder="请输入" />
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
import { getMulticast, saveMulticast } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  ip: '',
  code_stream_type: '主码流',
  video_port: '',
  audio_port: ''
})

const fetchMulticast = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getMulticast(params)
  if (res.code === 200 && res.data) {
    form.ip = res.data.ip || ''
    form.code_stream_type = res.data.code_stream_type || '主码流'
    form.video_port = res.data.video_port || ''
    form.audio_port = res.data.audio_port || ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    ip: form.ip,
    code_stream_type: form.code_stream_type,
    video_port: form.video_port,
    audio_port: form.audio_port
  }
  const res: any = await saveMulticast(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchMulticast()
  }
}

onMounted(() => {
  fetchMulticast()
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

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
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
