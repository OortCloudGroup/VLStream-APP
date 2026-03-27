<template>
  <div class="alarmInputSchedule">
    <div class="toolbar_row">
      <div class="button-groupBox">
        <button-group
          :button-list="[
            { svg: 'del', name: '删除', clickFn: handleDelete },
            { svg: 'del', name: '删除全部', clickFn: handleDeleteAll },
          ]"
        />
      </div>
    </div>

    <div class="repeat_row">
      <div class="repeat_tabs">
        <div
          v-for="item in repeatTabs"
          :key="item.value"
          class="repeat_tab"
          :class="{ act: form.repeat === item.value }"
          @click="form.repeat = item.value"
        >
          {{ item.label }}
        </div>
      </div>
    </div>

    <div class="timeline_wrap">
      <div class="timeline_head">
        <div class="head_left" />
        <div class="head_right">
          <div class="ticks">
            <div v-for="t in ticks" :key="t" class="tick">
              <div class="tick_num">
                {{ t }}
              </div>
              <div class="tick_line" />
            </div>
          </div>
        </div>
      </div>

      <div v-for="day in dayRows" :key="day.key" class="timeline_row">
        <div class="row_label">
          {{ day.label }}
        </div>
        <div class="row_track">
          <div class="track_bg" />

          <div
            v-for="seg in segmentsByDay[day.key] || []"
            :key="seg.id"
            class="seg"
            :style="segmentStyle(seg)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import ButtonGroup from '@/components/buttonGroup.vue'

const form = reactive({
  repeat: 'month'
})

const repeatTabs = [
  { label: '每天', value: 'day' },
  { label: '隔天', value: 'next' },
  { label: '每周', value: 'week' },
  { label: '每月', value: 'month' }
]

const ticks = computed(() => [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])

// 根据选择的重复周期显示不同的行
const dayRows = computed(() => {
  if (form.repeat === 'month') {
    // 每月模式：显示1-10天
    return Array.from({ length: 10 }, (_, i) => ({
      key: `day${i + 1}`,
      label: `${i + 1}`
    }))
  } else if (form.repeat === 'week') {
    // 每周模式：显示星期一到星期日
    return [
      { key: 'mon', label: '星期一' },
      { key: 'tue', label: '星期二' },
      { key: 'wed', label: '星期三' },
      { key: 'thu', label: '星期四' },
      { key: 'fri', label: '星期五' },
      { key: 'sat', label: '星期六' },
      { key: 'sun', label: '星期日' }
    ]
  } else {
    // 每天/隔天模式：只显示一行
    return [{ key: 'day', label: '每天' }]
  }
})

type Seg = { id: string; start: number; end: number; color: string }
const segmentsByDay = reactive<Record<string, Seg[]>>({
  day5: [
    { id: 's1', start: 4, end: 12, color: '#25B6FF' }
  ],
  day10: [
    { id: 's2', start: 8, end: 16, color: '#25B6FF' }
  ]
})

const segmentStyle = (seg: Seg) => {
  const left = `${(seg.start / 24) * 100}%`
  const width = `${((seg.end - seg.start) / 24) * 100}%`
  return {
    left,
    width,
    background: seg.color
  }
}

const handleDelete = () => {
  // TODO: 删除选中时间段
}

const handleDeleteAll = () => {
  // TODO: 清空所有时间段
}
</script>

<style lang="scss" scoped>
.alarmInputSchedule {
  width: 100%;
}

// 顶部按钮（参考 ScheduledTask.vue）
.toolbar_row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.button-groupBox {
  display: flex;
  align-items: center;
}

// 重复周期 tabs（参考 ScheduledTask.vue）
.repeat_row {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.repeat_tabs {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid #2278FF;
  background: #fff;
  overflow: hidden;
}

.repeat_tab {
  padding: 10px 22px;
  font-size: 14px;
  color: #6B7280;
  cursor: pointer;
  background: transparent;
  margin: 2px;

  &.act {
    color: #2278FF;
    background: rgba(34, 120, 255, 0.1216);
    border-radius: 999px;
  }
}

// 时间轴（参考 ScheduledTask.vue）
.timeline_wrap {
  width: 1000px;
  margin-top: 14px;
  background: #F3F4F6;
  border-radius: 8px;
  padding: 10px 14px 16px;
}

.timeline_head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.head_left {
  width: 70px;
}

.head_right {
  flex: 1;
}

.ticks {
  display: flex;
  justify-content: space-between;
}

.tick {
  position: relative;
  width: calc(100% / 12);
  display: flex;
  flex-direction: column;
  align-items: center;

  .tick_num {
    font-size: 14px;
    color: #333;
    transform: translateX(50%);
  }

  .tick_line {
    width: 1px;
    height: 8px;
    background: #D1D5DB;
    transform: translateX(50%);
  }
}

.timeline_row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
}

.row_label {
  width: 70px;
  font-size: 14px;
  color: #333;
}

.row_track {
  flex: 1;
  position: relative;
  height: 34px;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
}

.track_bg {
  position: absolute;
  inset: 0;
  background: #fff;
}

.seg {
  position: absolute;
  top: 0;
  height: 100%;
}
</style>
