<template>
  <div class="displaySettings">
    <!-- 顶部场景选择 -->
    <div class="scene-selector">
      <span class="scene-label">场景</span>
      <el-select v-model="form.scene" placeholder="请选择" class="scene-select">
        <el-option label="室内" value="indoor" />
        <el-option label="室外" value="outdoor" />
      </el-select>
    </div>

    <!-- 上方：视频预览、PTZ控制和预置点 -->
    <RoiTop v-model:roi-points="roiPoints" />

    <!-- 下方：图像调节 -->
    <div class="display_bottom">
      <div class="image-adjustment">
        <!-- 可折叠设置 -->
        <div class="collapsible-settings">
          <!-- 图像调节 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleSliders">
              <span>图像调节</span>
              <img v-if="showSliders" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <!-- 滑块区域 -->
            <div v-show="showSliders" class="sliders-container">
              <div class="slider-item">
                <span class="slider-label">亮度</span>
                <div class="slider-container">
                  <div class="slider-row">
                    <el-slider v-model="form.brightness" :min="0" :max="100" class="slider" />
                    <span class="slider-value">{{ form.brightness }}</span>
                  </div>
                </div>
              </div>
              <div class="slider-item">
                <span class="slider-label">对比度</span>
                <div class="slider-container">
                  <div class="slider-row">
                    <el-slider v-model="form.contrast" :min="0" :max="100" class="slider" />
                    <span class="slider-value">{{ form.contrast }}</span>
                  </div>
                </div>
              </div>
              <div class="slider-item">
                <span class="slider-label">饱和度</span>
                <div class="slider-container">
                  <div class="slider-row">
                    <el-slider v-model="form.saturation" :min="0" :max="100" class="slider" />
                    <span class="slider-value">{{ form.saturation }}</span>
                  </div>
                </div>
              </div>
              <div class="slider-item">
                <span class="slider-label">锐度</span>
                <div class="slider-container">
                  <div class="slider-row">
                    <el-slider v-model="form.sharpness" :min="0" :max="100" class="slider" />
                    <span class="slider-value">{{ form.sharpness }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 曝光 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleExposure">
              <span>曝光</span>
              <img v-if="showExposure" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <div v-show="showExposure" class="setting-content">
              <div class="setting-row">
                <span class="setting-label">曝光模式</span>
                <el-select v-model="form.exposureMode" class="setting-select">
                  <el-option label="自动" value="auto" />
                  <el-option label="手动" value="manual" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">最大快门限制</span>
                <el-select v-model="form.maxShutterLimit" class="setting-select">
                  <el-option label="1/25" value="1/25" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">最小快门限制</span>
                <el-select v-model="form.minShutterLimit" class="setting-select">
                  <el-option label="1/3000" value="1/3000" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">增益限制</span>
                <div class="slider-container">
                  <div class="slider-row">
                    <el-slider v-model="form.gainLimit" :min="0" :max="100" class="slider" />
                    <span class="slider-value">{{ form.gainLimit }}</span>
                  </div>
                </div>
              </div>
              <div class="setting-row">
                <span class="setting-label">低照度电子快门</span>
                <el-select v-model="form.lowLightShutter" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 聚焦 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleFocus">
              <span>聚焦</span>
              <img v-if="showFocus" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <div v-show="showFocus" class="setting-content">
              <div class="setting-row">
                <span class="setting-label">聚焦模式</span>
                <el-select v-model="form.focusMode" class="setting-select">
                  <el-option label="半自动" value="semi-auto" />
                  <el-option label="自动" value="auto" />
                  <el-option label="手动" value="manual" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">最小聚焦距离</span>
                <el-select v-model="form.minFocusDistance" class="setting-select">
                  <el-option label="1.5m" value="1.5m" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 日夜转换 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleDayNight">
              <span>日夜转换</span>
              <img v-if="showDayNight" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <div v-show="showDayNight" class="setting-content">
              <div class="setting-row">
                <span class="setting-label">日夜转换</span>
                <el-select v-model="form.dayNightConversion" class="setting-select">
                  <el-option label="自动" value="auto" />
                  <el-option label="日间" value="day" />
                  <el-option label="夜间" value="night" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">灵敏度</span>
                <el-select v-model="form.sensitivity" class="setting-select">
                  <el-option label="2" value="2" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">防补光过曝</span>
                <el-select v-model="form.antiFillLightOverexposure" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">红外灯模式</span>
                <el-select v-model="form.infraredLightMode" class="setting-select">
                  <el-option label="自动" value="auto" />
                  <el-option label="手动" value="manual" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">亮度限制</span>
                <div class="slider-container">
                  <div class="slider-row">
                    <el-slider v-model="form.brightnessLimit" :min="0" :max="100" class="slider" />
                    <span class="slider-value">{{ form.brightnessLimit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 背光 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleBacklight">
              <span>背光</span>
              <img v-if="showBacklight" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <div v-show="showBacklight" class="setting-content">
              <div class="setting-row">
                <span class="setting-label">背光补偿</span>
                <el-select v-model="form.backlightCompensation" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">宽动态</span>
                <el-select v-model="form.wideDynamic" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">强光抑制</span>
                <el-select v-model="form.strongLightSuppression" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 白平衡 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleWhiteBalance">
              <span>白平衡</span>
              <img v-if="showWhiteBalance" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <div v-show="showWhiteBalance" class="setting-content">
              <div class="setting-row">
                <span class="setting-label">白平衡</span>
                <el-select v-model="form.whiteBalance" class="setting-select">
                  <el-option label="自动白平衡" value="auto" />
                  <el-option label="手动" value="manual" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 图像增强 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleImageEnhancement">
              <span>图像增强</span>
              <img v-if="showImageEnhancement" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <div v-show="showImageEnhancement" class="setting-content">
              <div class="setting-row">
                <span class="setting-label">数字降噪</span>
                <el-select v-model="form.digitalNoiseReduction" class="setting-select">
                  <el-option label="普通模式" value="normal" />
                  <el-option label="关闭" value="off" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">降噪等级</span>
                <div class="slider-container">
                  <div class="slider-row">
                    <el-slider v-model="form.noiseReductionLevel" :min="0" :max="100" class="slider" />
                    <span class="slider-value">{{ form.noiseReductionLevel }}</span>
                  </div>
                </div>
              </div>
              <div class="setting-row">
                <span class="setting-label">透雾模式</span>
                <el-select v-model="form.defogMode" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">电子防抖</span>
                <el-select v-model="form.electronicImageStabilization" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 视频调整 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleVideoAdjustment">
              <span>视频调整</span>
              <img v-if="showVideoAdjustment" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <div v-show="showVideoAdjustment" class="setting-content">
              <div class="setting-row">
                <span class="setting-label">镜像</span>
                <el-select v-model="form.mirror" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">视频制式</span>
                <el-select v-model="form.videoStandard" class="setting-select">
                  <el-option label="PAL (50HZ)" value="PAL" />
                  <el-option label="NTSC (60HZ)" value="NTSC" />
                </el-select>
              </div>
            </div>
          </div>

          <!-- 其他 -->
          <div class="setting-item-wrapper">
            <div class="setting-item" @click="toggleOther">
              <span>其他</span>
              <img v-if="showOther" class="arrow-down" src="@/assets/img/camera/collapse2.png" alt="" />
              <img v-else class="arrow-up" src="@/assets/img/camera/expand2.png" alt="" />
            </div>
            <div v-show="showOther" class="setting-content">
              <div class="setting-row">
                <span class="setting-label">镜头初始化</span>
                <el-select v-model="form.lensInitialization" class="setting-select">
                  <el-option label="关闭" value="off" />
                  <el-option label="开启" value="on" />
                </el-select>
              </div>
              <div class="setting-row">
                <span class="setting-label">变倍限制</span>
                <el-select v-model="form.zoomLimit" class="setting-select">
                  <el-option
                    v-for="i in 10"
                    :key="i"
                    :label="String(i)"
                    :value="String(i)"
                  />
                </el-select>
              </div>
            </div>
          </div>
        </div>

        <!-- 恢复默认值按钮 -->
        <div class="reset-button-wrapper">
          <div class="reset-button" @click="handleReset">
            <oort-svg-icon width="16" height="16" name="refresh" />
            <span>恢复默认值</span>
          </div>
        </div>
      </div>
    </div>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import RoiTop from '@/pages/cameraMana/views/page/message/components/RoiTop.vue'
import OortSvgIcon from '@/components/oortSvgIcon/index.vue'
import { getDisplaySettings, saveDisplaySettings } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  scene: '',
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  // 曝光
  exposureMode: '',
  maxShutterLimit: '',
  minShutterLimit: '',
  gainLimit: 0,
  lowLightShutter: '',
  // 聚焦
  focusMode: '',
  minFocusDistance: '',
  // 日夜转换
  dayNightConversion: '',
  sensitivity: '',
  antiFillLightOverexposure: '',
  infraredLightMode: '',
  brightnessLimit: 0,
  // 背光
  backlightCompensation: '',
  wideDynamic: '',
  strongLightSuppression: '',
  // 白平衡
  whiteBalance: '',
  // 图像增强
  digitalNoiseReduction: '',
  noiseReductionLevel: 0,
  defogMode: '',
  electronicImageStabilization: '',
  // 视频调整
  mirror: '',
  videoStandard: '',
  // 其他
  lensInitialization: '',
  zoomLimit: ''
})

const uiBoolToApi = (v: any) => v === true || v === 'on'
const apiBoolToUi = (v: any) => (v ? 'on' : 'off')

const sceneApiToUi = (v: any) => {
  if (v === '室外') return 'outdoor'
  if (v === '室内') return 'indoor'
  return v === 'outdoor' ? 'outdoor' : 'indoor'
}
const sceneUiToApi = (v: any) => (v === 'outdoor' ? '室外' : '室内')

const exposureApiToUi = (v: any) => (v === '手动' ? 'manual' : 'auto')
const exposureUiToApi = (v: any) => (v === 'manual' ? '手动' : '自动')

const focusApiToUi = (v: any) => {
  if (v === '半自动') return 'semi-auto'
  if (v === '手动') return 'manual'
  return 'auto'
}
const focusUiToApi = (v: any) => {
  if (v === 'semi-auto') return '半自动'
  if (v === 'manual') return '手动'
  return '自动'
}

const dayNightApiToUi = (v: any) => {
  if (v === '日间') return 'day'
  if (v === '夜间') return 'night'
  return 'auto'
}
const dayNightUiToApi = (v: any) => {
  if (v === 'day') return '日间'
  if (v === 'night') return '夜间'
  return '自动'
}

const infraredApiToUi = (v: any) => (v === '手动' ? 'manual' : 'auto')
const infraredUiToApi = (v: any) => (v === 'manual' ? '手动' : '自动')

const wbApiToUi = (v: any) => (v === '手动' ? 'manual' : 'auto')
const wbUiToApi = (v: any) => (v === 'manual' ? '手动' : '自动白平衡')

const dnrApiToUi = (v: any) => (v === '关闭' ? 'off' : 'normal')
const dnrUiToApi = (v: any) => (v === 'off' ? '关闭' : '普通模式')

const videoFormatApiToUi = (v: any) => {
  const s = String(v || '')
  if (s.includes('NTSC')) return 'NTSC'
  return 'PAL'
}
const videoFormatUiToApi = (v: any) => (v === 'NTSC' ? 'NTSC(60HZ)' : 'PAL(50HZ)')

const fetchDisplaySettings = async() => {
  const params: any = {}
  if (store.userInfo?.accessToken) params.accessToken = store.userInfo.accessToken

  const res: any = await getDisplaySettings(params)
  if (res?.code === 200 && res?.data) {
    const d = res.data
    form.scene = sceneApiToUi(d.scene)
    form.brightness = Number(d.brightness ?? form.brightness)
    form.contrast = Number(d.contrast ?? form.contrast)
    form.saturation = Number(d.saturation ?? form.saturation)
    form.sharpness = Number(d.sharpness ?? form.sharpness)

    form.exposureMode = exposureApiToUi(d.exposure_mode)
    form.maxShutterLimit = d.maximum_shutter_limit ?? form.maxShutterLimit
    form.minShutterLimit = d.minimum_shutter_limit ?? form.minShutterLimit
    form.gainLimit = Number(d.gain_limit ?? form.gainLimit)
    form.lowLightShutter = apiBoolToUi(d.low_illumination_electronic_shutter)

    form.focusMode = focusApiToUi(d.focus_mode)
    form.minFocusDistance = d.minimum_focal_distance ?? form.minFocusDistance

    form.dayNightConversion = dayNightApiToUi(d.day_night_transition)
    form.sensitivity = String(d.sensitivity ?? form.sensitivity)
    form.antiFillLightOverexposure = apiBoolToUi(d.prevent_overexposure_during_supplementary_lighting)
    form.infraredLightMode = infraredApiToUi(d.infrared_lamp_mode)
    form.brightnessLimit = Number(d.luminance_limit ?? form.brightnessLimit)

    form.backlightCompensation = apiBoolToUi(d.backlight_compensation)
    form.wideDynamic = apiBoolToUi(d.wide_dynamic)
    form.strongLightSuppression = apiBoolToUi(d.strong_light_suppression)

    form.whiteBalance = wbApiToUi(d.white_balance)
    form.digitalNoiseReduction = dnrApiToUi(d.digital_noise_reduction)
    form.noiseReductionLevel = Number(d.noise_reduction_level ?? form.noiseReductionLevel)
    form.defogMode = apiBoolToUi(d.fog_penetration_mode)
    form.electronicImageStabilization = apiBoolToUi(d.electronic_image_stabilization)

    form.mirror = apiBoolToUi(d.mirror_image)
    form.videoStandard = videoFormatApiToUi(d.video_format)

    form.lensInitialization = apiBoolToUi(d.lens_initialization)
    form.zoomLimit = String(d.zoom_limit ?? form.zoomLimit)
  }
}

const handleSave = async() => {
  const payload: any = {
    scene: sceneUiToApi(form.scene),
    brightness: Number(form.brightness),
    contrast: Number(form.contrast),
    saturation: Number(form.saturation),
    sharpness: Number(form.sharpness),
    exposure_mode: exposureUiToApi(form.exposureMode),
    maximum_shutter_limit: form.maxShutterLimit,
    minimum_shutter_limit: form.minShutterLimit,
    gain_limit: Number(form.gainLimit),
    low_illumination_electronic_shutter: uiBoolToApi(form.lowLightShutter),
    focus_mode: focusUiToApi(form.focusMode),
    minimum_focal_distance: form.minFocusDistance,
    day_night_transition: dayNightUiToApi(form.dayNightConversion),
    sensitivity: Number(form.sensitivity),
    prevent_overexposure_during_supplementary_lighting: uiBoolToApi(form.antiFillLightOverexposure),
    infrared_lamp_mode: infraredUiToApi(form.infraredLightMode),
    luminance_limit: Number(form.brightnessLimit),
    backlight_compensation: uiBoolToApi(form.backlightCompensation),
    wide_dynamic: uiBoolToApi(form.wideDynamic),
    strong_light_suppression: uiBoolToApi(form.strongLightSuppression),
    white_balance: wbUiToApi(form.whiteBalance),
    digital_noise_reduction: dnrUiToApi(form.digitalNoiseReduction),
    noise_reduction_level: Number(form.noiseReductionLevel),
    fog_penetration_mode: uiBoolToApi(form.defogMode),
    electronic_image_stabilization: uiBoolToApi(form.electronicImageStabilization),
    mirror_image: uiBoolToApi(form.mirror),
    video_format: videoFormatUiToApi(form.videoStandard),
    lens_initialization: uiBoolToApi(form.lensInitialization),
    zoom_limit: Number(form.zoomLimit)
  }
  if (store.userInfo?.accessToken) payload.accessToken = store.userInfo.accessToken

  const res: any = await saveDisplaySettings(payload)
  if (res?.code === 200) {
    ElMessage.success('保存成功')
    await fetchDisplaySettings()
  }
}

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

const showSliders = ref(true)
const showExposure = ref(false)
const showFocus = ref(false)
const showDayNight = ref(false)
const showBacklight = ref(false)
const showWhiteBalance = ref(false)
const showImageEnhancement = ref(false)
const showVideoAdjustment = ref(false)
const showOther = ref(false)

const toggleSliders = () => {
  showSliders.value = !showSliders.value
}

const toggleExposure = () => {
  showExposure.value = !showExposure.value
}

const toggleFocus = () => {
  showFocus.value = !showFocus.value
}

const toggleDayNight = () => {
  showDayNight.value = !showDayNight.value
}

const toggleBacklight = () => {
  showBacklight.value = !showBacklight.value
}

const toggleWhiteBalance = () => {
  showWhiteBalance.value = !showWhiteBalance.value
}

const toggleImageEnhancement = () => {
  showImageEnhancement.value = !showImageEnhancement.value
}

const toggleVideoAdjustment = () => {
  showVideoAdjustment.value = !showVideoAdjustment.value
}

const toggleOther = () => {
  showOther.value = !showOther.value
}

// 恢复默认值
const handleReset = async() => {
  // 默认值
  const defaultData = {
    scene: '室内',
    brightness: 50,
    contrast: 50,
    saturation: 50,
    sharpness: 50,
    exposure_mode: '自动',
    maximum_shutter_limit: '1/25',
    minimum_shutter_limit: '1/3000',
    gain_limit: 50,
    low_illumination_electronic_shutter: true,
    focus_mode: '半自动',
    minimum_focal_distance: '1.5m',
    day_night_transition: '自动',
    sensitivity: 2,
    prevent_overexposure_during_supplementary_lighting: false,
    infrared_lamp_mode: '自动',
    luminance_limit: 50,
    backlight_compensation: false,
    wide_dynamic: false,
    strong_light_suppression: false,
    white_balance: '自动白平衡',
    digital_noise_reduction: '普通模式',
    noise_reduction_level: 50,
    fog_penetration_mode: false,
    electronic_image_stabilization: false,
    mirror_image: false,
    video_format: 'PAL(50HZ)',
    lens_initialization: false,
    zoom_limit: 2
  }

  // 将默认值转换为UI格式并设置到form
  form.scene = sceneApiToUi(defaultData.scene)
  form.brightness = defaultData.brightness
  form.contrast = defaultData.contrast
  form.saturation = defaultData.saturation
  form.sharpness = defaultData.sharpness
  form.exposureMode = exposureApiToUi(defaultData.exposure_mode)
  form.maxShutterLimit = defaultData.maximum_shutter_limit
  form.minShutterLimit = defaultData.minimum_shutter_limit
  form.gainLimit = defaultData.gain_limit
  form.lowLightShutter = apiBoolToUi(defaultData.low_illumination_electronic_shutter)
  form.focusMode = focusApiToUi(defaultData.focus_mode)
  form.minFocusDistance = defaultData.minimum_focal_distance
  form.dayNightConversion = dayNightApiToUi(defaultData.day_night_transition)
  form.sensitivity = String(defaultData.sensitivity)
  form.antiFillLightOverexposure = apiBoolToUi(defaultData.prevent_overexposure_during_supplementary_lighting)
  form.infraredLightMode = infraredApiToUi(defaultData.infrared_lamp_mode)
  form.brightnessLimit = defaultData.luminance_limit
  form.backlightCompensation = apiBoolToUi(defaultData.backlight_compensation)
  form.wideDynamic = apiBoolToUi(defaultData.wide_dynamic)
  form.strongLightSuppression = apiBoolToUi(defaultData.strong_light_suppression)
  form.whiteBalance = wbApiToUi(defaultData.white_balance)
  form.digitalNoiseReduction = dnrApiToUi(defaultData.digital_noise_reduction)
  form.noiseReductionLevel = defaultData.noise_reduction_level
  form.defogMode = apiBoolToUi(defaultData.fog_penetration_mode)
  form.electronicImageStabilization = apiBoolToUi(defaultData.electronic_image_stabilization)
  form.mirror = apiBoolToUi(defaultData.mirror_image)
  form.videoStandard = videoFormatApiToUi(defaultData.video_format)
  form.lensInitialization = apiBoolToUi(defaultData.lens_initialization)
  form.zoomLimit = String(defaultData.zoom_limit)

  // 调用保存接口
  const payload: any = {
    scene: defaultData.scene,
    brightness: defaultData.brightness,
    contrast: defaultData.contrast,
    saturation: defaultData.saturation,
    sharpness: defaultData.sharpness,
    exposure_mode: defaultData.exposure_mode,
    maximum_shutter_limit: defaultData.maximum_shutter_limit,
    minimum_shutter_limit: defaultData.minimum_shutter_limit,
    gain_limit: defaultData.gain_limit,
    low_illumination_electronic_shutter: defaultData.low_illumination_electronic_shutter,
    focus_mode: defaultData.focus_mode,
    minimum_focal_distance: defaultData.minimum_focal_distance,
    day_night_transition: defaultData.day_night_transition,
    sensitivity: defaultData.sensitivity,
    prevent_overexposure_during_supplementary_lighting: defaultData.prevent_overexposure_during_supplementary_lighting,
    infrared_lamp_mode: defaultData.infrared_lamp_mode,
    luminance_limit: defaultData.luminance_limit,
    backlight_compensation: defaultData.backlight_compensation,
    wide_dynamic: defaultData.wide_dynamic,
    strong_light_suppression: defaultData.strong_light_suppression,
    white_balance: defaultData.white_balance,
    digital_noise_reduction: defaultData.digital_noise_reduction,
    noise_reduction_level: defaultData.noise_reduction_level,
    fog_penetration_mode: defaultData.fog_penetration_mode,
    electronic_image_stabilization: defaultData.electronic_image_stabilization,
    mirror_image: defaultData.mirror_image,
    video_format: defaultData.video_format,
    lens_initialization: defaultData.lens_initialization,
    zoom_limit: defaultData.zoom_limit
  }
  if (store.userInfo?.accessToken) payload.accessToken = store.userInfo.accessToken

  const res: any = await saveDisplaySettings(payload)
  if (res?.code === 200) {
    ElMessage.success('恢复默认值成功')
    await fetchDisplaySettings()
  }
}

onMounted(() => {
  fetchDisplaySettings()
})
</script>

<style lang="scss" scoped>
.displaySettings {
  width: 100%;
  padding: 20px;

  :deep(.el-input,.el-input__wrapper,.el-select__wrapper,.el-select ) {
    height: 40px !important;
  }
}

// 场景选择
.scene-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;

  .scene-label {
    font-size: 16px;
    color: #333;
  }

  .scene-select {
    width: 200px;

    :deep(.el-input__wrapper) {
      height: 40px !important;
    }
  }
}

