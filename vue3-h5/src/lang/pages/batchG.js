/**
 * 页面文案英文映射（key 为中文原文，扁平结构）。
 * 本批次新增 key，配合 src/lang/index.js 的自定义 messageResolver 整键匹配。
 * 新增文案时保持 key 与页面里的原文完全一致。
 */
export default {
  '紧急程度': 'Priority',
  '严重': 'Critical',
  '工单循环': 'Work Order Recurrence',
  '即时': 'Immediate',
  '循环': 'Recurring',
  '循环类型': 'Recurrence Type',
  '循环设置': 'Recurrence Settings',
  '选择时间': 'Select time',
  '选择开始时间': 'Select start time',
  '选择触发时间': 'Select trigger time',
  '选择结束时间': 'Select end time',
  '请选择开始时间': 'Select start time',
  '请选择结束时间': 'Select end time',
  '触发日期': 'Trigger Date',
  '最后一天': 'Last Day',
  '巡查时间': 'Inspection Time',
  '时间图标': 'Time icon',
  '在开始时间点触发后，在一天内按设置的时间点触发工单，直到截至时间（截止时间无法一直执行）': 'After triggering at the start time, the work order is triggered at the set time points each day until the deadline (it cannot run indefinitely)',
  '在开始时间点触发后，在设置时间间隔天数后的当天内按设置的时间点触发工单，直到截止时间（截止时间无法一直执行）': 'After triggering at the start time, the work order is triggered at the set time points once every interval of days until the deadline (it cannot run indefinitely)',
  '在开始时间点触发后，在一周按设置的时间点触发工单，直到截止时间（截止时间无法一直执行）': 'After triggering at the start time, the work order is triggered at the set time points every week until the deadline (it cannot run indefinitely)',
  '在开始时间点后，在一月内按设置的时间点触发任务，直到截至时间': 'After the start time, the task is triggered at the set time points every month until the deadline',
  '每天按设置时间点触发，直到结束时间': 'Triggers at the set time points every day until the end time',
  '隔天按设置间隔触发，直到结束时间': 'Triggers at the set interval every other day until the end time',
  '每周按设置日期和时间触发，直到结束时间': 'Triggers on the set day and time every week until the end time',
  '每月按设置日期和时间触发，直到结束时间': 'Triggers on the set day and time every month until the end time',
  '编辑时间段': 'Edit Time Slot',
  '复制到…': 'Copy to…'
}
