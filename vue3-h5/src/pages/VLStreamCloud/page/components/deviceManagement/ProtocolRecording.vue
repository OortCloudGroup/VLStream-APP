<template>
  <div>
    <p v-if="error" role="alert">
      {{ error }}
    </p>
    <fieldset :disabled="busy">
      <label>{{ $t('选择通道') }}<select v-model="selected" @change="setPlan"><option v-for="ch in choices" :key="ch.key" :value="ch.key">{{ ch.name || $t('设备主码流') }}</option></select></label>
      <template v-if="choices.length">
        <p>{{ $t('录像状态') }} · {{ current?.state || $t('未录制') }}</p>
        <button :disabled="!current?.manual_enabled && !device.online" @click="manual">
          {{ $t(current?.manual_enabled ? '停止手动录制' : '开始手动录制') }}
        </button>
        <label>{{ $t('录像保留时间') }}<select v-model="retention"><option v-for="d in [7,30,90,0]" :key="d" :value="d">{{ d ? d + $t('天') : $t('永久') }}</option></select></label>
        <button @click="saveRetention">
          {{ $t('保存保留时间') }}
        </button>
        <label>{{ $t('定时录像') }}<input v-model="plan.enabled" type="checkbox" /></label>
        <div class="days">
          <label v-for="(day,i) in days" :key="day"><input v-model="plan.weekDays" type="checkbox" :value="i+1" />{{ $t(day) }}</label>
        </div>
        <label>{{ $t('开始时间') }}<input v-model="plan.startTime" type="time" /></label>
        <label>{{ $t('结束时间') }}<input v-model="plan.endTime" type="time" /></label>
        <p>{{ $t('北京时间，起止相同表示全天。') }}</p>
        <button @click="savePlan">
          {{ $t('保存计划') }}
        </button>
        <h4>{{ $t('历史录像') }}</h4><input v-model="date" type="date" :aria-label="$t('录像日期')" />
        <button @click="history">
          {{ $t('查询录像') }}
        </button>
        <p v-if="queried && !segments.length">
          {{ $t('暂无录像') }}
        </p>
        <div v-for="item in segments" :key="item.id">
          <button @click="play(item)">
            {{ time(item.start_ms) }} – {{ time(item.end_ms) }}
          </button>
        </div>
        <video v-if="url" :src="url" controls playsinline autoplay />
      </template>
      <p v-else-if="!busy && !error">
        {{ $t('暂无可录制通道') }}
      </p>
      <button @click="refresh">
        {{ $t('刷新') }}
      </button>
    </fieldset>
  </div>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showConfirmDialog, showToast } from 'vant'
import { managementRequest as api } from '@/api/VLStreamCloud/protocolManagement'
const props = defineProps({ device: Object, protocol: { type: String, default: 'VLSTREAM' }})
const { t } = useI18n()
const sources = ref([]); const choices = ref([]); const selected = ref('')
const current = computed(() => sources.value.find(row => String(row.stream_id ?? '') === selected.value))
const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const plan = reactive({}); const retention = ref(7)
const busy = ref(false); const error = ref(''); const queried = ref(false)
const segments = ref([]); const url = ref('')
const date = ref(new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10))
const base = '/platform-recordings/sources'
const time = ms => new Date(Number(ms)).toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })
let disposed = false
function clearMedia() {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = ''
}
function setPlan() {
  Object.assign(plan, current.value?.plan || { enabled: false, weekDays: [1, 2, 3, 4, 5, 6, 7], startTime: '00:00', endTime: '00:00' })
  plan.weekDays = [...plan.weekDays]
  retention.value = Number(current.value?.retention_days ?? 7)
  clearMedia()
  segments.value = []
  queried.value = false
}
async function load() {
  const rowId = props.device.id
  sources.value = await api(base, { params: { protocol: props.protocol, rowId }})
  const channels = new Map(sources.value.map(row => [String(row.stream_id ?? ''), row.source?.channelName || row.source?.name]))
  try {
    const available = await api('/video/cloud-ai/sources/' + props.protocol + '/' + rowId, { wvp: true })
    available.filter(ch => ch.supported).forEach(ch => channels.set(String(ch.streamId ?? ''), ch.name))
  } finally {
    choices.value = [...channels].map(([key, name]) => ({ key, name }))
    if (!channels.has(selected.value)) selected.value = choices.value[0]?.key || ''
    setPlan()
  }
}
async function run(fn) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try { await fn() } catch (err) { if (err !== 'cancel' && err !== 'close') error.value = err.message || String(err) } finally { busy.value = false }
}
function refresh() { run(load) }
async function bind() {
  const grant = await api('/video/cloud-ai/grants', { wvp: true, method: 'post', data: { protocol: props.protocol, deviceRowId: props.device.id, streamId: selected.value || null }})
  return (await api(base, { method: 'post', data: { token: grant.grantToken }})).id
}
async function update(id, action, data) {
  await api(base + '/' + id + '/' + action, { method: 'put', data })
  showToast(t('已保存'))
  await load()
}
function manual() {
  run(async() => {
    const stop = !!current.value?.manual_enabled
    await update(stop ? current.value.id : await bind(), 'manual', { enabled: !stop })
  })
}
function saveRetention() {
  run(async() => {
    await showConfirmDialog({ message: t('缩短保留时间会在下次清理时删除超期录像。确认保存？') })
    await update(current.value?.id || await bind(), 'retention', { days: retention.value })
  })
}
function savePlan() {
  run(async() => { await update(!plan.enabled && current.value ? current.value.id : await bind(), 'plan', { ...plan }) })
}
function history() {
  run(async() => {
    clearMedia()
    segments.value = current.value ? await api(base + '/' + current.value.id + '/segments', { params: { date: date.value }}) : []
    queried.value = true
  })
}
function play(item) {
  run(async() => {
    const blob = await api('/platform-recordings/segments/' + item.id + '/file', { media: true })
    clearMedia()
    if (!disposed) url.value = URL.createObjectURL(blob)
  })
}
onMounted(refresh)
onBeforeUnmount(() => { disposed = true; clearMedia() })
</script>
<style scoped>
fieldset { border:0; padding:0; margin:12px 0; }
label { display:flex; align-items:center; justify-content:space-between; gap:8px; }
button, select, input:not([type=checkbox]) { min-height:44px; font:inherit; }
.days { display:flex; gap:8px; flex-wrap:wrap; }
.days label { min-height:44px; }
video { width:100%; background:black; }
</style>
