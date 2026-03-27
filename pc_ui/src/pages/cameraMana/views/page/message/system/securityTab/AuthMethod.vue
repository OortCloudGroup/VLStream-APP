<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="authPage">
    <el-form ref="sbForm" label-position="top" class="sbForm" :model="form">
      <el-form-item label="RTSP认证">
        <el-select v-model="form.rtspAuth" placeholder="请选择" class="full-select">
          <el-option v-for="item in authOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="RTSP摘要算法">
        <el-select v-model="form.rtspDigest" placeholder="请选择" class="full-select">
          <el-option v-for="item in digestOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="WEB认证">
        <el-select v-model="form.webAuth" placeholder="请选择" class="full-select">
          <el-option v-for="item in authOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="WEB摘要算法">
        <el-select v-model="form.webDigest" placeholder="请选择" class="full-select">
          <el-option v-for="item in digestOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
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
import { ref } from 'vue'
import { onMounted } from 'vue'
import { getAuthentication, saveAuthentication } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  rtspAuth: '',
  rtspDigest: '',
  webAuth: '',
  webDigest: ''
})

const fetchAuthentication = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getAuthentication(params)
  if (res.code === 200 && res.data) {
    form.value.rtspAuth = res.data.RTSP_authentication || ''
    form.value.rtspDigest = res.data.RTSP_digest_algorithm || ''
    form.value.webAuth = res.data.WEB_authentication || ''
    form.value.webDigest = res.data.WEB_digest_algorithm || ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    RTSP_authentication: form.value.rtspAuth,
    RTSP_digest_algorithm: form.value.rtspDigest,
    WEB_authentication: form.value.webAuth,
    WEB_digest_algorithm: form.value.webDigest
  }
  const res: any = await saveAuthentication(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchAuthentication()
  }
}

onMounted(() => {
  fetchAuthentication()
})

const authOptions = [
  { label: 'dofsr', value: 'dofsr' }
]

const digestOptions = [
  { label: 'MD5', value: 'MD5' },
  { label: 'md5', value: 'md5' },
  { label: 'MD6', value: 'MD6' },
  { label: 'SHA-256', value: 'sha256' }
]
</script>

<style lang="scss" scoped>
.authPage {
  width: 100%;
}

.sbForm {
  .el-input {
    height: 40px;
  }

  .el-select {
    width: 100%;
  }
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.submitBox {
  padding: 40px 0 0;

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

