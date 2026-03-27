// 最近1周、最近1月
// 今天的时间
const end = new Date()
const year: number = end.getFullYear()
const month: number = end.getMonth() + 1 // 0-11表示 1-12月
const day: number = end.getDate()
let dateStart = ''
let dateEnd = year + '-' + month + '-' + day
let endMonthDay = new Date(year, month, 0).getDate() // 当前月的总天数

// 获取近一周日期范围 2024-06-25 00:00:00 2024-07-02 23:59:59
export function getLastWeekDate() {
  if (day - 7 <= 0) { // 如果在当月7日之前
    const startMonthDay = new Date(year, (month - 1), 0).getDate() // 1周前所在月的总天数
    if (month - 1 <= 0) { // 如果在当年的1月份
      dateStart = (year - 1) + '-' + 12 + '-' + (31 - (7 - day))
    } else {
      dateStart = year + '-' + (month - 1) + '-' + (startMonthDay - (7 - day))
    }
  } else {
    dateStart = year + '-' + month + '-' + (day - 7)
  }
  const lastWeekDate = [dateStart, dateEnd]
  return lastWeekDate
}

// 获取近一个月日期范围 2024-06-25 00:00:00 2024-07-02 23:59:59
export function getLastMonthDate() {
  if (month - 1 <= 0) { // 如果是1月，年数往前推一年<br>
    dateStart = (year - 1) + '-' + 12 + '-' + day
  } else {
    const startMonthDay = new Date(year, (month - 1), 0).getDate()
    if (startMonthDay < day) { // 1个月前所在月的总天数小于现在的天日期
      if (day < endMonthDay) { // 当前天日期小于当前月总天数
        dateStart = year + '-' + (month - 1) + '-' + (startMonthDay - (endMonthDay - day))
      } else {
        dateStart = year + '-' + (month - 1) + '-' + startMonthDay
      }
    } else {
      dateStart = year + '-' + (month - 1) + '-' + day
    }
  }
  const newMonthDate = [dateStart, dateEnd]
  return newMonthDate
}
