<template>
  <div class="appN_Page">
    <el-form ref="smnForm" label-position="top" class="deptNForm" :model="form" :rules="rules">
      <div class="sectionTitle" style="margin-top: 0;">
        <span class="line" />
        <span>安全问题配置</span>
      </div>
      <el-form-item label="安全问题1" prop="safety_issue1">
        <el-select v-model="form.safety_issue1" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in questionOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="答案" prop="answer1">
        <el-input v-model="form.answer1" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="安全问题2" prop="safety_issue2">
        <el-select v-model="form.safety_issue2" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in questionOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="答案" prop="answer2">
        <el-input v-model="form.answer2" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="安全问题3" prop="safety_issue3">
        <el-select v-model="form.safety_issue3" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in questionOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="答案" prop="answer3">
        <el-input v-model="form.answer3" placeholder="请输入" />
      </el-form-item>

      <div class="sectionTitle">
        <span class="line" />
        <span>安全邮箱配置</span>
      </div>
      <el-form-item label="邮箱地址" prop="email_addr">
        <el-input v-model="form.email_addr" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <div class="footerBtns">
      <el-button @click="emits('close')">
        取消
      </el-button>
      <el-button type="primary" @click="save(smnForm)">
        保存
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage, FormRules } from 'element-plus'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  item?: any
  userData?: any
}>()
const emits: any = defineEmits(['handle', 'close'])
const smnForm = ref<FormInstance>() // form Ref
const form = reactive({
  id: '',
  safety_issue1: '',
  answer1: '',
  safety_issue2: '',
  answer2: '',
  safety_issue3: '',
  answer3: '',
  email_addr: ''
})
const rules = reactive<FormRules<any>>({
  safety_issue1: [
    { required: true, message: '请选择安全问题1', trigger: 'change' }
  ],
  answer1: [
    { required: true, message: '请输入答案1', trigger: 'blur' }
  ],
  safety_issue2: [
    { required: true, message: '请选择安全问题2', trigger: 'change' }
  ],
  answer2: [
    { required: true, message: '请输入答案2', trigger: 'blur' }
  ],
  safety_issue3: [
    { required: true, message: '请选择安全问题3', trigger: 'change' }
  ],
  answer3: [
    { required: true, message: '请输入答案3', trigger: 'blur' }
  ],
  email_addr: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
})

// 保存
const save = async(formEl: any) => {
  if (!formEl) return
  await formEl.validate((valid: boolean) => {
    if (valid) {
      emits('handle', {
        userId: form.id,
        safety_issue1: form.safety_issue1,
        answer1: form.answer1,
        safety_issue2: form.safety_issue2,
        answer2: form.answer2,
        safety_issue3: form.safety_issue3,
        answer3: form.answer3,
        email_addr: form.email_addr
      })
      emits('close')
      ElMessage.success('保存成功')
    } else {
      return false
    }
  })
}

// 监听用户数据变化
watch(() => props.userData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    form.id = newData.id || ''
    form.safety_issue1 = newData.safety_issue1 || ''
    form.answer1 = newData.answer1 || ''
    form.safety_issue2 = newData.safety_issue2 || ''
    form.answer2 = newData.answer2 || ''
    form.safety_issue3 = newData.safety_issue3 || ''
    form.answer3 = newData.answer3 || ''
    form.email_addr = newData.email_addr || ''
  } else {
    form.id = ''
    form.safety_issue1 = ''
    form.answer1 = ''
    form.safety_issue2 = ''
    form.answer2 = ''
    form.safety_issue3 = ''
    form.answer3 = ''
    form.email_addr = ''
  }
}, { immediate: true })

const questionOptions = [
  { label: '你父亲的姓名是什么', value: 'father_name' },
  { label: '你母亲的姓名是什么', value: 'mother_name' },
  { label: '你高中班主任姓名是什么', value: 'teacher_name' }
]
</script>
<style lang="scss" scoped>
// form
:deep(.deptNForm ) {
  .el-form-item__content {
    height: 40px;
  }

  .el-input {
    height: 100%;
  }
}

.channelidBox {
  cursor: pointer;
  width: 100%;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
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

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.footerBtns {
  text-align: right;
  margin-top: 32px;
}
</style>
