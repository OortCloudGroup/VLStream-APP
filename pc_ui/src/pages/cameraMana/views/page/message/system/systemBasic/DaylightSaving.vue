<template>
  <div>
    <el-form label-position="top" class="sbForm" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.enable">
          启用夏令时
        </el-checkbox>
      </el-form-item>
      <el-form-item label="开始时间">
        <div class="time-select-group">
          <el-select v-model="form.startMonth" placeholder="请选择" class="time-select" @change="updateStartDate">
            <el-option
              v-for="item in monthOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select v-model="form.startOrder" placeholder="请选择" class="time-select" @change="updateStartDate">
            <el-option
              label="首个"
              value="首个"
            />
          </el-select>
          <el-select v-model="form.startWeekday" placeholder="请选择" class="time-select" @change="updateStartDate">
            <el-option
              v-for="item in weekdayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select v-model="form.startDay" placeholder="请选择" class="time-select" @change="updateStartWeekday">
            <el-option
              v-for="item in startDayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="结束">
        <div class="time-select-group">
          <el-select v-model="form.endMonth" placeholder="请选择" class="time-select" @change="updateEndDate">
            <el-option
              v-for="item in monthOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select v-model="form.endOrder" placeholder="请选择" class="time-select" @change="updateEndDate">
            <el-option
              label="末个"
              value="末个"
            />
          </el-select>
          <el-select v-model="form.endWeekday" placeholder="请选择" class="time-select" @change="updateEndDate">
            <el-option
              v-for="item in weekdayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select v-model="form.endDay" placeholder="请选择" class="time-select" @change="updateEndWeekday">
            <el-option
              v-for="item in endDayOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="偏移时间">
        <div class="offset-time-wrapper">
          <el-select v-model="form.offsetTime" placeholder="请选择" class="offset-time-select">
            <el-option
              v-for="item in offsetOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
import { ref, onMounted, computed } from 'vue'
import { getDaylight, saveDaylight } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  enable: false,
  startMonth: '',
  startOrder: '首个',
  startWeekday: '',
  startDay: '',
  endMonth: '',
  endOrder: '末个',
  endWeekday: '',
  endDay: '',
  offsetTime: ''
})

// 根据月份、顺序、星期几计算具体日期
const calculateDate = (year: number, month: number, order: string, weekday: number): number => {
  // 获取该月第一天
  const firstDay = new Date(year, month - 1, 1)
  const firstWeekday = firstDay.getDay()

  // 计算第一个目标星期几的日期
  let targetDay = 1
  if (firstWeekday <= weekday) {
    targetDay = weekday - firstWeekday + 1
  } else {
    targetDay = 7 - firstWeekday + weekday + 1
  }

  // 根据顺序计算具体日期
  if (order === 'first' || order === '首个') {
    return targetDay
  } else if (order === 'second') {
    return targetDay + 7
  } else if (order === 'third') {
    return targetDay + 14
  } else if (order === 'fourth') {
    return targetDay + 21
  } else {
    // 末个：找到该月最后一个目标星期几
    const lastDay = new Date(year, month, 0)
    const lastDayNum = lastDay.getDate()

    // 从最后一天往前找
    let day = lastDayNum
    while (day > 0 && new Date(year, month - 1, day).getDay() !== weekday) {
      day--
    }
    return day
  }
}

// 根据日期计算星期几
const calculateWeekday = (year: number, month: number, day: number): number => {
  const date = new Date(year, month - 1, day)
  return date.getDay()
}

// 生成日期选项（1-31号）
const generateDayOptions = (month: number): Array<{ label: string, value: string }> => {
  const year = new Date().getFullYear()
  const lastDay = new Date(year, month, 0).getDate()
  return Array.from({ length: lastDay }, (_, i) => {
    const day = i + 1
    return { label: `${day}`, value: String(day) }
  })
}

// 开始日期选项
const startDayOptions = computed(() => {
  if (!form.value.startMonth) {
    return []
  }
  return generateDayOptions(Number(form.value.startMonth))
})

// 结束日期选项
const endDayOptions = computed(() => {
  if (!form.value.endMonth) {
    return []
  }
  return generateDayOptions(Number(form.value.endMonth))
})

// 更新开始日期（当月份、顺序、星期几变化时）
const updateStartDate = () => {
  if (form.value.startMonth && form.value.startWeekday) {
    const year = new Date().getFullYear()
    const month = Number(form.value.startMonth)
    const weekday = Number(form.value.startWeekday)
    const order = 'first'

    const day = calculateDate(year, month, order, weekday)
    form.value.startDay = String(day)
  }
}

// 更新开始星期几（当日期变化时）
const updateStartWeekday = () => {
  if (form.value.startMonth && form.value.startDay) {
    const year = new Date().getFullYear()
    const month = Number(form.value.startMonth)
    const day = Number(form.value.startDay)

    const weekday = calculateWeekday(year, month, day)
    form.value.startWeekday = String(weekday)
  }
}

// 更新结束日期（当月份、顺序、星期几变化时）
const updateEndDate = () => {
  if (form.value.endMonth && form.value.endWeekday) {
    const year = new Date().getFullYear()
    const month = Number(form.value.endMonth)
    const weekday = Number(form.value.endWeekday)
    const order = 'last'

    const day = calculateDate(year, month, order, weekday)
    form.value.endDay = String(day)
  }
}

