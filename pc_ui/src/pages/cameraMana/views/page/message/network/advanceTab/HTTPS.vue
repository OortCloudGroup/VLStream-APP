<template>
  <div class="httpsPage">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.enable">
          启用
        </el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.autoRedirect">
          自动跳转HTTPS
        </el-checkbox>
      </el-form-item>
    </el-form>

    <!-- 证书详情 -->
    <div class="sectionTitle">
      <span class="line" />
      <span>证书详情</span>
    </div>

    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="已安装证书">
        <el-input
          v-model="form.installedCertificate"
          placeholder="请输入"
        />
      </el-form-item>

      <div class="cert-subtitle">
        属性
      </div>
      <el-form-item>
        <el-input
          v-model="form.desc"
          type="textarea"
          class="desc-textarea"
        />
      </el-form-item>
    </el-form>

    <!-- 导出按钮 -->
    <div class="export-section">
      <button class="export-btn" type="button" @click="handleExport">
        <oort-svg-icon width="16" height="16" name="dc" />
        <span>导出自签名证书</span>
      </button>
    </div>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getHttps, saveHttps, exportSelfSignedCertificate } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { downloadBlob } from '@/utils/downloadEx'

const store: any = useUserStore()

const form = ref({
  enable: false,
  autoRedirect: false,
  installedCertificate: '',
  desc: ''
})

// 导出自签名证书
const handleExport = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  try {
    const res: any = await exportSelfSignedCertificate(params)
    const blob = res instanceof Blob ? res : new Blob([res], { type: 'application/x-pem-file' })
    downloadBlob(blob, '导出自签名证书.pem')
    ElMessage.success('导出成功')
  } catch (_error) {
    ElMessage.error('导出失败')
  }
}

const fetchHttps = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getHttps(params)
  if (res.code === 200 && res.data) {
    form.value.enable = !!res.data.https
    form.value.autoRedirect = !!res.data.automatical_redirect
    form.value.installedCertificate = res.data.installed_certificate ?? ''
    form.value.desc = res.data.attribute ?? ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    https: !!form.value.enable,
    automatical_redirect: !!form.value.autoRedirect,
    installed_certificate: form.value.installedCertificate,
    attribute: form.value.desc
  }
  const res: any = await saveHttps(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchHttps()
  }
}

onMounted(() => {
  fetchHttps()
})
</script>

<style lang="scss" scoped>
.httpsPage {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    width: 480px;

    .el-input {
      height: 40px;
    }

    .desc-textarea {
      :deep(.el-textarea__inner) {
        height: 120px;
      }
    }
  }
}

.sectionTitle {
  margin: 24px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: var(--el-color-primary);

  .line {
    width: 3px;
    height: 18px;
    background: var(--el-color-primary);
  }
}

.cert-subtitle {
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
  margin-top: 16px;

  &:first-of-type {
    margin-top: 0;
  }
}

.export-section {
  margin-top: 24px;
  margin-bottom: 24px;
}

.export-btn {
  background: var(--el-color-primary-hb);
  border: 1px solid var(--el-color-primary);
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  span {
    font-size: 14px;
    color: var(--el-color-primary);
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
