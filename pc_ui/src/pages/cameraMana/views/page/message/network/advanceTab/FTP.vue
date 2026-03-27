<template>
  <div class="systemBasic">
    <el-form ref="ftpFormRef" class="sbForm" label-position="top" :model="form" :rules="rules">
      <el-form-item label="服务器地址">
        <el-input v-model="form.server_addr" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="端口">
        <el-input v-model="form.port" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.user_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入" show-password />
      </el-form-item>
      <el-form-item label="密码确认" prop="password_confirmation">
        <el-input v-model="form.password_confirmation" type="password" placeholder="请输入" show-password />
      </el-form-item>
      <el-form-item label="结构目录">
        <el-select v-model="form.structure_catalog" placeholder="请选择" class="full-select">
          <el-option label="保存在根目录" value="保存在根目录" />
        </el-select>
      </el-form-item>
      <el-form-item label="图片归档间隔（天）">
        <el-select v-model="form.picture_archiving_interval" placeholder="请选择" class="full-select">
          <el-option label="关闭" value="关闭" />
        </el-select>
      </el-form-item>
      <el-form-item label="图片名">
        <el-select v-model="form.picture_name" placeholder="请选择" class="full-select">
          <el-option label="默认" value="默认" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.upload_picture">
          上传图片
        </el-checkbox>
      </el-form-item>
      <div class="test-button-wrapper">
        <button class="test-button" type="button">
          <oort-svg-icon width="16" height="16" name="cs2" />
          <span>测试</span>
        </button>
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
import { getFtp, saveFtp } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const store: any = useUserStore()

const ftpFormRef = ref<FormInstance>()

const form = ref({
  server_addr: '',
  port: '',
  user_name: '',
  password: '',
  password_confirmation: '',
  structure_catalog: '',
  picture_archiving_interval: '',
  picture_name: '',
  upload_picture: false
})

const rules = ref<FormRules>({
  password_confirmation: [
    {
      validator: (_rule, value, callback) => {
        const confirm = value ?? ''
        if (confirm === '') return callback()
        if (confirm !== (form.value.password ?? '')) return callback(new Error('两次输入的密码不一致'))
        return callback()
      },
      trigger: ['blur']
    }
  ]
})

const fetchFtp = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getFtp(params)
  if (res.code === 200 && res.data) {
    form.value = res.data
  }
}

const handleSave = async() => {
  const valid = await ftpFormRef.value?.validate().catch(() => false)
  if (!valid) return
  const params = {
    accessToken: store.userInfo?.accessToken,
    server_addr: form.value.server_addr,
    port: form.value.port,
    user_name: form.value.user_name,
    password: form.value.password,
    password_confirmation: form.value.password_confirmation,
    structure_catalog: form.value.structure_catalog,
    picture_archiving_interval: form.value.picture_archiving_interval,
    picture_name: form.value.picture_name,
    upload_picture: !!form.value.upload_picture
  }
  const res: any = await saveFtp(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchFtp()
  }
}

onMounted(() => {
  fetchFtp()
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

.test-button-wrapper {
  margin-bottom: 20px;
}

.test-button {
  background: var(--el-color-primary-hb);
  border: 1px solid var(--el-color-primary);
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
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