// 更新结束星期几（当日期变化时）
const updateEndWeekday = () => {
  if (form.value.endMonth && form.value.endDay) {
    const year = new Date().getFullYear()
    const month = Number(form.value.endMonth)
    const day = Number(form.value.endDay)

    const weekday = calculateWeekday(year, month, day)
    form.value.endWeekday = String(weekday)
  }
}

// 构建开始时间字符串
const buildStartTime = (): string => {
  if (!form.value.startMonth || !form.value.startDay) {
    return ''
  }

  const year = new Date().getFullYear()
  const month = Number(form.value.startMonth)
  const day = Number(form.value.startDay)

  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')

  return `${year}-${monthStr}-${dayStr} 00:00:00`
}

// 构建结束时间字符串
const buildEndTime = (): string => {
  if (!form.value.endMonth || !form.value.endDay) {
    return '00:00:00'
  }

  const year = new Date().getFullYear()
  const month = Number(form.value.endMonth)
  const day = Number(form.value.endDay)

  const monthStr = String(month).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')

  return `${year}-${monthStr}-${dayStr} 00:00:00`
}

// 构建偏移时间字符串
const buildOffsetTime = (): string => {
  if (!form.value.offsetTime) {
    return ''
  }

  const year = new Date().getFullYear()
  const month = 5
  const day = 22
  const hour = 12
  const minutes = form.value.offsetTime

  return `${year}-${month}-${day} ${hour}:${minutes}:00`
}

const fetchDaylight = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await getDaylight(params)
  if (res.code === 200 && res.data) {
    form.value.enable = res.data.daylight || false

    // 解析 start_time: "2025-07-29 12:00:00"
    if (res.data.start_time) {
      const startDate = new Date(res.data.start_time.replace(/-/g, '/'))
      if (!isNaN(startDate.getTime())) {
        form.value.startMonth = String(startDate.getMonth() + 1)
        form.value.startWeekday = String(startDate.getDay())
        form.value.startDay = String(startDate.getDate())
      }
    }

    // 解析 end_time: "2025-07-29 03:00:00" 或 "03:00:00"
    if (res.data.end_time) {
      // 判断是否包含日期
      if (res.data.end_time.includes('-')) {
        // 包含日期时间
        const endDate = new Date(res.data.end_time.replace(/-/g, '/'))
        if (!isNaN(endDate.getTime())) {
          form.value.endMonth = String(endDate.getMonth() + 1)
          form.value.endWeekday = String(endDate.getDay())
          form.value.endDay = String(endDate.getDate())
        }
      }
    }

    // offset_time: "2025-5-22 12:00:00" - 提取分钟数或直接使用
    if (res.data.offset_time) {
      const offsetValue = res.data.offset_time
      if (['15', '30', '45', '60'].includes(offsetValue)) {
        form.value.offsetTime = offsetValue
      } else {
        // 如果是日期时间格式，尝试提取分钟数
        const offsetDate = new Date(offsetValue.replace(/-/g, '/'))
        if (!isNaN(offsetDate.getTime())) {
          const minutes = offsetDate.getMinutes()
          // 如果分钟数匹配选项，使用它
          if (['15', '30', '45', '60'].includes(String(minutes))) {
            form.value.offsetTime = String(minutes)
          }
        }
      }
    }
  }
}

const handleSave = async() => {
  const startTime = buildStartTime()
  const endTime = buildEndTime()
  const offsetTime = buildOffsetTime()

  if (!startTime) {
    ElMessage.warning('请填写完整的开始时间')
    return
  }

  if (!endTime || endTime === '00:00:00') {
    ElMessage.warning('请填写完整的结束时间')
    return
  }

  const params = {
    accessToken: store.userInfo?.accessToken,
    daylight: form.value.enable,
    start_time: startTime,
    end_time: endTime,
    offset_time: offsetTime
  }

  const res = await saveDaylight(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchDaylight()
  }
}

onMounted(() => {
  fetchDaylight()
})

const monthOptions = [
  { label: '一月', value: '1' },
  { label: '二月', value: '2' },
  { label: '三月', value: '3' },
  { label: '四月', value: '4' },
  { label: '五月', value: '5' },
  { label: '六月', value: '6' },
  { label: '七月', value: '7' },
  { label: '八月', value: '8' },
  { label: '九月', value: '9' },
  { label: '十月', value: '10' },
  { label: '十一月', value: '11' },
  { label: '十二月', value: '12' }
]

const weekdayOptions = [
  { label: '星期日', value: '0' },
  { label: '星期一', value: '1' },
  { label: '星期二', value: '2' },
  { label: '星期三', value: '3' },
  { label: '星期四', value: '4' },
  { label: '星期五', value: '5' },
  { label: '星期六', value: '6' }
]

const offsetOptions = [
  { label: '15分钟', value: '15' },
  { label: '30分钟', value: '30' },
  { label: '45分钟', value: '45' },
  { label: '60分钟', value: '60' }
]
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

.time-select-group {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  .time-select {
    flex: 1;
    height: 40px;

    :deep(.el-input__wrapper) {
      height: 40px !important;
    }
  }
}

.offset-time-wrapper {
  width: 100%;
}

.offset-time-select {
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
