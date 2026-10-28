<template>
  <div class="task-container">
    <div class="task-content">
      <!-- 搜索框 -->
      <van-search
        v-if="showSearch"
        v-model="searchValue"
        show-action
        :placeholder="$t('请输入搜索关键词')"
        @search="handleSearch"
        @cancel="handleCancel"
      />
      <!-- 任务状态切换tab：全部、进行中、已完成 -->
      <div v-if="mod_type===1 && !showSearch" class="task-tab-header">
        <div :class="['task-tab-item', { active: taskStatus === 0 }]" @click="taskStatusFn(0,'status')">
          {{ $t('全部') }}
        </div>
        <div :class="['task-tab-item', { active: taskStatus === 2 }]" @click="taskStatusFn(2,'status')">
          {{ $t('待完成') }}
        </div>
        <div :class="['task-tab-item', { active: taskStatus === 1 }]" @click="taskStatusFn(1,'status')">
          {{ $t('已完成') }}
        </div>
      </div>
      <div v-else-if="!showSearch" class="task-tab-header">
        <div :class="['task-tab-item', { active: mod_status === 0 }]" @click="taskStatusFn(0,'mod_status')">
          {{ $t('全部') }}
        </div>
        <div :class="['task-tab-item', { active: mod_status === 1 }]" @click="taskStatusFn(1,'mod_status')">
          {{ $t('待确认') }}
        </div>
        <div :class="['task-tab-item', { active: mod_status === 2 }]" @click="taskStatusFn(2,'mod_status')">
          {{ $t('已完成') }}
        </div>
      </div>
      <!-- 任务列表 -->
      <div class="task-list" :class="{add:mod_type===1}">
        <van-pull-refresh
          v-model="refreshing"
          :success-text="$t('刷新成功')"
          @refresh="onRefresh"
        >
          <van-list
            v-if="allTasks.length !== 0"
            v-model="loading"
            :finished="finished"
            :finished-text="$t('没有更多了')"
            @load="onLoad"
          >
            <div v-for="(task, index) in allTasks" :key="index" class="task-item" @click="handleTaskClick(task)">
              <div class="task-info">
                <div class="task-title fl flexRowAC">
                  {{ task.name }}
                  <van-icon name="arrow" />
                </div>
                <!-- 事件拍传 -->
                <template v-if="task.mod_type===1">
                  <div class="task-desc fl">
                    <div class="info-lable flexRowAC">
                      <img src="@/assets/img/eventMana/event_user.png" alt="" />
                      {{ $t('上报人员：') }}
                    </div>
                    <div class="info-content flexRowAC">
                      <i-d2-head-pic-mobile :id="task.uuid" class="info-content-avatar" round />
                      <i-d2-name :id="task.uuid" round />
                    </div>
                  </div>
                  <div class="task-desc fl">
                    <div class="info-lable flexRowAC">
                      <img src="@/assets/img/eventMana/event_location1.png" alt="" />
                      {{ $t('任务位置：') }}
                    </div>
                    <div class="info-content">
                      {{ eventLocationText(task.point) }}
                    </div>
                    <img
                      v-if="hasEventLocation(task.point)"
                      class="event_arrow"
                      src="@/assets/img/eventMana/event_arrow.png"
                      alt=""
                    />
                  </div>
                  <div class="task-desc fl">
                    <div class="info-lable flexRowAC">
                      <img src="@/assets/img/eventMana/event_time.png" alt="" />
                      {{ $t('上报时间：') }}
                    </div>
                    <div class="info-content">
                      {{ task.created_at }}
                    </div>
                  </div>
                  <div class="task-desc fl">
                    <div class="info-lable flexRowAC">
                      <img src="@/assets/img/eventMana/event_desc.png" alt="" />
                      {{ $t('事件描述：') }}
                    </div>
                    <div class="info-content">
                      {{ task.describe }}
                    </div>
                  </div>
                  <div class="task-status">
                    <img v-if="task.status === 2" src="@/assets/img/commandDispatch/inprogress2.png" />
                    <img v-else src="@/assets/img/commandDispatch/completed.png" />
                  </div>
                </template>
                <!-- 主动安全 -->
                <template v-else>
                  <div class="task-desc fl">
                    <div class="info-lable flexRowAC">
                      <img src="@/assets/img/eventMana/event_location1.png" alt="" />
                      {{ $t('事件位置：') }}
                    </div>
                    <div class="info-content">
                      {{ eventLocationText(task.point) }}
                    </div>
                    <img
                      v-if="hasEventLocation(task.point)"
                      class="event_arrow"
                      src="@/assets/img/eventMana/event_arrow.png"
                      alt=""
                    />
                  </div>
                  <div class="task-desc fl">
                    <div class="info-lable flexRowAC">
                      <img src="@/assets/img/eventMana/service_name.png" alt="" />
                      {{ $t('设备名称：') }}
                    </div>
                    <div class="info-content">
                      {{ task.device_name }}
                      <span class="device_tag">{{ task.device_tag }}</span>
                    </div>
                  </div>
                  <div class="task-desc fl">
                    <div class="info-lable flexRowAC">
                      <img src="@/assets/img/eventMana/service_id.png" alt="" />
                      {{ $t('设备ID：') }}
                    </div>
                    <div class="info-content">
                      {{ task.device_id }}
                    </div>
                  </div>
                  <div class="task-desc fl">
                    <div class="info-lable flexRowAC">
                      <img src="@/assets/img/eventMana/event_time.png" alt="" />
                      {{ $t('事件时间：') }}
                    </div>
                    <div class="info-content">
                      {{ task.created_at }}
                    </div>
                  </div>
                  <div class="task-status">
                    <img v-if="task.status === 2" src="@/assets/img/eventMana/e_dqr.png" />
                    <img v-else src="@/assets/img/eventMana/e_yqr.png" />
                  </div>
                </template>
              </div>
            </div>
          </van-list>
          <!-- 空态 -->
          <div v-if="allTasks.length === 0" class="no_data">
            <img src="@/assets/img/daily_activity/no_data.png" />
            <span>{{ $t('暂无数据') }}</span>
          </div>
        </van-pull-refresh>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/useraPaas'
