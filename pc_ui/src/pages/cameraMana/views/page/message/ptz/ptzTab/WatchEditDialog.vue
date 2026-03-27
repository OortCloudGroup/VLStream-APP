<template>
  <el-dialog
    v-model="visibleInner"
    title="编辑"
    width="35%"
    :close-on-click-modal="false"
  >
    <div class="diskAddDialog">
      <el-form ref="formRef" class="diskForm" label-position="top" :model="form">
        <el-form-item label="预设点">
          <el-select v-model="form.presetsPoint" placeholder="请选择预设点">
            <!-- 可以动态绑定选项 -->
            <el-option label="预设点1" value="preset1" />
            <el-option label="预设点2" value="preset2" />
            <el-option label="预设点3" value="preset3" />
          </el-select>
        </el-form-item>

        <el-form-item label="巡航时间">
          <el-input v-model.number="form.patrolTime" placeholder="请输入巡航时间">
            <template #suffix>
              s
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="巡航速度">
          <el-select v-model="form.patrolSpeed" placeholder="请选择巡航速度">
            <el-option label="低速" value="low" />
            <el-option label="中速" value="medium" />
            <el-option label="高速" value="high" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否启用">
          <el-switch v-model="form.enabled" />
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

export interface WatchForm {
  presetsPoint: string
  patrolTime: number
  patrolSpeed: string
  enabled: boolean
}

const props = defineProps<{
  visible: boolean
  data?: Partial<WatchForm> | null
}>()

const emits = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [value: WatchForm]
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

const form = reactive<WatchForm>({
  presetsPoint: '',
  patrolTime: 10,
  patrolSpeed: 'low',
  enabled: true
})

const applyDataToForm = (data?: Partial<WatchForm> | null) => {
  form.presetsPoint = data?.presetsPoint ?? ''
  form.patrolTime = Number(data?.patrolTime ?? 10)
  form.patrolSpeed = data?.patrolSpeed ?? 'low'
  form.enabled = data?.enabled ?? true
}

watch(
  () => props.data,
  (val) => {
    applyDataToForm(val)
  },
  { immediate: true }
)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      applyDataToForm(props.data)
    }
  }
)

const handleCancel = () => {
  visibleInner.value = false
}

const handleConfirm = () => {
  emits('confirm', { ...form })
  visibleInner.value = false
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

