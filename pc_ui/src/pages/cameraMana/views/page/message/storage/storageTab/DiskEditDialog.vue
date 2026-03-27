<template>
  <el-dialog
    v-model="visibleInner"
    title="编辑"
    width="35%"
    :close-on-click-modal="false"
  >
    <div class="diskEditDialog">
      <el-form ref="formRef" class="diskForm" label-position="top" :model="form">
        <el-form-item label="硬盘名称">
          <el-input v-model="form.diskName" placeholder="请输入硬盘名称" />
        </el-form-item>

        <el-form-item label="物理类型">
          <el-select v-model="form.physicalType" placeholder="请选择">
            <el-option label="DISK" value="DISK" />
          </el-select>
        </el-form-item>

        <el-form-item label="总空间">
          <el-input v-model="form.totalSpace" placeholder="请输入">
            <template #suffix>
              GB
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="存储位置">
          <el-input v-model="form.path" placeholder="请输入或选择存储位置" />
        </el-form-item>

        <el-form-item label="作为默认存储">
          <el-switch v-model="form.isDefault" />
        </el-form-item>
      </el-form>

      <div class="dialog-footer-btns">
        <el-button @click="handleCancel">
          取消
        </el-button>
        <el-button type="primary" @click="handleConfirm">
          确定
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

interface DiskForm {
  diskName: string
  physicalType: string
  totalSpace: number | string
  path: string
  isDefault: boolean
}

const props = defineProps<{
  visible: boolean
  initialData?: DiskForm
}>()

const emits = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: DiskForm]
}>()

const visibleInner = ref(props.visible)

watch(
  () => props.visible,
  (val) => {
    visibleInner.value = val
  }
)

watch(visibleInner, (val) => {
  emits('update:visible', val)
})

const formRef = ref()

const form = reactive<DiskForm>({
  diskName: '',
  physicalType: 'DISK',
  totalSpace: 1024,
  path: '',
  isDefault: false
})

const resetForm = () => {
  form.diskName = ''
  form.physicalType = 'DISK'
  form.totalSpace = 1024
  form.path = ''
  form.isDefault = false
}

// 打开编辑弹窗时，根据 initialData 填充表单
watch(
  () => props.initialData,
  (val) => {
    if (!val) return
    form.diskName = val.diskName
    form.physicalType = val.physicalType
    form.totalSpace = val.totalSpace
    form.path = val.path
    form.isDefault = val.isDefault
  },
  { immediate: true, deep: true }
)

const handleCancel = () => {
  visibleInner.value = false
  resetForm()
}

const handleConfirm = () => {
  emits('confirm', { ...form })
  visibleInner.value = false
  resetForm()
}
</script>

<style lang="scss" scoped>
.diskEditDialog {
  .diskForm {
    padding: 0 20px;

    :deep(.el-form-item__content) {
      height: 44px;
    }

    :deep(.el-input),
    :deep(.el-select) {
      height: 100%;
    }

    :deep(.el-select .el-input__wrapper) {
      height: 44px;
    }
  }

  .dialog-footer-btns {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 40px;
  }
}
</style>