import { event_list, myevent_list } from '@/api/eventManagement'
import { eventLocationText, hasEventLocation } from '@/utils/eventDisplay'
import ID2HeadPicMobile from '@/components/ID2HeadPic.vue'
import ID2Name from '@/components/ID2Name.vue'
import bus from '@/utils/bus'

// 定义props
const props = defineProps(['event', 'my'])
const store = useUserStore()
const router = useRouter()
const refreshing = ref(false)
const loading = ref(false)
const finished = ref(false)
const count = ref(0)
const page = ref(1)
const pageSize = ref(10)
const taskStatus = ref(0) // 默认显示全部任务，可切换为2、1
const mod_status = ref(0) // 事件状态 1:待确认 2:已确认 0:全部(默认) 只有mod_type=2时,才有效
let allTasks = ref([])
let mod_type = ref(props.event === undefined || props.event === null ? undefined : Number(props.event)) // 事件类型 1:事件拍传 2:主动安全
const showSearch = ref(false) // 搜索框显示状态
const searchValue = ref('') // 搜索关键词

// 刷新-page
const onLoad = () => {
  if (loading.value || finished.value) return
  loading.value = true
  event_listFn()
}

// 刷新
function onRefresh() {
  refreshing.value = false
  loading.value = true
  finished.value = false
  page.value = 1
  allTasks.value = []
  event_listFn()
}

// 切换状态
const taskStatusFn = (index, str) => {
  if (str === 'status') {
    taskStatus.value = index
  } else {
    mod_status.value = index
  }
  refreshing.value = false
  finished.value = false
  page.value = 1
  allTasks.value = []
  event_listFn()
}

