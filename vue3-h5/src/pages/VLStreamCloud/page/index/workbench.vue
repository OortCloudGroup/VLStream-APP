/**
 * 工作台页面
 */
<template>
  <div class="workbench-page">
    <!-- 顶部标题固定，内容在其下方滚动 -->
    <div class="page-header" :style="{ paddingTop: headerPaddingTop }">
      <h1 class="page-title">
        {{ $t('工作台') }}
      </h1>
    </div>
    <van-pull-refresh v-model="isLoading" class="workbench-body" @refresh="onRefresh">
      <div class="workbench-container">
        <div class="header-section">
          <!-- 天气和个人信息卡片 -->
          <div class="weather-card">
            <div class="hero-top">
              <div class="hero-text">
                <div class="greeting">
                  {{ greetingWithUser }}
                </div>
                <div class="date">
                  {{ currentDate }} · {{ currentTime }} · {{ currentDay }}
                </div>
              </div>
              <div class="weather-chip">
                <img src="@/assets/img/VLStreamCloud/qt.png" alt="" />
                <span class="temperature vl-mono">{{ weatherTemp }}</span>
              </div>
            </div>

            <!-- 状态卡片区域 -->
            <div class="status-cards">
              <div class="status-card pending">
                <div class="status-number vl-mono">
                  {{ pendingCount }}
                </div>
                <div class="status-label">
                  {{ $t('待审批') }}
                </div>
              </div>
              <div class="status-card approved">
                <div class="status-number vl-mono">
                  {{ approvedCount }}
                </div>
                <div class="status-label">
                  {{ $t('已审批') }}
                </div>
              </div>
              <div class="status-card all">
                <div class="status-number vl-mono">
                  {{ allCount }}
                </div>
                <div class="status-label">
                  {{ $t('所有申请') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 常用功能区域 -->
        <div class="functions-section">
          <div class="section-header">
            <div class="section-title">
              {{ $t('常用功能') }}
            </div>
          </div>
          <div class="functions-grid">
            <div
              v-for="(item, index) in functionList"
              :key="index"
              class="function-item"
              @click="handleFunctionClick(item)"
            >
              <div class="function-icon">
                <LineIcon :name="item.icon" :size="24" />
              </div>
              <div class="function-label">
                {{ $t(item.label) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 热门设备区域 -->
        <div class="popular-devices-section">
          <div class="section-header">
            <div class="section-title">
              {{ $t('热门设备') }}
            </div>
            <div class="more-link" @click="handleMoreDevices">
              {{ $t('更多 >') }}
            </div>
          </div>
          <div class="devices-list">
            <div
              v-for="(device, index) in popularDevices"
              :key="index"
              class="device-item"
            >
              <div class="device-icon">
                <LineIcon name="device" :size="18" />
              </div>
              <div class="device-name">
                {{ device.name }}
              </div>
              <PlayButton shape="pill" :online="device.online === true" @click="handlePlay(device)" />
            </div>
          </div>
        </div>

        <!-- 我的待审批区域 -->
        <div v-if="approvalList.length" class="approval-section">
          <div class="section-header">
            <div class="section-title">
              {{ $t('我的待审批') }}
            </div>
            <div class="more-link" @click="handleMoreApprovals">
              {{ $t('更多 >') }}
            </div>
          </div>
          <div class="approval-table">
            <div class="approval-header">
              <div class="header-cell device-name-header">
                {{ $t('设备名称') }}
              </div>
              <div class="header-cell applicant-header">
                {{ $t('申请人') }}
              </div>
              <div class="header-cell operation-header">
                {{ $t('操作') }}
              </div>
            </div>
            <div
              v-for="(item, index) in approvalList"
              :key="index"
              class="approval-item"
            >
              <div class="approval-cell device-name-cell">
                {{ item.deviceName }}
              </div>
              <div class="approval-cell applicant-cell">
                {{ item.applicant }}
              </div>
              <div class="approval-cell operation-cell">
                <span class="approve-btn" @click="handleApprove(item)">
                  {{ $t('同意') }}
                </span>
                <span class="reject-btn" @click="handleReject(item)">
                  {{ $t('拒绝') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-pull-refresh>

    <oort-popup v-model="showVideoDetail" position="right" style="width: 100%;height: 100%;" teleport="body">
      <CameraDetail
        v-if="showVideoDetail && currentDevice"
        :camera="currentDevice"
        @close="showVideoDetail = false"
      />
    </oort-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import PlayButton from '../components/PlayButton.vue'
import { getSafeAreaTop } from '@/utils/safeArea'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/useraPaas'
import { showToast } from 'vant'
import OortPopup from '@/components/popup/oort_popup.vue'
import CameraDetail from '@/pages/VLStreamCloud/page/components/cameraDetail/CameraDetail.vue'
import { getWvpVlsDeviceList } from '@/api/VLStreamCloud/wvp'
import { todoWorkOrderList, finishedWorkOrderList, ownWorkOrderList } from '@/api/processui'
import LineIcon from '@/pages/VLStreamCloud/page/components/LineIcon.vue'

const router = useRouter()
const store = useUserStore()
const { t, locale } = useI18n()

// 热门设备的播放按钮打开设备详情
const showVideoDetail = ref(false)
const currentDevice = ref(null)

// 沉浸式状态栏适配：状态栏高度见 utils/safeArea，其下只留 12px
const headerPaddingTop = ref('12px')
const computeHeaderPadding = () => {
  headerPaddingTop.value = (getSafeAreaTop() + 12) + 'px'
}

// 用户名
const userName = ref(store.userInfo.userName || t('用户'))

// 下拉刷新状态
const isLoading = ref(false)

// 时间与天气相关
const now = ref(new Date())
const weatherTemp = ref('--°C')
let clockTimer = null

const weekLabels = computed(() => [t('星期日'), t('星期一'), t('星期二'), t('星期三'), t('星期四'), t('星期五'), t('星期六')])
const pad2 = (value) => String(value).padStart(2, '0')

const currentDate = computed(() => {
  const date = now.value
  // en-US convention: "Oct 29, 2026"; cn keeps "2026-10-29"
  if (locale.value === 'en') {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
})

const currentTime = computed(() => {
  const date = now.value
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
})

const currentDay = computed(() => {
  const date = now.value
  return weekLabels.value[date.getDay()]
})

const greetingText = computed(() => {
  const hour = now.value.getHours()
  if (hour >= 5 && hour < 12) return t('早上好')
  if (hour >= 12 && hour < 14) return t('中午好')
  if (hour >= 14 && hour < 18) return t('下午好')
  if (hour >= 18 && hour < 23) return t('晚上好')
  return t('夜深了')
})

// Word order differs per locale: "admin，早上好！" vs "Good morning, admin!"
const greetingWithUser = computed(() => (locale.value === 'en'
  ? `${greetingText.value}, ${userName.value}!`
  : `${userName.value}，${greetingText.value}！`))

const updateNow = () => {
  now.value = new Date()
}

const startClock = () => {
  updateNow()
  if (clockTimer) {
    clearInterval(clockTimer)
  }
  clockTimer = setInterval(updateNow, 1000)
}

const getCurrentPosition = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error('Geolocation not supported'))
    return
  }
  navigator.geolocation.getCurrentPosition(
    position => resolve(position.coords),
    error => reject(error),
    { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
  )
})

const fetchWeather = async() => {
  try {
    let latitude = 39.9042
    let longitude = 116.4074

    try {
      const coords = await getCurrentPosition()
      latitude = coords.latitude
      longitude = coords.longitude
    } catch (error) {
      // 使用默认坐标（北京）
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
    const response = await fetch(url)
    if (!response.ok) return
    const data = await response.json()
    const temperature = data?.current?.temperature_2m
    if (typeof temperature === 'number') {
      weatherTemp.value = `${Math.round(temperature)}°C`
    }
  } catch (error) {
    // 忽略天气请求错误
  }
}

// 功能列表
const functionList = ref([
  {
    key: 'square',
    label: '视频广场',
    icon: 'square'
  },
  {
    key: 'govern',
    label: '场景治理',
    icon: 'govern'
  },
  {
    key: 'event',
    label: '事件管理',
    icon: 'bell'
  },
  {
    key: 'algo',
    label: '算法超市',
    icon: 'algo'
  },
  {
    key: 'annotation',
    label: '算法标注',
    icon: 'annotation'
  },
  {
    key: 'tag',
    label: '标签管理',
    icon: 'tag'
  },
  {
    key: 'playback',
    label: '视频回放',
    icon: 'playback'
  },
  {
    key: 'device',
    label: '设备管理',
    icon: 'device'
  },
  {
    key: 'training',
    label: '算法训练',
    icon: 'training'
  },
  {
    key: 'orchestration',
    label: '算法编排',
    icon: 'orchestration'
  },
  {
    key: 'log',
    label: '操作日志',
    icon: 'log'
  },
  {
    key: 'service',
    label: '服务中心',
    icon: 'service'
  }
])

// 热门设备列表
const popularDevices = ref([])

// 获取热门设备（与视频广场同源，直接取 WVP 设备行，播放可打开摄像头详情）
const fetchPopularDevices = async() => {
  const res = await getWvpVlsDeviceList({ pageNum: 1, pageSize: 10 })
  if (res.code === 200 && Array.isArray(res.rows)) {
    popularDevices.value = res.rows.map((item) => ({
      id: item.id,
      name: item.deviceName,
      ...item
    }))
  }
}

// 审批统计与列表
const pendingCount = ref(0) // 待审批数量
const approvedCount = ref(0) // 已审批数量
const allCount = ref(0) // 所有申请数量

// 我的待审批列表
const approvalList = ref([])

// 工单接口的权限码随「我的/待办/已办工单」页面一起授权（workflow:workorder:*），
// 通用流程接口 /workflow/process/* 要求的 workflow:process:* 不在菜单目录里，普通用户无法授权。
// categoryType 为必填（后端按它查分类名），workOrderAppAll 聚合全部工单应用。
const WORKORDER_COMMON_PARAMS = {
  pageNum: 1,
  pageSize: 10,
  categoryType: 'WorkOrderAppAll',
  workOrderAppAll: true
}

// 获取审批统计和列表
const fetchApprovalData = async() => {
  try {
    const [todoRes, finishedRes, ownRes] = await Promise.all([
      todoWorkOrderList(WORKORDER_COMMON_PARAMS),
      finishedWorkOrderList(WORKORDER_COMMON_PARAMS),
      ownWorkOrderList(WORKORDER_COMMON_PARAMS)
    ])

    if (todoRes && todoRes.code === 200) {
      pendingCount.value = todoRes.total || (todoRes.data && todoRes.data.total) || 0
    } else {
      pendingCount.value = 0
    }

    if (finishedRes && finishedRes.code === 200) {
      approvedCount.value = finishedRes.total || (finishedRes.data && finishedRes.data.total) || 0
    } else {
      approvedCount.value = 0
    }

    if (ownRes && ownRes.code === 200) {
      allCount.value = ownRes.total || (ownRes.data && ownRes.data.total) || 0
      const rows = ownRes.rows || (ownRes.data && ownRes.data.rows) || []
      approvalList.value = rows.map(row => ({
        id: row.procInsId || row.procInstId || row.taskId || row.id,
        deviceName: row.title || row.procDefName || '-',
        applicant: row.startUserName || row.createBy || '-'
      }))
    } else {
      allCount.value = 0
      approvalList.value = []
    }
  } catch (e) {
    pendingCount.value = 0
    approvedCount.value = 0
    allCount.value = 0
    approvalList.value = []
  }
}

onBeforeUnmount(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
    clockTimer = null
  }
})

onMounted(() => {
  computeHeaderPadding()
  startClock()
  fetchWeather()
  fetchPopularDevices()
  fetchApprovalData()
})

// 处理功能点击
const handleFunctionClick = (item) => {
  const videoTabMap = {
    square: 'square',
    govern: 'govern',
    playback: 'playback',
    device: 'device',
    algo: 'algo'
  }

  const topTab = videoTabMap[item.key]

  if (topTab) {
    router.push({
      path: '/video',
      query: {
        topTab
      }
    })
    return
  }

  if (item.key === 'event') {
    router.push('/event')
    return
  }

  // 算法标注 / 标签管理 / 算法训练 / 算法编排 / 操作日志 / 服务中心 只有 PC 端才有
  showToast(t('移动端暂不支持该功能'))
}

// 处理播放
const handlePlay = (device) => {
  currentDevice.value = device
  showVideoDetail.value = true
}

// 处理更多设备
const handleMoreDevices = () => {
  router.push({
    path: '/video',
    query: {
      topTab: 'square'
    }
  })
}

// 处理更多审批
const handleMoreApprovals = () => {
  router.push('/myWorkorder')
}

// 处理同意
const handleApprove = (item) => {
  // 审批需要选择下一节点审批人，移动端只做展示，走 PC 端
  showToast(t('审批「{name}」请前往 PC 端处理', { name: item.deviceName }))
}

// 处理拒绝
const handleReject = (item) => {
  showToast(t('审批「{name}」请前往 PC 端处理', { name: item.deviceName }))
}

// 下拉刷新
const onRefresh = async() => {
  await Promise.all([
    fetchWeather(),
    fetchPopularDevices(),
    fetchApprovalData()
  ])
  isLoading.value = false
}
</script>

<style lang="scss" scoped>
.workbench-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px - env(safe-area-inset-bottom));
  background: var(--vl-bg);
}

.page-header {
  flex-shrink: 0;
  position: relative;
  z-index: 2;
  padding: 0 20px;
  background: var(--vl-bg);
}

.workbench-body {
  flex: 1;
  min-height: 0;
  overflow: scroll;
  background: var(--vl-bg);
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.workbench-container {
  min-height: 100%;
  background: var(--vl-bg);
  padding: 4px 20px 24px;
  position: relative;
}

.header-section,
.functions-section,
.popular-devices-section,
.approval-section {
  position: relative;
  z-index: 1;
}

.page-title {
  margin: 0;
  padding: 0 0 12px;
  font-size: 28px;
  line-height: 36px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--vl-ink);
}

// 概览面板：浅灰大圆角；问候语为主角，天气做成右上角小胶囊
.weather-card {
  background: var(--vl-surface);
  border-radius: var(--vl-radius-lg);
  padding: 20px 16px 16px;
}

.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.hero-text {
  min-width: 0;

  .greeting {
    font-size: 20px;
    line-height: 28px;
    font-weight: 800;
    letter-spacing: -0.3px;
    color: var(--vl-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .date {
    margin-top: 4px;
    font-size: 12px;
    line-height: 16px;
    color: var(--vl-text-2);
  }
}

.weather-chip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  padding: 0 10px 0 6px;
  border-radius: 999px;
  background: #ffffff;

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .temperature {
    font-size: 13px;
    font-weight: 700;
    color: var(--vl-ink);
  }
}

.status-cards {
  display: flex;
  gap: 8px;
}

.status-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: center;
  padding: 14px 14px 12px;
  background: #ffffff;
  border-radius: 16px;
}

.status-number {
  font-size: 26px;
  line-height: 32px;
  font-weight: 700;
  color: var(--vl-ink);
}

.status-label {
  font-size: 12px;
  color: var(--vl-text-2);
}

// 待审批是需要处理的数字，用亮色突出
.status-card.pending .status-number {
  color: var(--vl-accent);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 28px 0 12px;
}

.section-title {
  line-height: 22px;
  color: var(--vl-ink);
  font-size: 17px;
  font-weight: 700;
}

.more-link {
  line-height: 18px;
  color: var(--vl-accent);
  font-weight: 500;
  font-size: 13px;
}

.functions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  row-gap: 18px;
}

