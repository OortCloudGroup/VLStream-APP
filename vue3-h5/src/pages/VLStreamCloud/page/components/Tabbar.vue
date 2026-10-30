<template>
  <van-tabbar v-model="active" route active-color="#1976D2" inactive-color="#999">
    <van-tabbar-item to="/workbench">
      <span>{{ $t('工作台') }}</span>
      <template #icon="props">
        <van-icon
          name="home-o"
          :color="props.active ? '#1976D2' : '#999'"
          size="20"
        />
      </template>
    </van-tabbar-item>
    <van-tabbar-item to="/video">
      <span>{{ $t('视频') }}</span>
      <template #icon="props">
        <van-icon
          name="video-o"
          :color="props.active ? '#1976D2' : '#999'"
          size="20"
        />
      </template>
    </van-tabbar-item>
    <van-tabbar-item to="/event" :badge="eventBadge">
      <span>{{ $t('事件') }}</span>
      <template #icon="props">
        <van-icon
          name="orders-o"
          :color="props.active ? '#1976D2' : '#999'"
          size="20"
        />
      </template>
    </van-tabbar-item>
    <van-tabbar-item to="/my">
      <span>{{ $t('我的') }}</span>
      <template #icon="props">
        <van-icon
          name="user-o"
          :color="props.active ? '#1976D2' : '#999'"
          size="20"
        />
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { unreadEventCount, refreshUnreadEventCount } from './event/eventBadge'

const route = useRoute()
const active = ref(0)

// 事件tab角标：全部新事件查看完（数量为0）才消失，超过99显示 99+
const eventBadge = computed(() => {
  if (unreadEventCount.value <= 0) return ''
  return unreadEventCount.value > 99 ? '99+' : String(unreadEventCount.value)
})

// 根据路由更新激活状态
const routeMap = {
  '/workbench': 0,
  '/video': 1,
  '/event': 2,
  '/my': 3
}

watch(() => route.path, (path) => {
  const matchedPath = Object.keys(routeMap).find(key => path.startsWith(key))
  if (matchedPath) {
    active.value = routeMap[matchedPath]
  } else if (path === '/' || path === '') {
    // 处理根路径重定向到工作台
    active.value = 0
  }
}, { immediate: true })

// 轮询刷新未查看事件数（已读状态按事件粒度维护，详见 eventBadge.ts）
let badgeTimer = null
const syncEventBadge = () => {
  if (document.hidden) return
  refreshUnreadEventCount()
}

onMounted(() => {
  syncEventBadge()
  badgeTimer = setInterval(syncEventBadge, 60000)
  document.addEventListener('visibilitychange', syncEventBadge)
})

onUnmounted(() => {
  if (badgeTimer) clearInterval(badgeTimer)
  document.removeEventListener('visibilitychange', syncEventBadge)
})
</script>

<style lang="scss" scoped>
:deep(.van-tabbar) {
  border-top: 1px solid #ebedf0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.van-tabbar-item) {
  font-size: 12px;

  .van-icon {
    margin-bottom: 4px;
  }
}
</style>
