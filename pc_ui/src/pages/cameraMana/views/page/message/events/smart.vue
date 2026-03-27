<template>
  <div class="smart_page">
    <!-- 顶部：设备信息 -->
    <div class="deviceCard">
      <div class="deviceTitle">
        XXX摄像机
      </div>
      <div class="deviceInfoGrid">
        <div class="infoItem">
          <div class="infoLabel">
            设备型号
          </div>
          <div class="infoValue">
            N931
          </div>
        </div>
        <div class="infoItem">
          <div class="infoLabel">
            设备ID
          </div>
          <div class="infoValue">
            616891
          </div>
        </div>
        <div class="infoItem">
          <div class="infoLabel">
            设备类型
          </div>
          <div class="infoValue">
            97球机
          </div>
        </div>
      </div>
    </div>

    <!-- 本地模型 -->
    <div class="sectionTitle">
      <span class="line" />
      <span>本地模型</span>
    </div>
    <div class="modelActions">
      <el-button class="marketBtn newBtn flexRowAC" type="primary" @click="drawerVisible = true">
        <img src="@/assets/img/camera/mxcs.png" alt="" />
        <span>模型超市</span>
      </el-button>
    </div>

    <!-- 主体：左列表 + 右配置 -->
    <div v-if="modelList.length > 0" class="main">
      <div class="left">
        <div
          v-for="m in modelList"
          :key="m.key"
          class="modelRow"
          :class="{ act: activeModel === m.key }"
          @click="activeModel = m.key"
        >
          <span class="modelName">{{ m.name }}</span>
          <span class="modelClose" @click.stop="handleRemove(m.key)">×</span>
        </div>
      </div>

      <div class="right">
        <el-tabs v-model="activeTab" class="smart-tabs">
          <el-tab-pane label="异常侦测" name="t1" />
          <el-tab-pane label="布防时间" name="t2" />
          <el-tab-pane label="联动方式" name="t3" />
        </el-tabs>

        <AbnormalDetectionTab
          v-if="activeTab === 't1'"
          v-model:anomaly-detection="form.anomaly_detection"
        />
        <DefenseTime
          v-else-if="activeTab === 't2'"
          v-model:protection-time="form.schedule_time"
        />
        <LinkageMethodTab
          v-else-if="activeTab === 't3'"
          v-model:linkage-mode="form.linkage_mode"
        />
      </div>
    </div>

    <div v-if="modelList.length > 0" class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>

    <el-drawer
      v-model="drawerVisible"
      class="smartMarketDrawer"
      title="模型超市"
      size="86%"
      direction="rtl"
      :destroy-on-close="true"
    >
      <ModelMarketDrawerContent
        :initial-selected-keys="marketInitialSelectedKeys"
        @cancel="drawerVisible = false"
        @confirm="handleMarketConfirm"
      />
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import AbnormalDetectionTab from './smart/AbnormalDetectionTab.vue'
import DefenseTime from '@/pages/cameraMana/views/page/message/events/eventsTab/components/DefenseTime.vue'
import LinkageMethodTab from './smart/LinkageMethodTab.vue'
import ModelMarketDrawerContent from './smart/ModelMarketDrawerContent.vue'
import { getAiWventConfig, saveAiEventConfig } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

const activeTab = ref('t1')
const drawerVisible = ref(false)

// 所有可用的模型列表
const allModels = [
  { key: 'mm1', name: '人流密度', eventType: 'crowd_density' },
  { key: 'mm2', name: '客流量统计', eventType: 'passenger_flow' },
  { key: 'mm3', name: '区域入侵侦测', eventType: 'region_intrusion' },
  { key: 'mm4', name: '越界侦测', eventType: 'line_crossing' },
  { key: 'mm5', name: '人脸识别', eventType: 'face_recognition' },
  { key: 'mm6', name: '物品遗留侦测', eventType: 'object_left' },
  { key: 'mm7', name: '物品拿取侦测', eventType: 'object_taken' },
  { key: 'mm8', name: '音频异常侦测', eventType: 'audio_anomaly_detection' }
]

