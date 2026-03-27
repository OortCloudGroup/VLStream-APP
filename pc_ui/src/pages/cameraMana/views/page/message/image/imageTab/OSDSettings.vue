<template>
  <div class="osdSettings">
    <div class="osd_top">
      <!-- 上方：视频预览、PTZ控制和预置点 -->
      <RoiTop
        v-model:roi-points="roiPoints"
        :osd-lines="osdLines"
        @update:osd-lines="handleOsdLinesUpdate"
      />

      <!-- 右侧：OSD设置表单 -->
      <div class="osd_right_config">
        <div class="osd_config">
          <!-- 显示选项标题栏 -->
          <div class="display-header">
            <el-checkbox v-model="form.displayName">
              显示名称
            </el-checkbox>
            <el-checkbox v-model="form.displayDate">
              显示日期
            </el-checkbox>
            <el-checkbox v-model="form.displayWeek">
              显示星期
            </el-checkbox>
          </div>

          <el-form class="sbForm" label-position="top" :model="form">
            <!-- 通道名称 -->
            <el-form-item label="通道名称">
              <el-input v-model="form.channelName" placeholder="请输入" class="full-input" />
            </el-form-item>

            <!-- 时间格式 -->
            <el-form-item label="时间格式">
              <el-select v-model="form.timeFormat" placeholder="请选择" class="full-select">
                <el-option label="24小时制" value="24h" />
                <el-option label="12小时制" value="12h" />
              </el-select>
            </el-form-item>

            <!-- 日期格式 -->
            <el-form-item label="日期格式">
              <el-input v-model="form.dateFormat" placeholder="请输入" class="full-input" />
            </el-form-item>

            <!-- 字符叠加 -->
            <el-form-item label="字符叠加">
              <div class="character-overlay">
                <div
                  v-for="(line, index) in osdLines"
                  :key="index"
                  class="overlay-item"
                >
                  <el-checkbox v-model="line.enable" />
                  <span class="overlay-number">{{ index + 1 }}</span>
                  <el-input v-model="line.text" placeholder="请输入" class="overlay-input" />
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 下方：OSD属性 -->
    <div class="osd_bottom">
      <div class="osd_bottom_config">
        <el-form class="sbForm" label-position="top" :model="form">
          <el-form-item label="OSD属性">
            <el-select v-model="form.osdAttribute" placeholder="请选择" class="full-select">
              <el-option label="不透明,不闪烁" value="opaque_no_flicker" />
              <el-option label="透明,不闪烁" value="transparent_no_flicker" />
              <el-option label="不透明,闪烁" value="opaque_flicker" />
              <el-option label="透明,闪烁" value="transparent_flicker" />
            </el-select>
          </el-form-item>

          <el-form-item label="OSD字体">
            <el-select v-model="form.osdFont" placeholder="请选择" class="full-select">
              <el-option label="自适应" value="adaptive" />
            </el-select>
          </el-form-item>

          <el-form-item label="OSD颜色">
            <div class="osd-color-row">
              <el-select v-model="osdColorSelect" placeholder="请选择" class="full-select">
                <el-option label="黑白自动" value="bw_auto" />
                <el-option label="红色" value="red" />
                <el-option label="蓝色" value="blue" />
                <el-option label="绿色" value="green" />
                <el-option label="自定义颜色" value="custom" />
              </el-select>
              <el-color-picker
                v-model="customColor"
                class="osd-color-picker"
                :teleported="false"
                @change="handleCustomColorChange"
              />
            </div>
          </el-form-item>

          <el-form-item label="对齐方式">
            <el-select v-model="form.alignment" placeholder="请选择" class="full-select">
              <el-option label="自适应" value="adaptive" />
            </el-select>
          </el-form-item>

          <el-form-item label="灵敏度">
            <el-select v-model="form.sensitivity" placeholder="请选择" class="full-select">
              <el-option
                v-for="i in 10"
                :key="i"
                :label="String(i)"
                :value="String(i)"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 底部保存按钮 -->
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
import { getOsd, saveOsd } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  displayName: false,
  displayDate: false,
  displayWeek: false,
  channelName: '',
  timeFormat: '24h',
  dateFormat: '',
  overlay1: {
    enable: false,
    text: ''
  },
  overlay2: {
    enable: false,
    text: ''
  },
  overlay3: {
    enable: false,
    text: ''
  },
  osdAttribute: 'opaque_no_flicker',
  osdFont: 'adaptive',
  osdColor: 'bw_auto',
  alignment: 'adaptive',
  sensitivity: '1'
})

const osdLines = ref<Array<{ enable: boolean; text: string; rect: number[][] | null }>>([
  { enable: false, text: '', rect: null },
  { enable: false, text: '', rect: null },
  { enable: false, text: '', rect: null }
])

