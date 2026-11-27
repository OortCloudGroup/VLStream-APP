<template>
  <section class="hub">
    <form @submit.prevent="search">
      <input v-model.trim="keyword" :placeholder="$t('搜索模型')" :aria-label="$t('搜索模型')" />
      <select v-model="category" :aria-label="$t('分类')" @change="search">
        <option value="">
          {{ $t('全部分类') }}
        </option>
        <option v-for="item in categories" :key="item.category">
          {{ item.category }}
        </option>
      </select>
      <label><input v-model="featured" type="checkbox" @change="search" />{{ $t('仅精选') }}</label>
      <button :disabled="busy">
        {{ $t('搜索') }}
      </button>
    </form>
    <p v-if="error" role="alert">
      {{ error }}
    </p>
    <van-loading v-if="busy" />
    <p v-if="!busy && !error && !models.length">
      {{ $t('暂无公开模型') }}
    </p>
    <article v-for="model in models" :key="model.uid">
      <strong>{{ model.name || model.alias }}</strong>
      <small>{{ [model.category, model.author_name].filter(Boolean).join(' · ') }}</small>
      <details v-if="model.description">
        <summary>{{ $t('查看详情') }}</summary>{{ model.description }}
      </details>
      <button :disabled="busy || !model.repo_name" @click="openFiles(model)">
        {{ $t('查看文件') }}
      </button>
      <button :disabled="busy || !device.online || !compatible(model)" @click="prepare(model)">
        {{ $t('下发') }}
      </button>
      <div v-if="active?.uid === model.uid && view === 'files'">
        <small>{{ path || '/' }}</small>
        <button v-if="path" :disabled="busy" @click="list(path.split('/').slice(0,-1).join('/'))">
          {{ $t('上一级') }}
        </button>
        <button v-for="file in files" :key="file.path" :disabled="busy" @click="file.type === 'dir' ? list(file.path) : download(file)">
          {{ file.name }} · {{ $t(file.type === 'dir' ? '打开' : '下载') }}
        </button>
        <small v-if="!busy && !files.length">{{ $t('当前目录没有文件') }}</small>
      </div>
      <div v-if="active?.uid === model.uid && view === 'deploy'">
        <input v-model.trim="algorithmName" :placeholder="$t('搜索目标检测算法')" @keyup.enter="searchAlgorithms" />
        <button :disabled="busy" @click="searchAlgorithms">
          {{ $t('查找算法') }}
        </button>
        <select v-model="algorithm" :disabled="busy" :aria-label="$t('关联本租户算法')">
          <option value="">
            {{ $t('请选择算法') }}
          </option><option v-for="a in algorithms" :key="a.id" :value="String(a.id)">
            {{ a.name }}
          </option>
        </select>
        <button :disabled="busy || !algorithm" @click="deploy">
          {{ $t('确认下发或核实原任务') }}
        </button>
        <p v-if="receipt">
          {{ receipt }}
        </p>
      </div>
    </article>
    <van-pagination v-if="total > 12" v-model="page" :total-items="total" :items-per-page="12" mode="simple" @change="refresh" />
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { showConfirmDialog } from 'vant'
import { useI18n } from 'vue-i18n'
import { managementRequest as api, dispatchAttempt } from '@/api/VLStreamCloud/protocolManagement'
import { getToken } from '@/utils/cache'
import config from '@/config'

const props = defineProps({ device: { type: Object, required: true }})
const { t } = useI18n()
const keyword = ref(''); const category = ref(''); const featured = ref(false); const categories = ref([])
const page = ref(1); const total = ref(0); const models = ref([])
const active = ref(null); const view = ref(''); const files = ref([]); const path = ref('')
const algorithmName = ref(''); const algorithm = ref(''); const algorithms = ref([]); const receipt = ref('')
const busy = ref(false); const error = ref('')
const compatible = model => /^[a-f0-9]{40}$/.test(model.published_commit) && model.device_manifest_path === 'vls-device-manifest.json'

