<template>
  <div class="systemBasic">
    <el-form
      ref="ieeeFormRef"
      class="sbForm"
      label-position="top"
      :model="form"
      :rules="rules"
    >
      <el-form-item>
        <el-checkbox v-model="form.enable">
          启用IEE 802.1X
        </el-checkbox>
      </el-form-item>
      <el-form-item label="协议类型">
        <el-select v-model="form.protocolType" placeholder="请选择" class="full-select">
          <el-option label="EAP-MD5" value="EAP-MD5" />
        </el-select>
      </el-form-item>
      <el-form-item label="EAPOL版本">
        <el-select v-model="form.eapolVersion" placeholder="请选择" class="full-select">
          <el-option label="1" value="1" />
          <el-option label="2.0" value="2.0" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.username" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="密码确认" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" placeholder="请输入" />
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
import { get8021x, save8021x } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const store: any = useUserStore()

const ieeeFormRef = ref<FormInstance>()

const form = ref({
  enable: true,
  protocolType: 'EAP-MD5',
  eapolVersion: '1',
  username: '',
  password: '',
  confirmPassword: ''
})

const rules = ref<FormRules>({
  confirmPassword: [
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

const fetch8021x = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await get8021x(params)
  if (res.code === 200 && res.data) {
    form.value.enable = !!res.data.iee
    form.value.protocolType = res.data.protocol_type ?? 'EAP-MD5'
    form.value.eapolVersion = res.data.EAPOL_version ?? '1'
    form.value.username = res.data.user_name ?? ''
    form.value.password = res.data.password ?? ''
    form.value.confirmPassword = res.data.password_confirmation ?? ''
  }
}

const handleSave = async() => {
  const valid = await ieeeFormRef.value?.validate().catch(() => false)
  if (!valid) return
  const params = {
    accessToken: store.userInfo?.accessToken,
    iee: form.value.enable,
    protocol_type: form.value.protocolType,
    EAPOL_version: form.value.eapolVersion,
    user_name: form.value.username,
    password: form.value.password,
    password_confirmation: form.value.confirmPassword
  }
  const res: any = await save8021x(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetch8021x()
  }
}

onMounted(() => {
  fetch8021x()
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

  .full-select {
    width: 100%;

    :deep(.el-input__wrapper) {
      height: 40px !important;
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