.function-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:active .function-icon {
    background: var(--vl-surface-2);
  }
}

.function-icon {
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  background: var(--vl-surface);
  color: var(--vl-ink);
  transition: background-color 0.15s ease;
}

.function-label {
  line-height: 16px;
  color: var(--vl-ink);
  font-size: 12px;
  font-weight: 500;
}

// 热门设备
.devices-list {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vl-line);
  border-radius: var(--vl-radius-lg);
  padding: 0 16px;
  background: #ffffff;

  &:empty {
    display: none;
  }
}

.device-item {
  display: flex;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--vl-line);

  &:last-child {
    border-bottom: none;
  }
}

.device-icon {
  width: 36px;
  height: 36px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--vl-surface);
  color: var(--vl-ink);
  flex-shrink: 0;
}

.device-name {
  flex: 1;
  line-height: 20px;
  color: var(--vl-ink);
  font-size: 15px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 我的待审批
.approval-section {
  margin-bottom: 20px;
}

.approval-table {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vl-line);
  border-radius: var(--vl-radius-lg);
  overflow: hidden;
}

.approval-header {
  display: flex;
  padding: 12px 16px;
  background: var(--vl-surface);
  line-height: 18px;
  color: var(--vl-text-2);
  font-size: 13px;
}

.header-cell {
  &.device-name-header {
    flex: 1;
    text-align: left;
  }

  &.applicant-header {
    flex: 1;
    text-align: center;
  }

  &.operation-header {
    flex: 1;
    text-align: right;
  }
}

.approval-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid var(--vl-line);
}

.approval-cell {
  font-size: 14px;
  color: var(--vl-ink);

  &.device-name-cell {
    flex: 1;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.applicant-cell {
    flex: 1;
    text-align: center;
  }

  &.operation-cell {
    flex: 1;
    text-align: right;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
}

.approve-btn {
  color: var(--vl-ink);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

.reject-btn {
  color: var(--vl-danger);
  font-size: 14px;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}
</style>