// 根据 event_list 过滤后的模型列表
const modelList = ref([...allModels])

// 默认选中第一个模型
const activeModel = ref(modelList.value[0]?.key || 'mm1')

const allowSyncModelListFromServer = ref(true)

const form = reactive({
  event_list: [] as string[],
  event_type: modelList.value[0]?.eventType || 'crowd_density',
  enabled: true,
  anomaly_detection: {
    abnormal_audio_input: true,
    sound_intensity_rises_steeply: true,
    sensitivity1: 50,
    sound_intensity_threshold: 40,
    sound_intensity_drops_sharply: true,
    sensitivity2: 45
  },
  schedule_time: {
    frequency: '每天',
    time_periods: []
  },
  linkage_mode: {
    regular_linkage: false,
    email_linkage: false,
    upload_center: false,
    upload_ftp_sd_card_nas: false,
    linkage_alarm_output: false,
    A_1: false,
    linkage_video: false,
    A1: false
  }
})

const defaultFormData = () => ({
  enabled: true,
  anomaly_detection: {
    abnormal_audio_input: true,
    sound_intensity_rises_steeply: true,
    sensitivity1: 50,
    sound_intensity_threshold: 40,
    sound_intensity_drops_sharply: true,
    sensitivity2: 45
  },
  schedule_time: {
    frequency: '每天',
    time_periods: []
  },
  linkage_mode: {
    regular_linkage: false,
    email_linkage: false,
    upload_center: false,
    upload_ftp_sd_card_nas: false,
    linkage_alarm_output: false,
    A_1: false,
    linkage_video: false,
    A1: false
  }
})

const marketInitialSelectedKeys = computed(() => {
  const list = form.event_list
  if (!Array.isArray(list)) return undefined
  const set = new Set(list)
  return allModels.filter(m => set.has(m.eventType)).map(m => m.key)
})

// 监听 activeModel 变化，更新 event_type
watch(activeModel, (newKey) => {
  if (!newKey) return
  const model = modelList.value.find(m => m.key === newKey)
  if (model) {
    form.event_type = model.eventType
    fetchAiEventConfig(model.eventType)
  }
})

// 根据 event_list 控制展示
const updateModelListByEventList = (eventList: string[]) => {
  if (Array.isArray(eventList) && eventList.length === 0) {
    modelList.value = []
    activeModel.value = ''
    form.event_type = ''
    return
  }

  if (Array.isArray(eventList) && eventList.length > 0) {
    const set = new Set(eventList)
    modelList.value = allModels.filter(m => set.has(m.eventType))

    const currentModel = modelList.value.find(m => m.key === activeModel.value)
    if (!currentModel) {
      activeModel.value = modelList.value[0]?.key || ''
      form.event_type = modelList.value[0]?.eventType || ''
    }
  }
}

