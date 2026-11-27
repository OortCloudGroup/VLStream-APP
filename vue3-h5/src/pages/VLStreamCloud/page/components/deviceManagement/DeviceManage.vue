<template>
  <section class="catalog">
    <header>
      <strong>{{ $t('设备') }} <small>{{ total }}</small></strong>
      <button type="button" @click="openFilters">
        {{ category?.name || $t('筛选') }} <van-icon name="filter-o" />
      </button>
      <van-button type="primary" icon="scan" size="small" @click="claimOpen = true">
        {{ $t('扫码添加') }}
      </van-button>
    </header>
    <van-popup v-model:show="claimOpen" position="bottom" round teleport="body" :close-on-click-overlay="false">
      <DeviceClaim v-if="claimOpen" @close="claimOpen = false" @saved="claimed" />
    </van-popup>
    <div class="selection">
      <button @click="directoryOpen = true">
        {{ $t('分类目录') }}
      </button>
      <button @click="toggleSelection">
        {{ $t(selecting ? '取消选择' : '批量分类') }}
      </button>
      <template v-if="selecting">
        <button @click="selectPage">
          {{ $t('选中本页') }}
        </button>
        <button :disabled="!checked.length" @click="bulkOpen = true">
          {{ $t('设置分类') }} ({{ checked.length }})
        </button>
      </template>
    </div>
    <van-popup v-model:show="directoryOpen" round position="bottom" teleport="body" safe-area-inset-bottom>
      <section v-if="directoryOpen" class="filter-form bulk">
        <header>
          <h3>{{ $t('分类目录') }}</h3><button @click="directoryOpen = false">
            {{ $t('关闭') }}
          </button>
        </header>
        <ProtocolClassification directory-only />
      </section>
    </van-popup>
    <van-popup v-model:show="bulkOpen" round position="bottom" teleport="body" safe-area-inset-bottom>
      <section v-if="bulkOpen" class="filter-form bulk">
        <header>
          <h3>{{ $t('批量分类') }} · {{ checked.length }}</h3><button @click="bulkOpen = false">
            {{ $t('关闭') }}
          </button>
        </header>
        <ProtocolClassification :device-keys="checked" @saved="bulkSaved" />
      </section>
    </van-popup>
    <p v-if="error" role="alert">
      {{ error }} <button @click="load">
        {{ $t('重试') }}
      </button>
    </p>
    <van-loading v-else-if="loading" />
    <template v-else>
      <van-empty v-if="!rows.length" :description="$t('暂无设备')" />
      <div v-else class="rows">
        <button v-for="row in rows" :key="row.id" class="device" :aria-pressed="selecting ? checked.includes(String(row.id)) : undefined" @click="choose(row)">
          <van-icon v-if="selecting" :name="checked.includes(String(row.id)) ? 'checked' : 'circle'" /><span class="identity"><b>{{ row.deviceName || row.deviceId }}</b><small v-if="row.deviceName && row.deviceName !== row.deviceId">{{ row.deviceId }}</small></span>
          <span class="state" :class="{ online: row.online }">{{ row.online ? $t('在线') : $t('离线') }}</span>
        </button>
      </div>
      <van-pagination v-if="total > size" v-model="page" :total-items="total" :items-per-page="size" mode="simple" />
    </template>
    <van-popup v-model:show="filterOpen" round position="bottom" teleport="body" safe-area-inset-bottom>
      <section class="filter-form">
        <h3>{{ $t('筛选设备') }}</h3>
        <label>{{ $t('在线状态') }}<select v-model="draftStatus"><option value="">{{ $t('全部') }}</option><option value="true">{{ $t('在线') }}</option><option value="false">{{ $t('离线') }}</option></select></label>
        <label>{{ $t('分类') }}<select v-model="draftType" @change="loadTree"><option value="">{{ $t('全部') }}</option><option v-for="type in types" :key="type.key" :value="type.key">{{ $t(type.name) }}</option></select></label>
        <label v-if="draftType">{{ $t('分类名称') }}<select v-model="draftId" :disabled="treeLoading"><option value="">{{ $t('全部') }}</option><option v-for="item in options" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
        <p v-if="treeError" role="alert">
          {{ treeError }} <button @click="loadTree">
            {{ $t('重试') }}
          </button>
        </p>
        <van-button block type="primary" :disabled="treeLoading" @click="apply">
          {{ $t('确定') }}
        </van-button>
      </section>
    </van-popup>
    <oort-popup :model-value="!!selected" position="right" teleport="body" style="width:100%;height:100%" @update:model-value="selected = null">
      <CameraDetail v-if="selected" :camera="selected" management @close="selected = null" />
    </oort-popup>
  </section>
</template>

<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getWvpVlsDeviceList, getVlsClassificationTree } from '@/api/VLStreamCloud/wvp'
import DeviceClaim from './DeviceClaim.vue'
import ProtocolClassification from './ProtocolClassification.vue'
import CameraDetail from '../cameraDetail/CameraDetail.vue'
import OortPopup from '@/components/popup/oort_popup.vue'

