
import { ref, reactive } from 'vue'

// 解析时区偏移字符串，返回分钟数
function parseTimezoneOffset(offsetStr) {
  // 匹配 UTC+08:00 或 UTC-05:00 格式
  const match = offsetStr.match(/UTC([+-])(\d{2}):(\d{2})/)
  if (!match) {
    throw new Error(`Invalid timezone offset format: ${offsetStr}`)
  }

  const sign = match[1] === '+' ? 1 : -1
  const hours = parseInt(match[2], 10)
  const minutes = parseInt(match[3], 10)

  return sign * (hours * 60 + minutes)
}

// 转换时区的核心函数
export function convertTimezone(originalTime, originalOffsetStr, targetOffsetStr) {
  try {
    // 解析原始时间
    const originalDate = new Date(originalTime.replace(' ', 'T'))
    if (isNaN(originalDate.getTime())) {
      throw new Error(`Invalid date format: ${originalTime}`)
    }

    // 解析时区偏移
    const originalOffsetMinutes = parseTimezoneOffset(originalOffsetStr)
    const targetOffsetMinutes = parseTimezoneOffset(targetOffsetStr)

    // 计算时区差异（分钟）
    const offsetDiffMinutes = targetOffsetMinutes - originalOffsetMinutes

    // 应用时区转换
    const convertedDate = new Date(originalDate.getTime() + offsetDiffMinutes * 60 * 1000)

    // 格式化输出
    const year = convertedDate.getFullYear()
    const month = String(convertedDate.getMonth() + 1).padStart(2, '0')
    const day = String(convertedDate.getDate()).padStart(2, '0')
    const hours = String(convertedDate.getHours()).padStart(2, '0')
    const minutes = String(convertedDate.getMinutes()).padStart(2, '0')
    const seconds = String(convertedDate.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    console.error('Timezone conversion error:', error)
    throw error
  }
}

// Vue 3 组合式 API 使用示例
export function useTimezoneConverter() {
  const form = reactive({
    originalTime: '2006-01-02 15:04:05',
    originalOffsetStr: 'UTC+08:00',
    targetOffsetStr: 'UTC+09:00'
  })

  const result = ref('')
  const error = ref('')

  const convert = () => {
    try {
      error.value = ''
      result.value = convertTimezone(
        form.originalTime,
        form.originalOffsetStr,
        form.targetOffsetStr
      )
    } catch (err:any) {
      error.value = err.message
      result.value = ''
    }
  }

  return {
    form,
    result,
    error,
    convert,
    convertTimezone // 导出核心函数供直接调用
  }
}