// OSD颜色：下拉选中值和自定义颜色
const osdColorSelect = ref('bw_auto')
const customColor = ref('#FFFFFF')

// 辅助：将 [r,g,b] 字符串转换为十六进制颜色
const rgbArrayStringToHex = (s: string) => {
  try {
    const arr = JSON.parse(s)
    if (Array.isArray(arr) && arr.length === 3) {
      const [r, g, b] = arr.map((n: any) => Number(n) || 0)
      const toHex = (n: number) => n.toString(16).padStart(2, '0')
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
  } catch (_e) {
    // ignore
  }
  return '#FFFFFF'
}

// 辅助：将十六进制颜色转为 [r,g,b] 字符串
const hexToRgbArrayString = (hex: string) => {
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h.split('').map(ch => ch + ch).join('')
  }
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return `[${r},${g},${b}]`
}

// 辅助：将十六进制颜色转为 [r,g,b] 数组（用于接口）
const hexToRgbArray = (hex: string) => {
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h.split('').map(ch => ch + ch).join('')
  }
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return [r, g, b]
}

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

// 数据转换函数：API -> UI
const osdAttributeApiToUi = (v: any) => {
  const s = String(v || '')
  if (s.includes('不透明') && s.includes('不闪烁')) return 'opaque_no_flicker'
  if (s.includes('透明') && s.includes('不闪烁')) return 'transparent_no_flicker'
  if (s.includes('不透明') && s.includes('闪烁')) return 'opaque_flicker'
  if (s.includes('透明') && s.includes('闪烁')) return 'transparent_flicker'
  return 'opaque_no_flicker'
}

const osdFontApiToUi = (v: any) => {
  const s = String(v || '')
  if (s.includes('适应') || s.includes('自适应')) return 'adaptive'
  return 'adaptive'
}

const osdColorApiToUi = (v: any) => {
  // 如果返回的是数组格式 [r,g,b]，转换为字符串格式 "[r,g,b]"
  if (Array.isArray(v) && v.length === 3) {
    return `[${v[0]},${v[1]},${v[2]}]`
  }
  const s = String(v || '')
  // 自定义RGB颜色，直接保留原始字符串，保存时也原样回传
  if (s.startsWith('[') && s.endsWith(']')) return s
  if (s.includes('黑白自动')) return 'bw_auto'
  if (s.includes('红色')) return 'red'
  if (s.includes('蓝色')) return 'blue'
  if (s.includes('绿色')) return 'green'
  return 'bw_auto'
}

const alignmentApiToUi = (v: any) => {
  const s = String(v || '')
  if (s.includes('自适应')) return 'adaptive'
  return 'adaptive'
}

const timeFormatApiToUi = (v: any) => {
  const s = String(v || '')
  if (s.includes('24')) return '24h'
  if (s.includes('12')) return '12h'
  return '24h'
}

// 数据转换函数：UI -> API
const osdAttributeUiToApi = (v: any) => {
  if (v === 'transparent_no_flicker') return '透明,不闪烁'
  if (v === 'opaque_flicker') return '不透明,闪烁'
  if (v === 'transparent_flicker') return '透明,闪烁'
  return '不透明,不闪烁'
}

const osdFontUiToApi = (_v: any) => {
  return '自适应'
}

const osdColorUiToApi = (v: any) => {
  const s = String(v || '')
  // 如果是自定义RGB字符串，直接原样返回
  if (s.startsWith('[') && s.endsWith(']')) return s
  if (s === 'red') return '红色'
  if (s === 'blue') return '蓝色'
  if (s === 'green') return '绿色'
  return '黑白自动'
}

const alignmentUiToApi = (_v: any) => {
  return '自适应'
}

const timeFormatUiToApi = (v: any) => {
  return v === '12h' ? '12小时制' : '24小时制'
}