const props = defineProps({ keyword: String })
const { t } = useI18n()
const rows = ref([])
const total = ref(0)
const size = 30
const page = ref(1)
const loading = ref(true)
const error = ref('')
const selected = ref(null)
const selecting = ref(false)
const checked = ref([])
const bulkOpen = ref(false)
const directoryOpen = ref(false)
function toggleSelection() {
  selecting.value = !selecting.value
  checked.value = []
}
function choose(row) {
  if (!selecting.value) { selected.value = row; return }
  const id = String(row.id)
  checked.value = checked.value.includes(id) ? checked.value.filter(key => key !== id) : [...checked.value, id]
}
function selectPage() {
  checked.value = [...new Set([...checked.value, ...rows.value.map(row => String(row.id))])]
}
function bulkSaved() {
  bulkOpen.value = false
  toggleSelection()
  load()
}
const claimOpen = ref(false)
function claimed() {
  claimOpen.value = false
  if (page.value === 1) load()
  else page.value = 1
}
const filterOpen = ref(false)
const category = ref(null)
const status = ref('')
const draftStatus = ref('')
const draftType = ref('')
const draftId = ref('')
const options = ref([])
const treeLoading = ref(false)
const treeError = ref('')
const types = [{ key: 'REGION', name: '区域' }, { key: 'GROUP', name: '分组' }, { key: 'TAG', name: '标签' }]
let generation = 0
let treeGeneration = 0
let timer

async function load() {
  const version = ++generation
  loading.value = true
  error.value = ''
  try {
    const result = await getWvpVlsDeviceList({
      pageNum: page.value, pageSize: size, keyword: props.keyword?.trim() || undefined,
      online: status.value === '' ? undefined : status.value === 'true',
      categoryType: category.value?.type, categoryId: category.value?.id
    })
    if (version !== generation) return
    if (result?.code !== 200 || !Array.isArray(result.rows)) throw new Error(result?.msg || t('设备加载失败'))
    rows.value = result.rows
    total.value = Number(result.total)
  } catch (e) {
    if (version === generation) { error.value = e.message || t('设备加载失败'); total.value = 0 }
  } finally {
    if (version === generation) loading.value = false
  }
}

function flatten(nodes, prefix = '') {
  return nodes.flatMap(node => {
    const name = prefix + node.categoryName
    return [{ id: String(node.id), name }, ...flatten(node.children || [], name + ' / ')]
  })
}
async function loadTree() {
  const version = ++treeGeneration
  options.value = []
  draftId.value = ''
  treeError.value = ''
  treeLoading.value = !!draftType.value
  if (!draftType.value) return
  try {
    const result = await getVlsClassificationTree(draftType.value)
    if (version !== treeGeneration) return
    if (result?.code !== 200) throw new Error(result?.msg || t('分类加载失败'))
    options.value = flatten(result.data?.tree || [])
    if (draftType.value === category.value?.type) draftId.value = category.value.id
  } catch (e) {
    if (version === treeGeneration) treeError.value = e.message || t('分类加载失败')
  } finally {
    if (version === treeGeneration) treeLoading.value = false
  }
}
function openFilters() {
  draftStatus.value = status.value
  draftType.value = category.value?.type || ''
  filterOpen.value = true
  loadTree()
}
function apply() {
  const option = options.value.find(item => item.id === draftId.value)
  category.value = option ? { ...option, type: draftType.value } : null
  status.value = draftStatus.value
  filterOpen.value = false
  page.value = 1
}
defineExpose({ openFilters })
watch(() => props.keyword, () => { page.value = 1 })
watch([page, status, category, () => props.keyword], () => {
  generation++
  loading.value = true
  clearTimeout(timer)
  timer = setTimeout(load, 220)
}, { immediate: true })
onBeforeUnmount(() => { generation++; treeGeneration++; clearTimeout(timer) })
</script>

<style scoped>
.catalog { color: var(--vl-text-1); padding-bottom: 16px; }
header, .device { display:flex; align-items:center; justify-content:space-between; gap:12px; }
header { padding:4px 0; }
header strong { margin-right:auto; }
.catalog > header .van-button { color:var(--van-white); background:var(--van-primary-color); padding:0 12px; }
button, select { font:inherit; color:inherit; background:transparent; border:0; min-height:44px; }
button:focus-visible, select:focus-visible { outline:2px solid var(--van-primary-color); }
small { color:var(--vl-text-2); font-size:12px; font-weight:400; }
.device { width:100%; padding:12px 4px; text-align:left; border-bottom:1px solid var(--van-border-color); }
.identity { display:grid; gap:4px; overflow-wrap:anywhere; }
.state { white-space:nowrap; font-size:12px; color:var(--vl-text-2); }
.state::before { content:""; display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor; margin-right:5px; vertical-align:middle; }
.online { color:#22744e; }
.selection { display:flex; align-items:center; gap:12px; }
.device[aria-pressed] .identity { flex:1; }
.device[aria-pressed=true] .van-icon { color:var(--van-primary-color); }
.bulk { max-height:75vh; overflow:auto; }
.filter-form { padding:16px; }
.filter-form label { display:flex; align-items:center; justify-content:space-between; gap:12px; border-bottom:1px solid var(--van-border-color); }
select { max-width:70%; }
.filter-form .van-button, .van-pagination { margin-top:12px; }
</style>
