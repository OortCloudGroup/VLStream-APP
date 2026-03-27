<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="新增用户"
      width="35%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input v-model="form.username" placeholder="请输入" />
        </el-form-item>
        <el-form-item
          label="用户类型"
          prop="userType"
        >
          <el-select v-model="form.userType" placeholder="请选择" class="full-select">
            <el-option label="管理员" value="管理员" />
            <el-option label="普通用户" value="普通用户" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
        >
          <el-input v-model="form.password" type="password" placeholder="请输入" show-password />
        </el-form-item>
        <el-form-item
          label="密码确认"
          prop="confirmPassword"
        >
          <el-input v-model="form.confirmPassword" type="password" placeholder="请输入" show-password />
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
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const form = reactive({
  username: '',
  userType: '普通用户',
  password: '',
  confirmPassword: ''
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      // 重置表单
      form.username = ''
      form.userType = '普通用户'
      form.password = ''
      form.confirmPassword = ''
      // 清除表单验证
      formRef.value?.clearValidate()
    }
  }
)

const formRef = ref<FormInstance>()

const rules = ref<FormRules>({
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        const confirm = value ?? ''
        if (confirm === '') return callback()
        if (confirm !== (form.password ?? '')) return callback(new Error('两次输入的密码不一致'))
        return callback()
      },
      trigger: ['blur']
    }
  ]
})

const handleCancel = () => {
  dialogVisible.value = false
}

const handleConfirm = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return
    emit('confirm', {
      user_name: form.username,
      user_type: form.userType,
      password: form.password,
      password_confirmation: form.confirmPassword
    })
    dialogVisible.value = false
  })
}
</script>

<style scoped lang="scss">
.dialog-footer-btns {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}
</style>
