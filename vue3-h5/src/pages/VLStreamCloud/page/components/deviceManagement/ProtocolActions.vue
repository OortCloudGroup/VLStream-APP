<template>
  <div class="operations">
    <van-cell v-for="entry in entries" :key="entry.key" :title="$t(entry.label)" is-link @click="open(entry)" />
    <van-popup v-model:show="visible" round position="bottom" teleport="body" safe-area-inset-bottom>
      <section class="sheet">
        <header>
          <h3>{{ $t(section.label) }}</h3><button @click="visible = false">
            {{ $t('关闭') }}
          </button>
        </header>
        <small>{{ device.deviceName || device.deviceId }} · {{ device.deviceId }}</small>
        <van-loading v-if="busy" />
        <p v-if="error" role="alert">
          {{ error }}
        </p>
        <template v-if="ready">
          <template v-if="section.key === 'review'">
            <p>{{ $t(review ? '此设备已开启告警自动复核' : '此设备已关闭告警自动复核') }}</p>
            <van-button :disabled="busy" @click="changeReview">
              {{ $t(review ? '关闭复核' : '开启复核') }}
            </van-button>
          </template>
          <template v-if="section.key === 'models'">
            <h4>{{ $t('设备运行模型') }}</h4>
            <div v-for="item in models" :key="item.modelId" class="row">
              <span>{{ item.modelName || item.modelId }}</span>
              <button :disabled="busy || !device.online" @click="remove(item)">
                {{ $t('卸载') }}
              </button>
            </div>
            <h4>{{ $t('模型下发') }}</h4>
            <input v-model="search" :aria-label="$t('搜索模型')" :placeholder="$t('搜索模型')" @keyup.enter="findModels" />
            <button :disabled="busy" @click="findModels">
              {{ $t('搜索') }}
            </button>
            <div v-for="item in candidates" :key="item.id" class="row">
              <span>{{ item.modelName }} · {{ item.version }}</span>
              <button :disabled="busy || !device.online || !item.deployable" @click="dispatch(item)">
                {{ $t('下发') }}
              </button>
            </div>
            <van-pagination v-if="total > 10" v-model="page" :items-per-page="10" :total-items="total" mode="simple" @change="run(loadCandidates)" />
            <h4>{{ $t('最近下发任务') }}</h4>
            <p v-for="item in tasks" :key="item.requestId">
              {{ item.fileName || item.modelName || item.trainingId }} · {{ item.dispatchStatus || item.state || item.status }}
            </p>
          </template>
          <template v-if="section.key === 'remote'">
            <p>{{ $t(tunnel.featureEnabled ? (tunnel.configured ? '已配置' : '尚未激活') : '功能未启用') }} {{ tunnel.desiredState }} {{ tunnel.tunnelStatus }}</p>
            <template v-if="tunnel.featureEnabled">
              <button :disabled="busy || !canOpen" @click="openRemote">
                {{ $t('打开管理后台') }}
              </button>
              <button :disabled="busy" @click="enroll">
                {{ $t('生成激活码') }}
              </button>
              <template v-if="tunnel.configured && tunnel.desiredState !== 'REVOKED'">
                <button :disabled="busy" @click="changeState(tunnel.desiredState === 'DISABLED' ? 'ENABLED' : 'DISABLED')">
                  {{ $t(tunnel.desiredState === 'DISABLED' ? '启用' : '停用') }}
                </button>
                <button :disabled="busy" @click="changeState('REVOKED')">
                  {{ $t('吊销') }}
                </button>
              </template>
              <p v-if="code">
                {{ $t('激活码') }} <strong>{{ code }}</strong>
              </p>
            </template>
          </template>
          <ProtocolHub v-if="visible && section.key === 'hub'" :device="device" />
          <ProtocolRecording v-if="visible && section.key === 'record'" :device="device" />
          <ProtocolClassification v-if="visible && section.key === 'category'" :device="device" />
        </template>
        <button v-if="!['category','record','hub'].includes(section.key)" :disabled="busy" @click="reload">
          {{ $t('刷新') }}
        </button>
      </section>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { managementRequest as api, dispatchAttempt } from '@/api/VLStreamCloud/protocolManagement'
import { parseSnapshot } from '@/utils/deviceState'
import ProtocolClassification from './ProtocolClassification.vue'
import ProtocolHub from './ProtocolHub.vue'
import ProtocolRecording from './ProtocolRecording.vue'
const props = defineProps({ device: { type: Object, required: true }})
const { t } = useI18n()
const entries = [{ key: 'category', label: '设备分类' }, { key: 'models', label: '设备模型' }, { key: 'hub', label: 'Model Hub' }, { key: 'record', label: '录像与回放' }, { key: 'review', label: '大模型复核' }, { key: 'remote', label: '远程管理' }]
const section = ref(entries[0])
const visible = ref(false); const busy = ref(false); const ready = ref(false); const error = ref('')
const review = ref(false); const models = ref([]); const candidates = ref([]); const tasks = ref([])
const page = ref(1); const total = ref(0); const search = ref('')
const tunnel = ref({}); const code = ref('')
const id = computed(() => encodeURIComponent(props.device.deviceId))
const remotePath = computed(() => '/vlsTunnel/devices/' + id.value)
const reviewPath = computed(() => '/vlsLlmReview/scopes/DEVICE/' + id.value)
const canOpen = computed(() => tunnel.value.desiredState === 'ENABLED' && tunnel.value.agentOnline &&
  tunnel.value.tunnelStatus === 'ONLINE' && tunnel.value.localWebStatus === 'AVAILABLE' && tunnel.value.routeStatus === 'APPLIED')
