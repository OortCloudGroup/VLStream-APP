<template>
  <div class="systemBasic">
    <el-form ref="sbForm" class="sbForm" label-position="top" :model="form" :rules="rules">
      <el-form-item>
        <el-checkbox v-model="form.ddns">
          启用DDNS
        </el-checkbox>
      </el-form-item>
      <el-form-item label="DDNS类型">
        <el-select v-model="form.ddns_type" placeholder="请选择" class="full-select">
          <el-option label="花生壳" value="Oray" />
          <el-option label="DynDNS" value="DyDNS" />
          <el-option label="No-IP" value="No-IP" />
          <el-option label="3322" value="3322" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务器地址">
        <el-input v-model="form.server_addr" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="域名">
        <el-input v-model="form.domain_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.user_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" placeholder="请输入" show-password />
      </el-form-item>
      <el-form-item label="密码确认" prop="password_confirmation">
        <el-input v-model="form.password_confirmation" placeholder="请输入" show-password />
      </el-form-item>
      <el-form-item label="端口">
        <el-input v-model="form.port" placeholder="请输入" />
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
import { onMounted, reactive, ref } from 'vue'
import { getDdns, saveDdns } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const store: any = useUserStore()
const sbForm = ref<FormInstance>()

const form = reactive({
  ddns: false,
  ddns_type: 'DyDNS',
  server_addr: '',
  domain_name: '',
  user_name: '',
  password: '',
  password_confirmation: '',
  port: ''
})

const validatePasswordConfirmation: FormRules['password_confirmation'][number]['validator'] = (_rule, value, callback) => {
  const password = form.password || ''
  const confirmation = value || ''
  if (!password && !confirmation) return callback()
  if (password !== confirmation) return callback(new Error('密码与密码确认不一致'))
  callback()
}

const rules = ref<FormRules>({
  password_confirmation: [{ validator: validatePasswordConfirmation, trigger: 'blur' }]
})

const fetchDdns = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getDdns(params)
  if (res.code === 200 && res.data) {
    form.ddns = !!res.data.ddns
    form.ddns_type = res.data.ddns_type || 'DyDNS'
    form.server_addr = res.data.server_addr || ''
    form.domain_name = res.data.domain_name || ''
    form.user_name = res.data.user_name || ''
    form.password = res.data.password || ''
    form.password_confirmation = res.data.password_confirmation || ''
    form.port = res.data.port || ''
  }
}

const handleSave = async() => {
  const valid = await sbForm.value?.validate().catch(() => false)
  if (!valid) return
  const params = {
    accessToken: store.userInfo?.accessToken,
    ddns: !!form.ddns,
    ddns_type: form.ddns_type,
    server_addr: form.server_addr,
    domain_name: form.domain_name,
    user_name: form.user_name,
    password: form.password,
    password_confirmation: form.password_confirmation,
    port: form.port
  }
  const res: any = await saveDdns(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchDdns()
  }
}

onMounted(() => {
  fetchDdns()
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
