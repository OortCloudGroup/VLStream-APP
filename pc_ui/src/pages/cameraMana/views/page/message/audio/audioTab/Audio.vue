<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="音频编码">
        <el-select v-model="form.audioEncoding" placeholder="请选择" class="full-select">
          <el-option label="G.711alaw" value="G.711alaw" />
          <el-option label="G.711ulaw" value="G.711ulaw" />
          <el-option label="G.726" value="G.726" />
          <el-option label="AAC" value="AAC" />
        </el-select>
      </el-form-item>
      <el-form-item label="音频输入">
        <el-select v-model="form.audioInput" placeholder="请选择" class="full-select">
          <el-option label="MicIn" value="MicIn" />
          <el-option label="LineIn" value="LineIn" />
        </el-select>
      </el-form-item>
      <el-form-item label="输入音量">
        <div class="slider-container">
          <div class="slider-row">
            <el-slider v-model="form.inputVolume" :min="0" :max="100" class="slider" />
            <span class="slider-value">{{ form.inputVolume }}</span>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="环境噪声过滤">
        <el-select v-model="form.noiseFilter" placeholder="请选择" class="full-select">
          <el-option label="关闭" value="off" />
          <el-option label="开启" value="on" />
        </el-select>
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
import { reactive, onMounted } from 'vue'
import { getAudio, saveAudio } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  audioEncoding: '',
  audioInput: '',
  inputVolume: 0,
  noiseFilter: ''
})

// 将接口返回的值映射到表单
const mapFromApi = (data: any) => {
  // 处理音频输入：接口可能返回 "Micln"，表单选项是 "MicIn"
  const mapAudioInput = (val: string) => {
    if (val === 'Micln' || val === 'MicIn') return 'MicIn'
    if (val === 'LineIn') return 'LineIn'
    return ''
  }

  // 处理环境噪声过滤：接口返回"关闭"/"开启"，表单值是"off"/"on"
  const mapNoiseFilter = (val: string) => {
    if (val === '关闭') return 'off'
    if (val === '开启' || val === '打开') return 'on'
    return ''
  }

  return {
    audioEncoding: data.audio_encoding || '',
    audioInput: mapAudioInput(data.audio_input || ''),
    inputVolume: Number(data.input_volume) || 0,
    noiseFilter: mapNoiseFilter(data.environmental_noise_filtering || '')
  }
}

// 将表单值映射回接口需要的格式
const mapToApi = () => {
  // 处理音频输入：表单值是"MicIn"，接口需要"Micln"
  const mapAudioInput = (val: string) => {
    if (val === 'MicIn') return 'Micln'
    if (val === 'LineIn') return 'LineIn'
    return val
  }

  // 处理环境噪声过滤：表单值是"off"/"on"，接口需要"关闭"/"开启"
  const mapNoiseFilter = (val: string) => {
    if (val === 'off') return '关闭'
    if (val === 'on') return '开启'
    return val
  }

  return {
    audio_encoding: form.audioEncoding,
    audio_input: mapAudioInput(form.audioInput),
    input_volume: form.inputVolume,
    environmental_noise_filtering: mapNoiseFilter(form.noiseFilter)
  }
}

const fetchAudio = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getAudio(params)
  if (res.code === 200 && res.data) {
    const mappedData = mapFromApi(res.data)
    Object.assign(form, mappedData)
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    ...mapToApi()
  }
  const res: any = await saveAudio(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchAudio()
  }
}

onMounted(() => {
  fetchAudio()
})
</script>

<style lang="scss" scoped>
.systemBasic {
  padding-left: 20px;
  width: 480px;

  .sbForm {
    .el-input {
      height: 40px;
    }
  }
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.slider-container {
  width: 100%;

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;

    .slider {
      flex: 1;
    }

    .slider-value {
      font-size: 14px;
      color: #333333;
      min-width: 24px;
      text-align: right;
    }
  }

  :deep(.el-slider) {
    .el-slider__runway {
      height: 4px;
    }

    .el-slider__bar {
      height: 4px;
    }

    .el-slider__button {
      background-color: var(--el-color-primary);
      border-color: #FFFFFF;
    }
  }
}

.submitBox {
  padding: 40px 0;

  .submit {
    height: 48px;
    width: 170px;
    text-align: center;
    line-height: 48px;
    background: var(--el-color-primary);
    border-radius: 2px;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;
  }
}
</style>
