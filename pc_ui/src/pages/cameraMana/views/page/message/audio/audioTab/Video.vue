<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="码流类型">
        <el-select v-model="form.streamType" placeholder="请选择" class="full-select">
          <el-option label="主码流 (定时)" value="main_timed" />
          <el-option label="主码流" value="main" />
          <el-option label="子码流" value="sub" />
          <el-option label="第三码流" value="third" />
        </el-select>
      </el-form-item>
      <el-form-item label="视频分类">
        <el-select v-model="form.videoCategory" placeholder="请选择" class="full-select">
          <el-option label="复合流" value="composite" />
          <el-option label="视频流" value="video" />
        </el-select>
      </el-form-item>
      <el-form-item label="分辨率">
        <el-select v-model="form.resolution" placeholder="请选择" class="full-select">
          <el-option label="1920*1080" value="1920*1080" />
          <el-option label="2048*1536" value="2048*1536" />
          <el-option label="2560*1440" value="2560*1440" />
          <el-option label="3840*2160" value="3840*2160" />
          <el-option label="1280*720" value="1280*720" />
          <el-option label="640*480" value="640*480" />
        </el-select>
      </el-form-item>
      <el-form-item label="码率质量">
        <el-select v-model="form.bitrateQuality" placeholder="请选择" class="full-select">
          <el-option label="定码率" value="cbr" />
          <el-option label="变码率" value="vbr" />
        </el-select>
      </el-form-item>
      <el-form-item label="图像质量">
        <el-select v-model="form.imageQuality" placeholder="请选择" class="full-select">
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
        </el-select>
      </el-form-item>
      <el-form-item label="视频帧率">
        <div class="select-with-unit-inner">
          <el-select v-model="form.frameRate" placeholder="请选择" class="select-with-unit-select">
            <el-option label="15" value="15" />
            <el-option label="20" value="20" />
            <el-option label="25" value="25" />
            <el-option label="30" value="30" />
            <el-option label="50" value="50" />
            <el-option label="60" value="60" />
          </el-select>
          <span class="unit-inner">fps</span>
        </div>
      </el-form-item>
      <el-form-item label="码率上线">
        <div class="select-with-unit-inner">
          <el-select v-model="form.bitrateLimit" placeholder="请选择" class="select-with-unit-select">
            <el-option label="1024" value="1024" />
            <el-option label="2048" value="2048" />
            <el-option label="4096" value="4096" />
            <el-option label="6148" value="6148" />
            <el-option label="8192" value="8192" />
            <el-option label="10240" value="10240" />
            <el-option label="16384" value="16384" />
          </el-select>
          <span class="unit-inner">Kbps</span>
        </div>
      </el-form-item>
      <el-form-item label="视频编码">
        <el-input v-model="form.videoEncoding" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="Smart264">
        <el-select v-model="form.smart264" placeholder="请选择" class="full-select">
          <el-option label="关闭" value="off" />
          <el-option label="开启" value="on" />
        </el-select>
      </el-form-item>
      <el-form-item label="编码复杂度">
        <el-select v-model="form.encodingComplexity" placeholder="请选择" class="full-select">
          <el-option label="低" value="low" />
          <el-option label="中" value="medium" />
          <el-option label="高" value="high" />
        </el-select>
      </el-form-item>
      <el-form-item label="I帧间隔">
        <el-input v-model="form.iframeInterval" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="SVC">
        <el-select v-model="form.svc" placeholder="请选择" class="full-select">
          <el-option label="关闭" value="off" />
          <el-option label="开启" value="on" />
        </el-select>
      </el-form-item>
      <el-form-item label="码流平滑">
        <div class="slider-container">
          <div class="slider-row">
            <el-slider v-model="form.streamSmoothing" :min="0" :max="100" class="slider" />
            <span class="slider-value">{{ form.streamSmoothing }}</span>
          </div>
          <div class="slider-labels">
            <span class="slider-label-left">清晰</span>
            <span class="slider-label-right">平滑</span>
          </div>
        </div>
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
import { getVideo, saveVideo } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  streamType: '',
  videoCategory: '',
  resolution: '',
  bitrateQuality: '',
  imageQuality: '',
  frameRate: '',
  bitrateLimit: '',
  videoEncoding: '',
  smart264: '',
  encodingComplexity: '',
  iframeInterval: '',
  svc: '',
  streamSmoothing: 0
})