// 初始化获取数据
const fetchAiEventConfig = async(requestedEventType?: string) => {
  const model = modelList.value.find(m => m.key === activeModel.value)
  if (!model) return

  const params = {
    event_type: requestedEventType || model.eventType,
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getAiWventConfig(params)
  if (res.code === 200 && res.data) {
    if (Object.prototype.hasOwnProperty.call(res.data, 'event_list')) {
      form.event_list = res.data.event_list
      if (allowSyncModelListFromServer.value) {
        updateModelListByEventList(res.data.event_list)
      }
    }

    if (Array.isArray(res.data.event_list) && res.data.event_list.length === 0) {
      return
    }

    const reqType = requestedEventType || model.eventType
    if (Array.isArray(res.data.event_list) && reqType && !res.data.event_list.includes(reqType)) {
      Object.assign(form, {
        ...form,
        event_type: reqType,
        ...defaultFormData()
      })
      return
    }

    Object.assign(form, res.data)
  }
}

// 保存数据
const handleSave = async() => {
  if (modelList.value.length === 0) {
    ElMessage.error('暂无可保存的模型')
    return
  }
  form.event_list = modelList.value.map(m => m.eventType)

  const params = {
    ...form,
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await saveAiEventConfig(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    allowSyncModelListFromServer.value = true
    await fetchAiEventConfig()
  }
}

const handleRemove = (key: string) => {
  modelList.value = modelList.value.filter((m) => m.key !== key)
  form.event_list = modelList.value.map(m => m.eventType)
  if (activeModel.value === key) {
    activeModel.value = modelList.value[0]?.key || ''
    const model = modelList.value.find(m => m.key === activeModel.value)
    form.event_type = model ? model.eventType : ''
  }
}

const handleMarketConfirm = (payload: { keys: string[]; models: { key: string; name: string; eventType: string }[] }) => {
  modelList.value = payload.models.map((m) => ({
    key: m.key,
    name: m.name,
    eventType: m.eventType
  }))
  form.event_list = modelList.value.map(m => m.eventType)
  allowSyncModelListFromServer.value = false
  if (!payload.keys.includes(activeModel.value)) {
    activeModel.value = payload.keys[0] || ''
    const model = modelList.value.find(m => m.key === activeModel.value)
    form.event_type = model ? model.eventType : ''
  }
  drawerVisible.value = false
}

// 页面挂载后加载数据
onMounted(() => {
  allowSyncModelListFromServer.value = true
  fetchAiEventConfig()
})
</script>

<style lang="scss" scoped>
.smart_page {
  width: 100%;
  padding: 12px 20px 20px;
  overflow: auto;
  background: #fff;
  border-radius: 6px 6px 0 0;
  margin-top: 20px;
}

.deviceCard {
  border-radius: 8px;
  background: #F0F2F5;
  padding: 24px 27px;
}

.deviceTitle {
  font-size: 20px;
  color: #333333;
  margin-bottom: 20px;
}

.deviceInfoGrid {
  display: grid;
  grid-template-columns: 240px 240px;
  row-gap: 20px;
  column-gap: 40px;
}

.infoItem {
  display: flex;
  gap: 20px;
  align-items: center;
}

.infoLabel {
  font-size: 14px;
  color: #939393;
}

.infoValue {
  font-size: 14px;
  color: #333333;
}

.sectionTitle {
  margin-top: 18px;
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
}

.modelActions {
  margin: 12px 0 16px;
}

.main {
  display: grid;
  grid-template-columns: 560px 1fr;
  gap: 28px;
  align-items: start;
}

.left {
  background: #fff;
}

.modelRow {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-left:3px solid  transparent;
  background: #F3F4F6;
  margin-bottom: 12px;
  cursor: pointer;

  &.act {
    background: var(--el-color-primary-hb);
    border-left-color: var(--el-color-primary);
  }
}

.modelName {
  font-size: 14px;
  color: #333;
}

.modelClose {
  font-size: 18px;
  color: #666;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
}

.right {
  padding-top: 6px;
}

// tabs 样式与 events.vue 保持一致
:deep(.smart-tabs) {
  .el-tabs__item {
    color: #999999;
    font-size: 16px;
  }

  .el-tabs__item.is-active {
    color: var(--el-color-primary);
  }

  .el-tabs__header {
    padding-top: 0;
    margin-bottom: 20px;

    .el-tabs__nav-wrap::after {
      display: none;
    }
  }
}

.marketBtn{
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  img{
    width: 14px;
    height: 14px;
  }
}

// 抽屉样式
:deep(.smartMarketDrawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 12px 20px;
    border-bottom: 1px solid #EEF0F3;
  }

  .el-drawer__title {
    font-size: 14px;
    color: #333333;
  }

  .el-drawer__body {
    padding: 20px 40px;
  }
}

.submitBox {
  margin-top: 22px;
  padding: 40px 0 20px;

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

</style>
