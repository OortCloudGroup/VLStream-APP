<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="编辑IP地址"
      width="35%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" label-position="top" :model="form" label-width="80px">
        <el-form-item
          label="IP地址"
          prop="ip"
          :rules="[{ required: true, message: '请输入IP地址', trigger: 'blur' }]"
        >
          <el-input v-model="form.ip" placeholder="请输入名称" />
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

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  ip: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const form = reactive({
  ip: props.ip || ''
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.ip = props.ip || ''
    }
  }
)

const formRef = ref()

const handleCancel = () => {
  dialogVisible.value = false
}

const handleConfirm = () => {
  (formRef.value as any)?.validate((valid: boolean) => {
    if (!valid) return
    emit('confirm', form.ip)
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
</style>

