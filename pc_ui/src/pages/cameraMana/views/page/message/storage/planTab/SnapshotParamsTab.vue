<template>
  <div class="snapshotParamsTab">
    <el-form class="sbForm" label-position="top" :model="form">
      <div class="sectionTitle" style="margin-top: 0;">
        <span class="line" />
        <span>定时</span>
      </div>
      <el-form-item>
        <el-checkbox v-model="form.enableTiming">
          启用定时抓图
        </el-checkbox>
      </el-form-item>
      <el-form-item label="图片格式">
        <el-select v-model="form.timing.format" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in imageFormatOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分辨率">
        <el-select v-model="form.timing.resolution" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in resolutionOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图片质量">
        <el-select v-model="form.timing.quality" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in qualityOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="抓图时间间隔">
        <div class="interval-row">
          <el-input v-model="form.timing.interval" placeholder="请输入" />
          <span class="unit-text">毫秒</span>
        </div>
      </el-form-item>

      <div class="sectionTitle">
        <span class="line" />
        <span>事件触发</span>
      </div>
      <el-form-item>
        <el-checkbox v-model="form.enableEvent">
          启用事件抓图
        </el-checkbox>
      </el-form-item>
      <el-form-item label="图片格式">
        <el-select v-model="form.event.format" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in imageFormatOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="分辨率">
        <el-select v-model="form.event.resolution" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in resolutionOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="图片质量">
        <el-select v-model="form.event.quality" placeholder="请选择" class="full-select">
          <el-option
            v-for="opt in qualityOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="抓图时间间隔">
        <div class="interval-row">
          <el-input v-model="form.event.interval" placeholder="请输入" />
          <span class="unit-text">毫秒</span>
        </div>
      </el-form-item>
      <el-form-item label="图片数量">
        <el-input v-model="form.event.count" placeholder="请输入" />
      </el-form-item>
    </el-form>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="onSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { getCapture, saveCapture } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const imageFormatOptions = [
  { label: 'JPEG', value: 'JPEG' },
  { label: 'PNG', value: 'PNG' },
  { label: 'BMP', value: 'BMP' }
]

const resolutionOptions = [
  { label: '1920*1080', value: '1920*1080' },
  { label: '2048*1536', value: '2048*1536' },
  { label: '2560*1440', value: '2560*1440' },
  { label: '3840*2160', value: '3840*2160' },
  { label: '1280*720', value: '1280*720' },
  { label: '640*480', value: '640*480' }
]

const qualityOptions = [
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' }
]

// 表单
const form = reactive({
  enableTiming: false,
  enableEvent: false,
  timing: {
    format: 'JPEG',
    resolution: '2048*1536',
    quality: 'high',
    interval: ''
  },
  event: {
    format: 'JPEG',
    resolution: '2048*1536',
    quality: 'high',
    interval: '',
    count: ''
  }
})

const captureData = reactive<any>({
  loop_writing: false,
  pre_record_time: 0,
  record_delay: 0,
  stream_type: '',
  schedule_time: {
    frequency: '',
    time_periods: []
  },
  timing_capture: false,
  picture_format1: '',
  resolution1: '',
  picture_quality1: '',
  grab_time_interval1: 0,
  event_capture: false,
  picture_format2: '',
  resolution2: '',
  picture_quality2: '',
  grab_time_interval2: 0,
  image_quantity: 0
})

const mapFormatApiToUi = (val: string | undefined) => {
  if (!val) return 'JPEG'
  return val
}

const mapFormatUiToApi = (val: string) => {
  return val || 'JPEG'
}

const mapResolutionApiToUi = (val: string | undefined) => {
  if (!val) return '2048*1536'
  return val
}

const mapResolutionUiToApi = (val: string) => {
  return val
}

const mapQualityApiToUi = (val: string | undefined) => {
  if (val === '高') return 'high'
  if (val === '中') return 'medium'
  if (val === '低') return 'low'
  return 'high'
}

const mapQualityUiToApi = (val: string) => {
  if (val === 'high') return '高'
  if (val === 'medium') return '中'
  if (val === 'low') return '低'
  return '高'
}

// 初始化获取抓图参数
const fetchCapture = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getCapture(params)
  if (res.code === 200 && res.data) {
    Object.assign(captureData, res.data)

    form.enableTiming = !!res.data.timing_capture
    form.timing.format = mapFormatApiToUi(res.data.picture_format1)
    form.timing.resolution = mapResolutionApiToUi(res.data.resolution1)
    form.timing.quality = mapQualityApiToUi(res.data.picture_quality1)
    form.timing.interval = res.data.grab_time_interval1 != null ? String(res.data.grab_time_interval1) : ''

    form.enableEvent = !!res.data.event_capture
    form.event.format = mapFormatApiToUi(res.data.picture_format2)
    form.event.resolution = mapResolutionApiToUi(res.data.resolution2)
    form.event.quality = mapQualityApiToUi(res.data.picture_quality2)
    form.event.interval = res.data.grab_time_interval2 != null ? String(res.data.grab_time_interval2) : ''
    form.event.count = res.data.image_quantity != null ? String(res.data.image_quantity) : ''
  }
}

// 保存
const onSave = async() => {
  const params: any = {
    ...captureData,
    timing_capture: form.enableTiming,
    picture_format1: mapFormatUiToApi(form.timing.format),
    resolution1: mapResolutionUiToApi(form.timing.resolution),
    picture_quality1: mapQualityUiToApi(form.timing.quality),
    grab_time_interval1: Number(form.timing.interval) || 0,
    event_capture: form.enableEvent,
    picture_format2: mapFormatUiToApi(form.event.format),
    resolution2: mapResolutionUiToApi(form.event.resolution),
    picture_quality2: mapQualityUiToApi(form.event.quality),
    grab_time_interval2: Number(form.event.interval) || 0,
    image_quantity: Number(form.event.count) || 0,
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await saveCapture(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchCapture()
  }
}

onMounted(() => {
  fetchCapture()
})
</script>

<style lang="scss" scoped>
.snapshotParamsTab{
  width: 480px;
}

.sbForm {
  .el-input {
    height: 40px;
  }

  .full-select {
    width: 100%;

    :deep(.el-input__wrapper) {
      height: 40px !important;
    }
  }
}

.interval-row {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  .el-input {
    flex: 1;
  }
}

.unit-text {
  white-space: nowrap;
  color: #6B7280;
  font-size: 14px;
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
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;
  }
}
</style>

