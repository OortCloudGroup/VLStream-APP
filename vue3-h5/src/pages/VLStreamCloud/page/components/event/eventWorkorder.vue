<template>
  <div class="order-container">
    <div class="work-content">
      <!-- 搜索框 -->
      <van-search
        v-if="showSearch"
        v-model="searchValue"
        show-action
        placeholder="请输入搜索关键词"
        @search="handleSearch"
        @cancel="handleCancel"
      />
      <!-- 任务状态切换tab：全部、进行中、已完成 -->
      <div class="order-tab-header">
        <div :class="['order-tab-item', { active: !workorderStatus }]" @click="taskStatusFn(undefined)">
          全部
        </div>
        <div :class="['order-tab-item', { active: workorderStatus === 'processing' }]" @click="taskStatusFn('processing')">
          待完成
        </div>
        <div
          :class="['order-tab-item', { active: workorderStatus === 'completed' }]"
          @click="taskStatusFn('completed')"
        >
          已完成
        </div>
      </div>
      <!-- 任务列表 -->
      <div class="work-list">
        <van-pull-refresh
          v-model="refreshing"
          success-text="刷新成功"
          @refresh="onRefresh"
        >
          <van-list
            v-if="tableData.length !== 0"
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div v-for="(order, index) in tableData" :key="index" class="order-item" @click="handleTaskClick(order)">
              <div class="order-info">
                <div class="order-title fl flexRowAC">
                  {{ order.title }}
                  <van-icon name="arrow" />
                </div>
                <!-- 主动安全 -->
                <div class="order-desc fl">
                  <div class="info-lable flexRowAC">
                    <img src="@/assets/img/eventMana/order_no.png" alt="" />
                    工单编号：
                  </div>
                  <div class="info-content">
                    {{ order.workorderNumber }}
                  </div>
                </div>
                <div class="order-desc fl">
                  <div class="info-lable flexRowAC">
                    <img src="@/assets/img/eventMana/order_source.png" alt="" />
                    工单来源：
                  </div>
                  <div class="info-content">
                    {{ order.source || '-' }}
                  </div>
                </div>
                <div class="order-desc fl">
                  <div class="info-lable flexRowAC">
                    <img src="@/assets/img/eventMana/event_time.png" alt="" />
                    提交时间：
                  </div>
                  <div class="info-content">
                    {{ order.createTime }}
                  </div>
                </div>
                <div class="order-status">
                  <img v-if="order.workorderStatus === 'completed'" src="@/assets/img/eventMana/e_ywc.png" />
                  <img v-if="order.workorderStatus === 'processing'" src="@/assets/img/eventMana/e_jxz.png" />
                </div>
              </div>
            </div>
          </van-list>
          <!-- 空态 -->
          <div v-if="tableData.length === 0" class="no_data">
            <img src="@/assets/img/daily_activity/no_data.png" />
            <span>暂无数据</span>
          </div>
        </van-pull-refresh>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/useraPaas'
import bus from '@/utils/bus'
import { ownWorkOrderList } from '@/api/processui'

// 定义props
const store = useUserStore()
const router = useRouter()
const appObj = ref(null)
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const count = ref(0)
const page = ref(1)
const pageSize = ref(10)
const workorderStatus = ref(undefined)
let tableData = ref([])
const showSearch = ref(false) // 搜索框显示状态
const searchValue = ref('') // 搜索关键词

// 刷新-page
const onLoad = () => {
  if (loading.value || finished.value) return
  loading.value = true
  workOrderListFn()
}

// 刷新
function onRefresh() {
  refreshing.value = false
  loading.value = true
  finished.value = false
  page.value = 1
  tableData.value = []
  workOrderListFn()
}

// 切换状态
const taskStatusFn = (str) => {
  workorderStatus.value = str
  refreshing.value = false
  finished.value = false
  page.value = 1
  tableData.value = []
  workOrderListFn()
}

// 我的工单-list
const workOrderListFn = async() => {
  let data = {
    accessToken: store.token,
    pageNum: page.value,
    pageSize: pageSize.value,
    workorderStatus: workorderStatus.value,
    categoryType: 'WorkOrderAppAll', // 工单-应用分类
    category: appObj.value?.appId
  }
  const res = await ownWorkOrderList(data)
  if (res.code === 200) {
    loading.value = false
    count.value = res.total || 0
    if (res.rows) {
      tableData.value = [...tableData.value, ...res.rows]
      if (tableData.value.length >= count.value || res.rows.length === 0) {
        finished.value = true
      }
      page.value += 1
    }
  }
}

// 事件详情
const handleTaskClick = (task) => {
  // 跳转到事件详情
  router.push({
    path: '/workorder-detail',
    query: { task: JSON.stringify(task) }
  })
}