// 任务事件-list
const event_listFn = async() => {
  let data = {
    accessToken: store.token,
    tenant_id: store.userInfo.tenantId,
    status: taskStatus.value,
    page: page.value,
    mod_type: mod_type.value,
    pageSize: pageSize.value
  }
  if (mod_type.value === 2) data['mod_status'] = mod_status.value
  // 添加搜索关键词
  if (searchValue.value) {
    data['keyword'] = searchValue.value
  }
  let res = props.my ? await myevent_list(data) : await event_list(data)
  if (res.code === 200) {
    loading.value = false
    count.value = res.data.count || 0
    if (res.data.list) {
      allTasks.value = [...allTasks.value, ...res.data.list]
      if (allTasks.value.length >= count.value || res.data.list.length === 0) {
        finished.value = true
      }
      page.value += 1
    }
  } else {
    console.log(res)
  }
}

// 事件详情
const handleTaskClick = (task) => {
  // 跳转到事件详情
  if (mod_type.value === 1) {
    router.push({
      path: '/event-detail',
      query: { task: JSON.stringify(task) }
    })
  } else {
    router.push({
      path: '/deviceDetail',
      query: { task: JSON.stringify(task) }
    })
  }
}

// 搜索处理
const handleSearch = () => {
  refreshing.value = false
  finished.value = false
  page.value = 1
  allTasks.value = []
  event_listFn()
}

// 取消搜索
const handleCancel = () => {
  showSearch.value = false
  searchValue.value = ''
  refreshing.value = false
  finished.value = false
  page.value = 1
  allTasks.value = []
  event_listFn()
}

// 切换搜索状态
const handleToggleSearch = () => {
  showSearch.value = !showSearch.value
  if (showSearch.value) {
    // 显示搜索时，切换到全部状态
    if (mod_type.value === 1) {
      taskStatus.value = 0
    } else {
      mod_status.value = 0
    }
  } else {
    // 隐藏搜索时，清空搜索关键词并恢复列表
    searchValue.value = ''
    refreshing.value = false
    finished.value = false
    page.value = 1
    allTasks.value = []
    event_listFn()
  }
}

watch(() => props.event, (val) => {
  mod_type.value = val || undefined
  refreshing.value = false
  finished.value = false
  page.value = 1
  allTasks.value = []
  event_listFn()
}, { immediate: true, deep: true })

onMounted(() => {
  bus.$on('toggleSearch', handleToggleSearch)
})

onUnmounted(() => {
  bus.$off('toggleSearch', handleToggleSearch)
})
</script>

<style lang="scss" scoped>
.task-container {
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

.task-content {
  height: calc(100%);
  padding: 0 16px;
}

// 搜索框样式
:deep(.van-search) {
  padding: 8px 0;
  margin-bottom: 8px;
}

.task-tab-header {
  display: flex;
  margin-bottom: 10px;
  background: #FFFF;
  border-radius: 16px;
  padding: 2px;
  height: 28px;
  margin: 16px 0;
}

.task-tab-item {
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

.task-tab-item.active {
  color: #ffff;
  background: #2F69F8;
  border-radius: 16px;
}

.task-list {
  height: calc(100% - 60px);
  /* 减去header、tabs、tab-header的高度，没有底部导航 */
  overflow: auto;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 10px 6px;
  margin-bottom: 10px;
  background: #FFFF;
  border-radius: 8px;
  position: relative;
}

.task-info {
  flex: 1;
}

.task-time {
  color: #999;
  font-size: 12px;
  padding-bottom: 12px;
  margin-bottom: 15px;
}

.task-title {
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

.task-desc {
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

    .device_tag{
      font-size: 12px;
      line-height: 12px;
      color: #1A53FF;
      font-weight: 400;
      background: rgba(26,83,255,0.08);
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

.task-status {
  z-index: 1;
  top: -4px;
  right: 24px;
  position: absolute;
}

.task-status img {
  width: 60px;
  height: 60px;
}

.ongoing-status {
  background-color: #28a745;
}

.completed-status {
  background-color: #6c757d;
}

.add-task-btn {
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
