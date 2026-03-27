<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="编辑用户"
      width="45%"
      top="5vh"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" label-position="top" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="form.userType" placeholder="请选择" class="full-select">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="normal" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.userType === 'admin'" label="管理员密码" prop="adminPwd">
          <el-input v-model="form.adminPwd" placeholder="请输入" show-password />
        </el-form-item>
        <el-form-item v-if="form.userType === 'normal'" label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入" show-password />
        </el-form-item>
        <el-form-item label="密码确认" prop="confirmPwd">
          <el-input v-model="form.confirmPwd" placeholder="请输入" show-password />
        </el-form-item>

        <el-form-item label="权限配置">
          <div class="perm-card">
            <div class="perm-all-row">
              <el-checkbox v-model="allChecked">
                全部
              </el-checkbox>
            </div>
            <el-checkbox-group v-model="form.permissions">
              <el-row :gutter="16" class="perm-row">
                <el-col v-for="item in permList" :key="item.value" :span="8">
                  <el-checkbox :label="item.value">
                    {{ item.label }}
                  </el-checkbox>
                </el-col>
              </el-row>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer-btns">
          <el-button @click="handleCancel">
            取消
          </el-button>
          <el-button type="primary" @click="handleConfirm">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 权限列表（按顺序从A开始）
const permList = [
  { label: '远程设置参数', value: 'A' },
  { label: '远程查看日志、状态', value: 'B' },
  { label: '远程升级、格式化', value: 'C' },
  { label: '远程语音对接', value: 'D' },
  { label: '远程关机、重启', value: 'E' },
  { label: '远程控制本地输出', value: 'F' },
  { label: '远程请求报警上传、报警输出', value: 'G' },
  { label: '远程控制串口', value: 'H' },
  { label: '远程预览', value: 'I' },
  { label: '远程手动录像', value: 'J' },
  { label: '远程云台控制', value: 'K' },
  { label: '远程回放', value: 'L' }
]

const form = reactive({
  id: '',
  username: '',
  userType: 'normal',
  adminPwd: '',
  password: '',
  confirmPwd: '',
  permissions: [] as string[]
})

const allChecked = ref(false)

watch(allChecked, (val) => {
  if (val) {
    form.permissions = permList.map((p) => p.value)
  } else {
    form.permissions = []
  }
})

// 监听用户数据变化，初始化表单
watch(() => props.userData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    const userTypeMap: Record<string, string> = {
      管理员: 'admin',
      普通用户: 'normal'
    }
    form.id = newData.id || ''
    form.username = newData.user_name || ''
    form.userType = userTypeMap[newData.user_type] || 'normal'
    const originalPassword = newData.password || ''
    if (form.userType === 'admin') {
      form.adminPwd = originalPassword
    } else {
      form.password = originalPassword
    }
    form.confirmPwd = originalPassword
    form.permissions = (newData.permission || '').split('').filter(Boolean)
    allChecked.value = form.permissions.length === permList.length
  }
}, { immediate: true })

const formRef = ref<FormInstance>()

const validateConfirmPwd = (rule: any, value: any, callback: any) => {
  const password = form.userType === 'admin' ? form.adminPwd : form.password
  // 如果密码字段有值，则确认密码必填
  if (password && !value) {
    callback(new Error('请输入密码确认'))
    return
  }
  // 如果密码字段有值，则必须一致
  if (password && value !== password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const validateAdminPwd = (rule: any, value: any, callback: any) => {
  if (form.confirmPwd && !value) {
    callback(new Error('请输入管理员密码'))
    return
  }
  if (form.confirmPwd && value !== form.confirmPwd) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const validatePassword = (rule: any, value: any, callback: any) => {
  // 如果确认密码有值，则密码必填
  if (form.confirmPwd && !value) {
    callback(new Error('请输入密码'))
    return
  }
  // 如果确认密码有值，则必须一致
  if (form.confirmPwd && value !== form.confirmPwd) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

// 表单验证规则
const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  userType: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  adminPwd: [
    { validator: validateAdminPwd, trigger: 'blur' }
  ],
  password: [
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPwd: [
    { validator: validateConfirmPwd, trigger: 'blur' }
  ]
})

// 监听用户类型变化，重置密码字段
watch(() => form.userType, () => {
  form.adminPwd = ''
  form.password = ''
  form.confirmPwd = ''
  // 清除验证状态
  formRef.value?.clearValidate(['adminPwd', 'password', 'confirmPwd'])
})

// 监听密码字段变化，重新验证确认密码
watch([() => form.adminPwd, () => form.password], () => {
  if (form.confirmPwd) {
    formRef.value?.validateField('confirmPwd')
  }
})

const handleCancel = () => {
  dialogVisible.value = false
  // 重置表单
  formRef.value?.resetFields()
}

const handleConfirm = async() => {
  if (!formRef.value) return

  // 验证表单
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.error('请检查表单填写是否正确')
    return
  }

  const userData: any = {
    id: form.id,
    username: form.username,
    userType: form.userType,
    permissions: form.permissions
  }

  if (form.userType === 'admin' && form.adminPwd) {
    userData.password = form.adminPwd
  } else if (form.userType === 'normal' && form.password) {
    userData.password = form.password
  }

  const password = form.userType === 'admin' ? form.adminPwd : form.password
  if (password && password !== form.confirmPwd) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  emit('confirm', userData)
  dialogVisible.value = false
  // 重置表单
  formRef.value.resetFields()
}
</script>

<style scoped lang="scss">
.dialog-footer-btns {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  margin-top: 40px;
}

.perm-card {
  width: 100%;
  padding: 20px;
  border: 1px solid rgba(245,245,245,1);
  border-radius: 4px;
}

.perm-row {
  width: 100%;
  font-size: 14px;
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}
</style>
