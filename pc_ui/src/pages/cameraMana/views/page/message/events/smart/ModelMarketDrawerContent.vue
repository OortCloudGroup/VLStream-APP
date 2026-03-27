<template>
  <div class="modelMarket">
    <div class="topTabs">
      <div
        v-for="t in tabs"
        :key="t.value"
        class="topTab"
        :class="{ act: activeTab === t.value }"
        @click="activeTab = t.value"
      >
        {{ t.label }}
      </div>
    </div>

    <div class="body">
      <div class="left">
        <div class="grid">
          <div
            v-for="m in filteredModels"
            :key="m.key"
            class="card"
            @click="toggle(m)"
          >
            <img class="checkIcon" :src="isSelected(m.key) ? xzbf : wxzbf" alt="" />
            <div class="cardBg" :style="{ backgroundImage: `url(${m.cover})` }" />
            <div class="cardMask" />
            <div class="cardText">
              <div class="cardTitle">
                {{ m.name }}
              </div>
              <span class="line" />
              <div class="cardSub">
                {{ m.groupLabel }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="right">
        <div class="selectedTitle">
          已选取模型
        </div>
        <div class="selectedList">
          <div v-for="m in selectedModels" :key="m.key" class="selectedRow">
            <div class="selectedName">
              {{ m.name }}
            </div>
            <div class="selectedClose" @click="remove(m.key)">
              ×
            </div>
          </div>
          <div v-if="selectedModels.length === 0" class="empty">
            暂无选择
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <el-button class="btnCancel" @click="emit('cancel')">
        取消
      </el-button>
      <el-button type="primary" class="btnOk" @click="handleOk">
        确定
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import wxzbf from '@/assets/img/camera/wxzbf.png'
import xzbf from '@/assets/img/camera/xzbf.png'

type ModelTab = { label: string; value: string }
type MarketModel = {
  key: string
  name: string
  group: string
  groupLabel: string
  cover: string
  eventType: string
}

const props = defineProps<{
  initialSelectedKeys?: string[]
}>()

const emit = defineEmits<{(e: 'cancel'): void
  (e: 'confirm', payload: { keys: string[]; models: { key: string; name: string; eventType: string }[] }): void
}>()

const tabs = ref<ModelTab[]>([
  { label: '全部', value: 'all' },
  { label: '人员检查类', value: 'people' },
  { label: '视频分析类', value: 'video' },
  { label: '人脸识别类', value: 'face' }
])

const activeTab = ref('all')

// 示例数据（可后续替换为接口）
const models = ref<MarketModel[]>([
  {
    key: 'mm1',
    name: '人流密度',
    group: 'people',
    groupLabel: '人员检查类',
    cover: 'https://picsum.photos/seed/mm1/420/260',
    eventType: 'crowd_density'
  },
  {
    key: 'mm2',
    name: '客流量统计',
    group: 'people',
    groupLabel: '人员检查类',
    cover: 'https://picsum.photos/seed/mm2/420/260',
    eventType: 'passenger_flow'
  },
  {
    key: 'mm3',
    name: '区域入侵侦测',
    group: 'video',
    groupLabel: '视频分析类',
    cover: 'https://picsum.photos/seed/mm3/420/260',
    eventType: 'region_intrusion'
  },
  {
    key: 'mm4',
    name: '越界侦测',
    group: 'video',
    groupLabel: '视频分析类',
    cover: 'https://picsum.photos/seed/mm4/420/260',
    eventType: 'line_crossing'
  },
  {
    key: 'mm5',
    name: '人脸识别',
    group: 'face',
    groupLabel: '人脸识别类',
    cover: 'https://picsum.photos/seed/mm5/420/260',
    eventType: 'face_recognition'
  },
  {
    key: 'mm6',
    name: '物品遗留侦测',
    group: 'video',
    groupLabel: '视频分析类',
    cover: 'https://picsum.photos/seed/mm6/420/260',
    eventType: 'object_left'
  },
  {
    key: 'mm7',
    name: '物品拿取侦测',
    group: 'video',
    groupLabel: '视频分析类',
    cover: 'https://picsum.photos/seed/mm7/420/260',
    eventType: 'object_taken'
  },
  {
    key: 'mm8',
    name: '音频异常侦测',
    group: 'video',
    groupLabel: '视频分析类',
    cover: 'https://picsum.photos/seed/mm8/420/260',
    eventType: 'audio_anomaly_detection'
  }
])

// 默认全选所有模型
const selectedKeys = ref<string[]>([])

watch(
  () => props.initialSelectedKeys,
  (v) => {
    if (v === undefined) {
      selectedKeys.value = models.value.map(m => m.key)
      return
    }
    selectedKeys.value = [...v]
  },
  { immediate: true }
)

const filteredModels = computed(() => {
  if (activeTab.value === 'all') return models.value
  return models.value.filter((m) => m.group === activeTab.value)
})

const isSelected = (key: string) => selectedKeys.value.includes(key)

const toggle = (m: MarketModel) => {
  if (isSelected(m.key)) {
    selectedKeys.value = selectedKeys.value.filter((k) => k !== m.key)
  } else {
    selectedKeys.value = [...selectedKeys.value, m.key]
  }
}

const remove = (key: string) => {
  selectedKeys.value = selectedKeys.value.filter((k) => k !== key)
}

const selectedModels = computed(() => {
  const set = new Set(selectedKeys.value)
  return models.value.filter((m) => set.has(m.key))
})

const handleOk = () => {
  emit('confirm', {
    keys: [...selectedKeys.value],
    models: selectedModels.value.map((m) => ({ key: m.key, name: m.name, eventType: m.eventType }))
  })
}
</script>

<style lang="scss" scoped>
.modelMarket {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.topTabs {
  display: flex;
  align-items: center;
  gap: 28px;
}

.topTab {
  position: relative;
  cursor: pointer;
  font-size: 14px;
  color: #9AA0A6;
  padding: 8px 2px;

  &.act {
    color: var(--el-color-primary);
    font-weight: 600;
  }

  &.act::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -6px;
    width: 100%;
    height: 2px;
    border-radius: 2px;
    background: var(--el-color-primary);
  }
}

.body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 570px;
  gap: 26px;
  padding: 18px 0 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding-right: 6px;
}

.card {
  position: relative;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: #F3F4F6;
}

.checkIcon {
  position: absolute;
  left: 8px;
  top: 8px;
  width: 24px;
  height: 24px;
  z-index: 3;
}

.cardBg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.1);
}

.cardMask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.cardText {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  color: #fff;
}

.line{
  display: flex;
  width: 30px;
  height: 3px;
  background: var(--el-color-primary);
}

.cardTitle {
  font-size: 18px;
  color: #FFFFFF;
}

.cardSub {
  font-size: 14px;
  color: #FFFFFF;
}

.selectedTitle {
  font-size: 16px;
  color: #333333;
  margin-bottom: 24px;
}

.selectedList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selectedRow {
  height: 48px;
  background: #F0F2F5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 14px;
}

.selectedName {
  font-size: 14px;
  color: #333333;
}

.selectedClose {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  cursor: pointer;
}

.empty {
  font-size: 14px;
  color: #9AA0A6;
  padding: 10px 0;
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 18px 0 6px;
}

.btnCancel {
  width: 120px;
  height: 40px;
}

.btnOk {
  width: 140px;
  height: 40px;
}
</style>

