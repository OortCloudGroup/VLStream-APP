// 将当前日期格式化为yyyy-MM-dd  hh:mm:ss
export const dataToTime = (n: any) => {
  if (!n) return n
  n = n || null
  let times = n.toLocaleString('en-US', { hour12: false }).split(' ')
  let t = times[1] === '24:00:00' ? '00:00:00' : times[1]
  let mdy = times[0].split('/')
  let m = parseInt(mdy[0]) < 10 ? `0${parseInt(mdy[0])}` : parseInt(mdy[0])
  let d = parseInt(mdy[1]) < 10 ? `0${parseInt(mdy[1])}` : parseInt(mdy[1])
  let y = parseInt(mdy[2])
  return y + '-' + m + '-' + d + ' ' + t
}
// 时间戳转换成时间
export const timestampToTime = (n: any) => {
  if (!n) return n
  if (n === 0) return n
  n = n || null
  let now = new Date(n * 1000) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let y = now.getFullYear()
  let m = now.getMonth() + 1
  let d = now.getDate()
  return y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + now.toTimeString().substr(0, 8)
}
// 时间转换为时间戳
export const timeToTimestamp = (n: any) => {
  n = n || null
  let t = Date.parse(new Date(n).toString()) / 1000
  return t
}
// 2023-04-25T18:54:35+08:00 格式化为yyyy-MM-dd
export const urlToTime = (n: any) => {
  n = n || null
  if (n) {
    let a = n.split('T')[0]
    let b = n.split('T')[1]
    let c = b.split('+')[0]
    let t = `${a} ${c}`
    return t
  }
}

// new Date转换成YY-MM-DD
export const formattedDate = (value: any) => {
  value = value || null
  let year = value.getFullYear()
  let month = (value.getMonth() + 1).toString().padStart(2, '0')
  let day = value.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 文件流下载
export function  downloadBlob(blob,fileName) {
  const url = window.URL.createObjectURL(blob)
  // 创建一个a元素模拟点击操作以触发下载
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  // 指定下载文件名
  a.download = fileName
  // 将a元素添加到DOM中
  document.body.appendChild(a)
  // 触发下载
  a.click()
  // 清理并移除DOM中的a元素
  document.body.removeChild(a)
  // 释放URL对象
  window.URL.revokeObjectURL(url)
}