async function run(operation) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try { await operation() } catch (err) {
    if (err !== 'cancel' && err !== 'close') error.value = err?.message || String(err)
  } finally { busy.value = false }
}
async function loadCandidates() {
  const data = await api('/vlsModelDispatch/models', { params: { current: page.value, size: 10, keyword: search.value.trim() }})
  candidates.value = data.records
  total.value = Number(data.total)
}
function findModels() { page.value = 1; run(loadCandidates) }
function loadTasks() {
  return api('/vlsModelDispatch/tasks', { params: { deviceId: props.device.deviceId, limit: 20 }}).then(data => { tasks.value = data || [] })
}
function reload() {
  return run(async() => {
    if (section.value.key === 'review') review.value = await api(reviewPath.value)
    if (section.value.key === 'remote') tunnel.value = await api(remotePath.value)
    if (section.value.key === 'models') {
      models.value = parseSnapshot(props.device.modelsJson) || []
      await Promise.all([loadCandidates(), loadTasks()])
      ready.value = true
      if (props.device.online) models.value = await api('/vlsDeviceModels', { params: { deviceId: props.device.deviceId }})
    }
    ready.value = true
  })
}
function open(entry) {
  if (busy.value) return
  section.value = entry
  visible.value = true
  ready.value = false
  code.value = ''
  search.value = ''
  page.value = 1
  reload()
}
watch(visible, shown => { if (!shown) code.value = '' })
function changeReview() {
  run(async() => {
    review.value = await api(reviewPath.value, { method: 'put', data: { enabled: !review.value }})
  })
}
function remove(item) {
  run(async() => {
    await showConfirmDialog({ message: t('从设备卸载模型？') + ' ' + (item.modelName || item.modelId) })
    await api('/vlsDeviceModels', { method: 'delete', params: { deviceId: props.device.deviceId, modelId: item.modelId }})
    models.value = models.value.filter(model => model.modelId !== item.modelId)
  })
}
function dispatch(item) {
  run(async() => {
    await showConfirmDialog({ message: t('将模型下发到当前设备？') + ' ' + item.modelName })
    const attempt = dispatchAttempt(['saved', props.device.deviceId, item.id])
    const task = await api('/vlsModelDispatch/models/' + encodeURIComponent(item.id) + '/attempt', {
      method: 'post', params: { deviceId: props.device.deviceId, operationId: attempt.id }
    })
    if (task?.state === 'FAILED' && task.retryable) attempt.clear()
    showToast(task?.message || task?.state || t('请刷新核实任务'))
    await loadTasks()
  })
}
function enroll() {
  run(async() => {
    if (tunnel.value.configured) await showConfirmDialog({ message: t('重新激活将撤销当前 Agent 凭据和未过期的浏览器会话。') })
    const data = await api(remotePath.value + '/enrollments', { method: 'post' })
    if (visible.value) code.value = data.enrollmentCode
    tunnel.value = await api(remotePath.value)
  })
}
function changeState(state) {
  run(async() => {
    await showConfirmDialog({ message: t(state === 'REVOKED' ? '吊销后必须重新激活，确认继续？' : '更改远程管理状态？') })
    await api(remotePath.value + '/desired-state', { method: 'post', params: { state }})
    tunnel.value = await api(remotePath.value)
  })
}
function openRemote() {
  const win = window.open('about:blank', '_blank')
  if (!win) { error.value = t('请允许打开新窗口'); return }
  win.opener = null
  run(async() => {
    try {
      const data = await api(remotePath.value + '/access-sessions', { method: 'post' })
      const url = new URL(data.accessUrl, window.location.origin)
      if (!['https:', 'http:'].includes(url.protocol) || !data.accessUrl) throw new Error(t('访问地址无效'))
      win.location.replace(url.href)
    } catch (err) { win.close(); throw err }
  })
}
</script>

<style scoped>
.sheet { padding:16px; max-height:78vh; overflow:auto; }
header, .row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.sheet button, .sheet input { min-height:44px; font:inherit; }
.sheet button { background:transparent; color:var(--van-primary-color); border:0; }
.sheet p, .row { overflow-wrap:anywhere; }
[role=alert] { color:#9d3518; }
</style>
