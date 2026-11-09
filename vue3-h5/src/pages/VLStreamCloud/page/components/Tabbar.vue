<template>
  <van-tabbar v-model="active" route class="vl-tabbar">
    <van-tabbar-item
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      :badge="tab.to === '/event' ? eventBadge : ''"
    >
      <span>{{ $t(tab.label) }}</span>
      <template #icon="props">
        <span class="tab-icon" :class="{ active: props.active }">
          <LineIcon :name="tab.icon" :size="22" :stroke="props.active ? 2.2 : 1.8" />
        </span>
      </template>
    </van-tabbar-item>
  </van-tabbar>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { unreadEventCount, refreshUnreadEventCount } from './event/eventBadge'
import LineIcon from './LineIcon.vue'

const tabs = [
  { to: '/workbench', label: '工作台', icon: 'home' },
  { to: '/video', label: '视频', icon: 'video' },
  { to: '/event', label: '事件', icon: 'event' },
  { to: '/my', label: '我的', icon: 'user' }
]

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
.vl-tabbar {
  border-top: 1px solid var(--vl-line);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
}

:deep(.van-tabbar-item) {
  font-size: 11px;
  font-weight: 500;
  color: var(--vl-text-3);

  &.van-tabbar-item--active {
    color: var(--vl-ink);
    font-weight: 700;
    background: transparent;
  }
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  color: var(--vl-text-3);

  &.active {
    color: var(--vl-ink);
  }
}
</style>