// 下方图像调节
.display_bottom {
  width: 560px;
  background-color: #fff;
  border-radius: 8px;
}

  .image-adjustment {
    padding: 20px;

  .sliders-container {
    width: 60%;
    padding: 20px 0;

    .slider-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
      gap: 8px;

      .slider-label {
        font-size: 14px;
        color: #333;
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
    }
  }

  .collapsible-settings {
    .setting-item-wrapper {
      .setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;

        .arrow-up {
          width: 24px;
          height: 24px;
        }

        .arrow-down {
          width: 24px;
          height: 24px;
        }
      }

      .setting-content {
        padding: 20px 0;

        .setting-row {
          display: flex;
          flex-direction: column;
          margin-bottom: 20px;
          gap: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .setting-label {
            font-size: 14px;
            color: #333;
          }

          .setting-select {
            width: 100%;
            max-width: 480px;

            :deep(.el-input__wrapper) {
              height: 40px !important;
            }
          }

          .slider-container {
            width: 60%;

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
        }
      }
    }
  }

  .reset-button-wrapper {
    display: flex;

    .reset-button {
      align-self: center;
      margin-top: 14px;
      background: var(--el-color-primary-hb);
      border: 1px solid var(--el-color-primary);
      border-radius: 20px;
      padding: 10px 16px;
      margin-bottom: 2px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      white-space: nowrap;

      span {
        font-size: 14px;
        color: var(--el-color-primary);
      }
    }
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
