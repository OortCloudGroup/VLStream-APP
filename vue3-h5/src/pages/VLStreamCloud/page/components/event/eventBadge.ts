import { ref } from 'vue'
import { useUserStore } from '@/store/modules/useraPaas'
import { event_list } from '@/api/eventManagement'

const LAST_SEEN_KEY = 'vl_event_last_seen_at'
const SEEN_IDS_KEY = 'vl_event_seen_ids'
const BADGE_PAGE_SIZE = 50

export interface EventBadgeItem {
  id?: string | number
  created_at: string | number
}

interface EventListResult {
  code: number
  data?: { count?: number, list?: EventBadgeItem[] }
}

// 未查看的新事件数（模块级共享状态，Tabbar 角标读取）
export const unreadEventCount = ref(0)

// 上次查看基准时间，无记录时以当前时间初始化（只统计之后的新事件）
const getLastSeen = (): number => {
  const raw = localStorage.getItem(LAST_SEEN_KEY)
  const val = raw ? Number(raw) : NaN
  return Number.isFinite(val) && val > 0 ? val : Date.now()
}

// 已查看详情的事件ID集合
const getSeenIds = (): string[] => {
  try {
    const parsed: object = JSON.parse(localStorage.getItem(SEEN_IDS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.map(item => String(item)) : []
  } catch (error) {
    return []
  }
}

const setSeenIds = (ids: string[]) => {
  localStorage.setItem(SEEN_IDS_KEY, JSON.stringify(ids))
}

// 兼容 'yyyy-MM-dd HH:mm:ss' / ISO 字符串 / 时间戳
const parseTime = (val: string | number): number => {
  if (typeof val === 'number') return val
  const t = new Date(String(val).replace(/-/g, '/')).getTime()
  return Number.isFinite(t) ? t : 0
}

// 全部新事件都已查看：推进基准时间并清空已查看ID，之后产生的事件才算新事件
const compactSeenState = () => {
  localStorage.setItem(LAST_SEEN_KEY, String(Date.now()))
  setSeenIds([])
}

// 判断单条事件是否属于未查看的新事件（时间晚于基准 且 未查看过详情）
export const isUnseenEvent = (item: EventBadgeItem): boolean => {
  if (parseTime(item.created_at) <= getLastSeen()) return false
  if (item.id === undefined || item.id === null) return true
  return !getSeenIds().includes(String(item.id))
}

// 查看单个事件详情后标记已读：角标减一，该条"新"标示消失
export const markEventSeen = (item: EventBadgeItem) => {
  const wasUnseen = isUnseenEvent(item)
  if (item.id !== undefined && item.id !== null) {
    const ids = getSeenIds()
    const key = String(item.id)
    if (!ids.includes(key)) {
      ids.push(key)
      setSeenIds(ids)
    }
  }
  if (wasUnseen && unreadEventCount.value > 0) {
    unreadEventCount.value -= 1
  }
}

// 拉取事件列表第一页，统计未查看的新事件数；为0时说明新事件全部看完，推进基准
export const refreshUnreadEventCount = async() => {
  const store = useUserStore()
  if (!store.token) return
  try {
    const res = await event_list({
      accessToken: store.token,
      tenant_id: store.tenantId,
      status: 0,
      page: 1,
      pageSize: BADGE_PAGE_SIZE,
      mod_type: 2,
      mod_status: 0
    }) as EventListResult
    if (res.code !== 200) return
    const list = res.data?.list || []
    const unseen = list.filter(item => isUnseenEvent(item)).length
    unreadEventCount.value = unseen
    if (unseen === 0) compactSeenState()
  } catch (error) {
    // 静默失败，角标保持现状
  }
}