// 获取OSD设置
const fetchOsd = async() => {
  const params: any = {}
  if (store.userInfo?.accessToken) params.accessToken = store.userInfo.accessToken

  const res: any = await getOsd(params)
  if (res?.code === 200 && res?.data) {
    const d = res.data
    form.displayName = Boolean(d.name ?? form.displayName)
    form.displayDate = Boolean(d.date ?? form.displayDate)
    form.displayWeek = Boolean(d.week ?? form.displayWeek)
    form.channelName = d.channel_name ?? form.channelName
    form.timeFormat = timeFormatApiToUi(d.time_format)
    form.dateFormat = d.date_format ?? form.dateFormat

    const lines: Array<{ enable: boolean; text: string; rect: number[][] | null }> = []
    let lineIndex = 1
    let hasMoreLines = true
    while (hasMoreLines) {
      const lineKey = `line${lineIndex}` as keyof typeof d
      const lineData = d[lineKey]
      if (!lineData) {
        hasMoreLines = false
        break
      }

      if (typeof lineData === 'object' && lineData !== null) {
        lines.push({
          enable: Boolean(lineData.enable ?? false),
          text: lineData.text ?? '',
          rect: Array.isArray(lineData.rect) ? lineData.rect : null
        })
      } else {
        // 兼容旧格式
        const textKey = `line${lineIndex}_text` as keyof typeof d
        const rectKey = `line${lineIndex}_rect` as keyof typeof d
        lines.push({
          enable: Boolean(lineData ?? false),
          text: (d[textKey] as string) ?? '',
          rect: Array.isArray(d[rectKey]) ? (d[rectKey] as number[][]) : null
        })
      }
      lineIndex++
    }

    if (lines.length > 0) {
      osdLines.value = lines
    }

    form.osdAttribute = osdAttributeApiToUi(d.osd_attribute)
    form.osdFont = osdFontApiToUi(d.osd_font)
    const colorUi = osdColorApiToUi(d.osd_color)
    // 如果为自定义RGB，使用颜色选择器；否则使用预设颜色
    if (typeof colorUi === 'string' && colorUi.startsWith('[') && colorUi.endsWith(']')) {
      osdColorSelect.value = 'custom'
      customColor.value = rgbArrayStringToHex(colorUi)
      form.osdColor = colorUi
    } else {
      osdColorSelect.value = colorUi
      form.osdColor = colorUi
    }
    form.alignment = alignmentApiToUi(d.alignment)
    if (d.sensitivity !== undefined) {
      form.sensitivity = String(d.sensitivity)
    }
  }
}

// 自定义颜色选中时的回调
const handleCustomColorChange = (color: string) => {
  if (!color) return
  osdColorSelect.value = 'custom'
  customColor.value = color
  form.osdColor = hexToRgbArrayString(color)
}

// 处理 OSD lines 更新
const handleOsdLinesUpdate = (lines: Array<{ enable: boolean; text: string; rect: number[][] | null }>) => {
  osdLines.value = lines
}

// 保存OSD设置
const handleSave = async() => {
  // 处理 osd_color：如果是自定义颜色，转换为 [r,g,b] 数组格式；否则使用预设颜色字符串
  let osdColorValue: number[] | string
  if (osdColorSelect.value === 'custom') {
    osdColorValue = hexToRgbArray(customColor.value)
  } else {
    const presetColor = osdColorUiToApi(osdColorSelect.value)
    osdColorValue = presetColor
  }

  const params: any = {
    name: form.displayName,
    date: form.displayDate,
    week: form.displayWeek,
    channel_name: form.channelName,
    time_format: timeFormatUiToApi(form.timeFormat),
    date_format: form.dateFormat,
    osd_attribute: osdAttributeUiToApi(form.osdAttribute),
    osd_font: osdFontUiToApi(form.osdFont),
    osd_color: osdColorValue,
    alignment: alignmentUiToApi(form.alignment)
  }

  osdLines.value.forEach((line, index) => {
    if (line.enable || line.rect) {
      const lineKey = `line${index + 1}` as keyof typeof params
      params[lineKey] = {
        enable: line.enable,
        text: line.text || '',
        rect: line.rect && Array.isArray(line.rect) ? line.rect : null
      }
    }
  })

  const res: any = await saveOsd(params)
  if (res?.code === 200) {
    ElMessage.success('保存成功')
    await fetchOsd()
  }
}

onMounted(() => {
  fetchOsd()
})
</script>

<style lang="scss" scoped>
.osdSettings {
  width: 100%;
  padding: 20px;
}

// 最右侧OSD设置表单
.osd_right_config {
  flex: 1;
  background-color: #fff;
  height: fit-content;
}

.osd_config {
  .display-header {
    margin-bottom: 20px;
    display: flex;
    gap: 20px;

    :deep(.el-checkbox) {
      .el-checkbox__label {
        font-size: 14px;
        color: #333;
      }
    }
  }

  .sbForm {
    .el-input {
      height: 40px;
    }
  }
}

.full-input {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
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

  &:first-child {
    margin-top: 0;
  }
}

.character-overlay {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .overlay-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;

    .overlay-number {
      width: 24px;
      text-align: center;
      font-size: 14px;
      color: #333;
    }

    .overlay-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        height: 40px !important;
      }
    }
  }
}

// 下方OSD属性区域
.osd_bottom {
  width: 480px;
  margin-top: 20px;
}

.osd_bottom_config {
  background-color: #fff;
}

.submitBox {
  padding: 40px 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;

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

.osd_top{
  display: flex;
  gap: 20px;
}

.osd-color-row{
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
</style>
