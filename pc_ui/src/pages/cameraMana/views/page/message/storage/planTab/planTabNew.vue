<template>
  <div class="appN_Page">
    <el-form ref="formRef" class="deptNForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.loopWrite">
          循环写入
        </el-checkbox>
      </el-form-item>
      <el-form-item label="预录时间">
        <el-select v-model="form.preRecord" placeholder="请选择">
          <el-option
            v-for="opt in secondsOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="录像延时">
        <el-select v-model="form.recordDelay" placeholder="请选择">
          <el-option
            v-for="opt in secondsOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="码流类型">
        <el-select v-model="form.streamType" placeholder="请选择">
          <el-option
            v-for="opt in streamTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="dialog-footer-btns">
      <el-button @click="emits('close')">
        取消
      </el-button>
      <el-button type="primary" @click="save()">
        确定
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

const props = defineProps<{
  item?: {
    loop_writing?: boolean
    pre_record_time?: number
    record_delay?: number
    code_stream_type?: string
  }
}>()

const emits = defineEmits(['handle', 'close'])
const formRef = ref<any>()

const secondsOptions = [
  { label: '1秒', value: 1 },
  { label: '2秒', value: 2 },
  { label: '3秒', value: 3 },
  { label: '5秒', value: 5 },
  { label: '10秒', value: 10 },
  { label: '15秒', value: 15 },
  { label: '20秒', value: 20 },
  { label: '30秒', value: 30 }
]

const streamTypeOptions = [
  { label: '关闭', value: '关闭' },
  { label: '定时', value: '定时' }
]

const form = reactive({
  loopWrite: true,
  preRecord: 5,
  recordDelay: 5,
  streamType: '关闭'
})

// 回显：打开弹窗时将父组件传入的值同步进来
watch(
  () => props.item,
  (val) => {
    if (!val) return
    if (typeof val.loop_writing === 'boolean') form.loopWrite = val.loop_writing
    if (typeof val.pre_record_time === 'number') form.preRecord = val.pre_record_time
    if (typeof val.record_delay === 'number') form.recordDelay = val.record_delay
    if (typeof val.code_stream_type === 'string') form.streamType = val.code_stream_type
  },
  { immediate: true, deep: true }
)

// 保存
const save = async() => {
  void formRef.value
  emits('handle', {
    loop_writing: form.loopWrite,
    pre_record_time: Number(form.preRecord),
    record_delay: Number(form.recordDelay),
    code_stream_type: String(form.streamType)
  } as any)
  emits('close')
}
</script>
<style lang="scss" scoped>
// form
:deep(.deptNForm ) {
  padding: 0 20px;

  .el-form-item__content {
    height: 44px;
  }

  .el-input,
  .el-select {
    height: 100%;
  }

  .el-select {
    .el-input__wrapper {
      height: 44px;
    }
  }
}

.channelidBox {
  cursor: pointer;
  width: 100%;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.set_secu{
  gap: 8px;
  padding-bottom: 20px;
  font-size: 16px;
  color: #1A53FF;
  font-weight: 400;

  .BtnImg {
    width: 24px;
    height: 24px;
  }
}

.dialog-footer-btns {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
}
</style>
