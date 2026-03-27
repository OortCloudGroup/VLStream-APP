<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      title="通用参数"
      width="35%"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" label-position="top" :model="form" label-width="140px">
        <el-form-item label="Web同时登录数">
          <el-input-number
            v-model="form.webConcurrent"
            :min="0"
            :max="1000"
            controls-position="right"
            class="num-input"
          />
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
  value: {
    type: Number,
    default: 50
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

const form = reactive({
  webConcurrent: 0
})

watch(() => props.userData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    form.webConcurrent = newData.web_simultaneous_login_number ?? 0
  }
}, { immediate: true })

watch(() => props.visible, (val) => {
  if (val && props.userData && Object.keys(props.userData).length > 0) {
    form.webConcurrent = props.userData.web_simultaneous_login_number ?? 0
  }
})

const formRef = ref()

const handleCancel = () => {
  dialogVisible.value = false
}

const handleConfirm = () => {
  // 传递用户ID和新的值
  emit('confirm', {
    userId: props.userData?.id,
    webConcurrent: form.webConcurrent
  })
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.dialog-footer-btns {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
}

:deep(.num-input) {
  width: 100%;

  .el-input__wrapper {
    height: 40px;
    box-shadow: none;
    border-color: #e5e7eb;
  }

  .el-input-number__decrease,
  .el-input-number__increase {
    background: transparent;
    border: none;
  }
}
</style>