async function run(fn) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try { await fn() } catch (e) {
    if (e !== 'cancel' && e !== 'close') error.value = e.message || String(e)
  } finally { busy.value = false }
}
async function catalog() {
  active.value = null
  models.value = []
  const data = await api('/vlsModelHub/models', { params: { page: page.value, size: 12, keyword: keyword.value, category: category.value, featured: featured.value || undefined }})
  models.value = data.list
  total.value = Number(data.counts ?? data.count ?? 0)
}
function refresh() { run(catalog) }
function search() { if (!busy.value) { page.value = 1; refresh() } }
onMounted(() => run(async() => {
  await catalog()
  categories.value = await api('/vlsModelHub/categories', { method: 'post' }) || []
}))
function fileParams(filePath) { return { uid: active.value.uid, branch: active.value.default_branch || '', path: filePath } }
function list(filePath) {
  run(async() => {
    files.value = []
    path.value = filePath
    const data = await api('/vlsModelHub/files', { method: 'post', data: fileParams(filePath) })
    files.value = data.filter(f => f.type === 'file' || f.type === 'dir')
  })
}
function openFiles(model) {
  active.value = model
  view.value = 'files'
  list('')
}
function session() {
  const token = getToken(); const tenant = sessionStorage.getItem('tenantId') || ''
  if (config.authMode !== 'platform' || !token) throw new Error(t('请使用 OortCloud 平台账号登录后下载或下发'))
  return {
    headers: { 'X-Model-Hub-Token': token, 'X-Model-Hub-Tenant': tenant },
    assertCurrent() {
      if (config.authMode !== 'platform' || getToken() !== token || (sessionStorage.getItem('tenantId') || '') !== tenant) throw new Error(t('登录身份已变更'))
    }
  }
}
function download(file) {
  run(async() => {
    const auth = session()
    const blob = await api('/vlsModelHub/download', { method: 'post', data: fileParams(file.path), headers: auth.headers, media: true })
    auth.assertCurrent()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = file.name.replace(/[\\/:*?"<>|]/g, '_')
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 60000)
  })
}
function searchAlgorithms() {
  run(async() => {
    const data = await api('/vlsAlgorithm/page', { params: { current: 1, size: 100, category: 'detect', name: algorithmName.value }})
    algorithms.value = data.records.filter(a => a.category === 'detect')
  })
}
function prepare(model) {
  active.value = model
  view.value = 'deploy'
  algorithm.value = ''
  algorithmName.value = ''
  receipt.value = ''
  algorithms.value = []
  searchAlgorithms()
}
function deploy() {
  run(async() => {
    const auth = session()
    const data = { uid: active.value.uid, commit: active.value.published_commit, algorithmId: algorithm.value, deviceIds: [String(props.device.deviceId)] }
    await showConfirmDialog({ message: t('将模型下发到当前设备？') + ' ' + props.device.deviceId })
    auth.assertCurrent()
    const operationId = dispatchAttempt(['hub', data.uid, data.commit, data.algorithmId, data.deviceIds]).id
    const result = await api('/vlsModelHub/deploy', { method: 'post', headers: auth.headers, data: { ...data, operationId }})
    auth.assertCurrent()
    const row = Array.isArray(result) && result.find(item => String(item.deviceId) === data.deviceIds[0])
    if (!row?.requestId || !row.status) throw new Error(t('结果未确认，请核实原任务'))
    receipt.value = row.status + ' · ' + row.requestId
  })
}
</script>

<style scoped>
.hub { overflow-wrap:anywhere; }
form { display:flex; align-items:center; flex-wrap:wrap; gap:8px; }
input:not([type=checkbox]), select, button, summary { min-height:44px; max-width:100%; }
article { padding:14px 0; border-bottom:1px solid var(--van-border-color); }
strong, small { display:block; }
small { color:var(--vl-text-2); }
</style>
