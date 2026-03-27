import { formatDateToFull } from './index'
export const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob)
  // 创建一个a元素模拟点击操作以触发下载
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  // 指定下载文件名
  a.download = fileName || '数据-' + formatDateToFull(new Date()) + '.xlsx'
  // 将a元素添加到DOM中
  document.body.appendChild(a)
  // 触发下载
  a.click()
  // 清理并移除DOM中的a元素
  document.body.removeChild(a)
  // 释放URL对象
  window.URL.revokeObjectURL(url)
}
