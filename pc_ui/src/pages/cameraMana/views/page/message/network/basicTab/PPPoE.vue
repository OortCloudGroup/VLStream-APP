<template>
  <div class="systemBasic">
    <el-form ref="sbForm" class="sbForm" label-position="top" :model="form" :rules="rules">
      <el-form-item>
        <el-checkbox v-model="form.pppoe">
          启用PPPoE
        </el-checkbox>
      </el-form-item>
      <el-form-item label="设备动态IP">
        <el-input v-model="form.device_dynamics_ip" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.user_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password" show-password placeholder="请输入" />
      </el-form-item>
      <el-form-item label="密码确认" prop="password_confirmation">
        <el-input v-model="form.password_confirmation" type="password" show-password placeholder="请输入" />
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
import { getPppoe, savePppoe } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const store: any = useUserStore()

const sbForm = ref<FormInstance>()

const form = ref({
  pppoe: false,
  device_dynamics_ip: '',
  user_name: '',
  password: '',
  password_confirmation: ''
})

const validatePasswordConfirmation = (_rule: any, value: any, callback: any) => {
  const password = form.value.password || ''
  const confirmation = value || ''
  if (!password && !confirmation) return callback()
  if (password !== confirmation) return callback(new Error('密码与密码确认不一致'))
  callback()
}

const rules = ref<FormRules>({
  password_confirmation: [{ validator: validatePasswordConfirmation, trigger: 'blur' }]
})

const fetchPppoe = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getPppoe(params)
  if (res.code === 200 && res.data) {
    form.value = {
      pppoe: !!res.data.pppoe,
      device_dynamics_ip: res.data.device_dynamics_ip || '',
      user_name: res.data.user_name || '',
      password: res.data.password || '',
      password_confirmation: res.data.password_confirmation || ''
    }
  }
}

const handleSave = async() => {
  const valid = await sbForm.value?.validate().catch(() => false)
  if (!valid) return
  const params = {
    accessToken: store.userInfo?.accessToken,
    pppoe: form.value.pppoe,
    device_dynamics_ip: form.value.device_dynamics_ip,
    user_name: form.value.user_name,
    password: form.value.password,
    password_confirmation: form.value.password_confirmation
  }
  const res: any = await savePppoe(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchPppoe()
  }
}

onMounted(() => {
  fetchPppoe()
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