// 将接口返回的中文值映射到表单的英文值
const mapFromApi = (data: any) => {
  const mapCodeStreamType = (val: string) => {
    if (val?.includes('定时') || val === '主码流 (定时)') return 'main_timed'
    if (val === '主码流') return 'main'
    if (val === '子码流') return 'sub'
    if (val === '第三码流') return 'third'
    return 'main_timed'
  }

  const mapVideoClassification = (val: string) => {
    if (val === '复合流') return 'composite'
    if (val === '视频流') return 'video'
    return 'composite'
  }

  const mapRateQuality = (val: string) => {
    if (val === '定码率') return 'cbr'
    if (val === '变码率') return 'vbr'
    return 'cbr'
  }

  const mapImageQuality = (val: string) => {
    if (val === '低') return 'low'
    if (val === '中') return 'medium'
    if (val === '高') return 'high'
    return 'medium'
  }

  const mapSmart264 = (val: string) => {
    if (val === '打开' || val === '开启') return 'on'
    if (val === '关闭') return 'off'
    return 'off'
  }

  const mapEncodingComplexity = (val: string) => {
    if (val === '低') return 'low'
    if (val === '中') return 'medium'
    if (val === '高') return 'high'
    return 'high'
  }

  const mapSVC = (val: string) => {
    if (val === '打开' || val === '开启') return 'on'
    if (val === '关闭') return 'off'
    return 'off'
  }

  return {
    streamType: mapCodeStreamType(data.code_stream_type || ''),
    videoCategory: mapVideoClassification(data.video_classification || ''),
    resolution: data.resolution || '',
    bitrateQuality: mapRateQuality(data.rate_quality || ''),
    imageQuality: mapImageQuality(data.image_quality || ''),
    frameRate: String(data.video_frame_rate || ''),
    bitrateLimit: String(data.code_rate_online || ''),
    videoEncoding: data.video_coding || '',
    smart264: mapSmart264(data.smart264 || ''),
    encodingComplexity: mapEncodingComplexity(data.encoding_complexity || ''),
    iframeInterval: String(data.interval_per_frame || 0),
    svc: mapSVC(data.SVC || '关闭'),
    streamSmoothing: Number(data.code_stream_smoothing || 0)
  }
}

// 将表单的英文值映射回接口需要的中文值
const mapToApi = () => {
  const mapCodeStreamType = (val: string) => {
    if (val === 'main_timed') return '主码流 (定时)'
    if (val === 'main') return '主码流'
    if (val === 'sub') return '子码流'
    if (val === 'third') return '第三码流'
    return '主码流'
  }

  const mapVideoClassification = (val: string) => {
    if (val === 'composite') return '复合流'
    if (val === 'video') return '视频流'
    return '复合流'
  }

  const mapRateQuality = (val: string) => {
    if (val === 'cbr') return '定码率'
    if (val === 'vbr') return '变码率'
    return '定码率'
  }

  const mapImageQuality = (val: string) => {
    if (val === 'low') return '低'
    if (val === 'medium') return '中'
    if (val === 'high') return '高'
    return '中'
  }

  const mapSmart264 = (val: string) => {
    if (val === 'on') return '打开'
    if (val === 'off') return '关闭'
    return '关闭'
  }

  const mapEncodingComplexity = (val: string) => {
    if (val === 'low') return '低'
    if (val === 'medium') return '中'
    if (val === 'high') return '高'
    return '高'
  }

  const mapSVC = (val: string) => {
    if (val === 'on') return '打开'
    if (val === 'off') return '关闭'
    return '关闭'
  }

  return {
    code_stream_type: mapCodeStreamType(form.streamType),
    video_classification: mapVideoClassification(form.videoCategory),
    resolution: form.resolution,
    rate_quality: mapRateQuality(form.bitrateQuality),
    image_quality: mapImageQuality(form.imageQuality),
    video_frame_rate: form.frameRate,
    code_rate_online: form.bitrateLimit,
    video_coding: form.videoEncoding,
    smart264: mapSmart264(form.smart264),
    encoding_complexity: mapEncodingComplexity(form.encodingComplexity),
    interval_per_frame: Number(form.iframeInterval) || 0,
    SVC: mapSVC(form.svc),
    code_stream_smoothing: form.streamSmoothing
  }
}

const fetchVideo = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getVideo(params)
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
  const res: any = await saveVideo(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchVideo()
  }
}

onMounted(() => {
  fetchVideo()
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

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input {
    flex: 1;
  }
}

.select-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;

  .full-select {
    flex: 1;
  }
}

.select-with-unit-inner {
  position: relative;
  width: 100%;

  .select-with-unit-select {
    width: 100%;

    :deep(.el-input__wrapper) {
      height: 40px !important;
      padding-right: 60px;
    }

    :deep(.el-input__inner) {
      padding-right: 0;
    }
  }

  .unit-inner {
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #999999;
    pointer-events: none;
    z-index: 1;
  }
}

.slider-container {
  width: 100%;

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;

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

  .slider-labels {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    color: #333333;

    .slider-label-left {
      flex: 1;
    }

    .slider-label-right {
      flex: 1;
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
