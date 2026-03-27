<template>
  <div>
    <el-form label-position="top" class="sbForm" :model="form">
      <el-form-item label="波特率">
        <el-select v-model="form.baudRate" placeholder="请选择" class="full-select">
          <el-option v-for="item in baudRateOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据位">
        <el-select v-model="form.dataBits" placeholder="请选择" class="full-select">
          <el-option v-for="item in dataBitOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="停止位">
        <el-select v-model="form.stopBits" placeholder="请选择" class="full-select">
          <el-option v-for="item in stopBitOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="校验">
        <el-select v-model="form.parity" placeholder="请选择" class="full-select">
          <el-option v-for="item in parityOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="流控">
        <el-select v-model="form.flowControl" placeholder="请选择" class="full-select">
          <el-option v-for="item in flowControlOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="解码器类型">
        <el-select v-model="form.decoderType" placeholder="请选择" class="full-select">
          <el-option v-for="item in decoderTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="解码器地址">
        <el-input v-model="form.decoderAddress" placeholder="请输入" />
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
import { ref, onMounted } from 'vue'
import { getRs485, saveRs485 } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  baudRate: '',
  dataBits: '',
  stopBits: '',
  parity: '',
  flowControl: '',
  decoderType: '',
  decoderAddress: ''
})

const baudRateOptions = [
  { label: '1200', value: '1200' },
  { label: '2400', value: '2400' },
  { label: '4800', value: '4800' },
  { label: '9600', value: '9600' },
  { label: '19200', value: '19200' },
  { label: '38400', value: '38400' },
  { label: '57600', value: '57600' },
  { label: '115200', value: '115200' }
]

const dataBitOptions = [
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' },
  { label: '8', value: '8' }
]

const stopBitOptions = [
  { label: '1', value: '1' },
  { label: '1.5', value: '1.5' },
  { label: '2', value: '2' }
]

const parityOptions = [
  { label: '无', value: 'none' },
  { label: '奇校验', value: 'odd' },
  { label: '偶校验', value: 'even' }
]

const flowControlOptions = [
  { label: '无', value: 'none' },
  { label: '软件流控', value: 'software' },
  { label: '硬件流控', value: 'hardware' }
]

const decoderTypeOptions = [
  { label: 'PWMC-AE', value: 'PWMC-AE' },
  { label: 'Pelco-D', value: 'Pelco-D' },
  { label: 'Pelco-P', value: 'Pelco-P' },
  { label: 'VISCA', value: 'VISCA' }
]

// 校验位映射：API 值 -> 表单值
const checkToParityMap: Record<string, string> = {
  '无': 'none',
  '奇校验': 'odd',
  '偶校验': 'even'
}

// 校验位映射：表单值 -> API 值
const parityToCheckMap: Record<string, string> = {
  'none': '无',
  'odd': '奇校验',
  'even': '偶校验'
}

// 流控映射：API 值 -> 表单值
const flowContrlToFlowControlMap: Record<string, string> = {
  '无': 'none',
  '软件流控': 'software',
  '硬件流控': 'hardware'
}

// 流控映射：表单值 -> API 值
const flowControlToFlowContrlMap: Record<string, string> = {
  'none': '无',
  'software': '软件流控',
  'hardware': '硬件流控'
}

const fetchRs485 = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await getRs485(params)
  if (res.code === 200 && res.data) {
    form.value.baudRate = String(res.data.baud_rate || '')
    form.value.dataBits = String(res.data.data_bit || '')
    form.value.stopBits = String(res.data.stop_bit || '')
    form.value.parity = checkToParityMap[res.data.check] || res.data.check || ''
    form.value.flowControl = flowContrlToFlowControlMap[res.data.flow_contrl] || res.data.flow_contrl || ''
    form.value.decoderType = res.data.decoder_type || ''
    form.value.decoderAddress = res.data.decoder_addr || ''
  }
}

const handleSave = async() => {
  // 转换停止位：如果是 '1.5'，需要特殊处理
  let stopBitValue: number | string = form.value.stopBits
  if (stopBitValue === '1.5') {
    stopBitValue = 1.5
  } else {
    stopBitValue = Number(stopBitValue) || 0
  }

  const params = {
    accessToken: store.userInfo?.accessToken,
    baud_rate: Number(form.value.baudRate) || 0,
    data_bit: Number(form.value.dataBits) || 0,
    stop_bit: stopBitValue,
    check: parityToCheckMap[form.value.parity] || form.value.parity,
    flow_contrl: flowControlToFlowContrlMap[form.value.flowControl] || form.value.flowControl,
    decoder_type: form.value.decoderType,
    decoder_addr: form.value.decoderAddress
  }
  const res = await saveRs485(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchRs485()
  }
}

onMounted(() => {
  fetchRs485()
})
</script>

<style lang="scss" scoped>
.sbForm {
  .el-input {
    height: 40px !important;
  }

  .el-select {
    width: 100%;
  }
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.submitBox {
  padding: 40px 20px;
  .submit {
    height: 48px;
    width: 170px;
    text-align: center;
    line-height: 48px;
    background: var(--el-color-primary);
    border-radius: 2px;
    font-size: 16px;
    color: #FFFFFF;
    cursor: pointer;
  }
}
</style>