// 搜索处理
const handleSearch = () => {
  refreshing.value = false
  finished.value = false
  page.value = 1
  tableData.value = []
  workOrderListFn()
}

// 取消搜索
const handleCancel = () => {
  showSearch.value = false
  searchValue.value = ''
  refreshing.value = false
  finished.value = false
  page.value = 1
  tableData.value = []
  workOrderListFn()
}

// 切换搜索状态
const handleToggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    // 显示搜索时，切换到全部状态
    workorderStatus.value = undefined
  } else {
    // 隐藏搜索时，清空搜索关键词并恢复列表
    searchValue.value = ''
    refreshing.value = false
    finished.value = false
    page.value = 1
    tableData.value = []
    workOrderListFn()
  }
}

onMounted(() => {
  bus.$on('toggleSearch', handleToggleSearch)
  const appObjStr = window.sessionStorage.getItem('taskCenterClassify')
  appObj.value = appObjStr ? JSON.parse(appObjStr) : null
  workOrderListFn()
})

onUnmounted(() => {
  bus.$off('toggleSearch', handleToggleSearch)
})
</script>

<style lang="scss" scoped>
.order-container {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  overflow: hidden;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid #ccc;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 10px 0;
  cursor: pointer;
}

.tab-item.active {
  color: #007bff;
  border-bottom: 2px solid #007bff;
}

.work-content {
  height: calc(100%);
  padding: 0 16px;
}

// 搜索框样式
:deep(.van-search) {
  padding: 8px 0;
  margin-bottom: 8px;
}

.order-tab-header {
  display: flex;
  margin-bottom: 10px;
  background: #FFFF;
  border-radius: 16px;
  padding: 2px;
  height: 28px;
  margin: 16px 0;
}

.order-tab-item {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 34%;
  font-family: SourceHanSansSC-Regular;
  font-size: 14px;
  color: #666666;
  font-weight: 400;
}

.order-tab-item.active {
  color: #ffff;
  background: #2F69F8;
  border-radius: 16px;
}

.work-list {
  height: calc(100% - 20px);
  /* 减去header、tabs、tab-header的高度，没有底部导航 */
  overflow: auto;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 10px 6px;
  margin-bottom: 10px;
  background: #FFFF;
  border-radius: 8px;
  position: relative;
}

.order-info {
  flex: 1;
}

.order-time {
  color: #999;
  font-size: 12px;
  padding-bottom: 12px;
  margin-bottom: 15px;
}

.order-title {
  justify-content: space-between;
  padding-bottom: 16px;
  margin-bottom: 12px;
  font-family: SourceHanSansSC-Regular;
  font-size: 16px;
  line-height: 16px;
  color: #1A1A1A;
  letter-spacing: 0;
  font-weight: 400;
  border-bottom: 1px solid rgba(51, 51, 51, 0.2);

  .van-icon-arrow {
    color: #999;
  }
}

.order-desc {
  padding-bottom: 6px;
  display: flex;
  align-items: flex-start;
  position: relative;

  .info-content {
    flex: 1;
    font-family: SourceHanSansSC-Regular;
    font-size: 14px;
    line-height: 20px;
    color: #1A1A1A;
    letter-spacing: 0.43px;
    font-weight: 400;

    .device_tag {
      font-size: 12px;
      line-height: 12px;
      color: #1A53FF;
      font-weight: 400;
      background: rgba(26, 83, 255, 0.08);
      border-radius: 4px;
      padding: 2px 4px 4px;
      margin-right: 6px;
    }
  }

  .info-lable {
    font-family: SourceHanSansSC-Regular;
    font-size: 14px;
    line-height: 16px;
    color: #B1B9C5;
    letter-spacing: 0.43px;
    font-weight: 400;

    > img {
      width: 20px;
      height: 20px;
      margin-right: 4px;
    }
  }

  .event_arrow {
    right: 0;
    top: 2px;
    width: 20px;
    height: 20px;
    position: absolute;
  }
}

.info-content-avatar {
  width: 28px;
  height: 28px;
  vertical-align: middle;
  border-radius: 50%;
  margin-right: 4px;
}

.order-status {
  z-index: 1;
  top: -4px;
  right: 24px;
  position: absolute;
}

.order-status img {
  width: 60px;
  height: 60px;
}

.ongoing-status {
  background-color: #28a745;
}

.completed-status {
  background-color: #6c757d;
}

.add-order-btn {
  position: fixed;
  bottom: 138px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #007bff;
  color: #fff;
  font-size: 28px;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

// 暂无数据
.no_data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;

  img {
    width: 162px;
    height: auto;
  }

  span {
    margin: 4px 0;
    font-size: 16px;
    color: #999;
    text-align: center;
  }
}
</style>
