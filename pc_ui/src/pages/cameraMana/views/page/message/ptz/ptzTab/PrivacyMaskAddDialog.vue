<template>
  <el-dialog
    v-model="visibleInner"
    title="新增"
    width="35%"
    :close-on-click-modal="false"
  >
    <div class="diskAddDialog">
      <el-form ref="formRef" class="diskForm" label-position="top" :model="form">
        <el-form-item label="隐私块标题">
          <el-input v-model="form.privacy_block_title" placeholder="请输入隐私块标题" />
        </el-form-item>

        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="请选择类型">
            <el-option label="黑色" value="黑色" />
            <el-option label="灰色" value="灰色" />
          </el-select>
        </el-form-item>

        <el-form-item label="启用">
          <el-switch v-model="form.enabled" />
        </el-form-item>

        <el-form-item label="屏蔽倍率">
          <el-input v-model.number="form.shielding_power" placeholder="请输入屏蔽倍率" />
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

export interface PrivacyMaskForm {
  privacy_block_title: string
  type: string
  enabled: boolean
  shielding_power: number
}

const props = defineProps<{
  visible: boolean
}>()

const emits = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: PrivacyMaskForm]
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

const form = reactive<PrivacyMaskForm>({
  privacy_block_title: '',
  type: '灰色',
  enabled: true,
  shielding_power: 1
})

const resetForm = () => {
  form.privacy_block_title = ''
  form.type = '灰色'
  form.enabled = true
  form.shielding_power = 1
}

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
.diskAddDialog {
  .diskForm {
    padding: 0 20px;

    :deep(.el-form-item__content) {
      height: 44px;
    }

    :deep(.el-input),
    :deep(.el-select) {
      height: 100%;
    }

    :deep(.el-input__wrapper) {
      height: 44px !important;
    }
    :deep(.el-select__wrapper){
      height: 44px !important;
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

