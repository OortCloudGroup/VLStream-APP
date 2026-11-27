<template>
  <div>
    <p v-if="error" role="alert">
      {{ error }}
    </p>
    <fieldset :disabled="busy || !ready">
      <template v-if="!directoryOnly">
        <label v-for="classification in kinds" :key="classification.key">{{ $t(classification.name) }}
          <select v-model="assigned[classification.key]" :multiple="classification.key === 'TAG'">
            <option v-if="classification.key !== 'TAG'" value="">{{ $t('未分类') }}</option>
            <option v-for="item in tree[classification.key]" :key="item.id" :value="item.id">{{ item.path }}</option>
          </select>
        </label>
        <van-button block type="primary" @click="save">
          {{ $t('保存设备分类') }}
        </van-button>
      </template>
      <details :open="directoryOnly">
        <summary>{{ $t('管理分类目录') }}</summary>
        <label>{{ $t('分类类型') }}<select v-model="kind" @change="selectNode('')"><option v-for="k in kinds" :key="k.key" :value="k.key">{{ $t(k.name) }}</option></select></label>
        <label>{{ $t('分类') }}<select :value="nodeId" @change="selectNode($event.target.value)"><option value="">{{ $t('新建分类') }}</option><option v-for="n in tree[kind]" :key="n.id" :value="n.id">{{ n.path }}</option></select></label>
        <label>{{ $t('名称') }}<input v-model.trim="name" maxlength="64" /></label>
        <label>{{ $t('上级分类') }}<select v-model="parent"><option value="0">{{ $t('根目录') }}</option><option v-for="n in parents" :key="n.id" :value="n.id">{{ n.path }}</option></select></label>
        <button :disabled="!name" @click="saveNode">
          {{ $t(nodeId ? '保存修改' : '创建分类') }}
        </button>
        <button v-if="nodeId" @click="deleteNode">
          {{ $t('删除分类') }}
        </button>
        <button v-if="nodeId" @click="toggleReview">
          {{ $t('大模型复核') }}
        </button>
      </details>
    </fieldset>
    <button :disabled="busy" @click="refresh">
      {{ $t('刷新') }}
    </button>
  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { managementRequest as api } from '@/api/VLStreamCloud/protocolManagement'
const props = defineProps({ device: Object, deviceKeys: Array, directoryOnly: Boolean, protocolType: { type: String, default: 'VLSTREAM' }})
const emit = defineEmits(['saved'])
const { t } = useI18n()
const base = '/device/classification/'
const protocolType = props.protocolType
const kinds = [{ key: 'REGION', name: '区域' }, { key: 'GROUP', name: '分组' }, { key: 'TAG', name: '标签' }]
const assigned = reactive({ REGION: '', GROUP: '', TAG: [] })
const tree = reactive({ REGION: [], GROUP: [], TAG: [] })
const busy = ref(false); const ready = ref(false); const error = ref('')
const kind = ref('REGION'); const nodeId = ref(''); const name = ref(''); const parent = ref('0')
const parents = computed(() => tree[kind.value].filter(n => !n.chain.includes(nodeId.value)))
function flatten(nodes, prefix = '', ancestors = []) {
  return nodes.flatMap(n => {
    const id = String(n.id); const path = prefix + n.categoryName; const chain = [...ancestors, id]
    return [{ ...n, id, path, chain }, ...flatten(n.children || [], path + ' / ', chain)]
  })
}
function selectNode(id) {
  nodeId.value = id
  const node = tree[kind.value].find(item => item.id === id)
  name.value = node?.categoryName || ''
  parent.value = String(node?.parentId || '0')
}
async function load() {
  ready.value = false
  await Promise.all(kinds.map(async k => {
    const data = await api(base + 'tree', { wvp: true, params: { categoryType: k.key, protocolType }})
    tree[k.key] = flatten(data.tree || [])
  }))
  if (!props.device) {
    ready.value = true
    return
  }
  const data = await api(base + 'assignments', { wvp: true, params: { protocolType, deviceKey: props.device.id }})
  Object.assign(assigned, { REGION: String(data.regionId || ''), GROUP: String(data.groupId || ''), TAG: (data.tagIds || []).map(String) })
  ready.value = true
}
async function run(fn) {
  if (busy.value) return
  busy.value = true
  error.value = ''
  try { await fn() } catch (err) { if (err !== 'cancel' && err !== 'close') error.value = err.message || String(err) } finally { busy.value = false }
}
function refresh() { run(load) }
function save() {
  run(async() => {
    if (props.deviceKeys?.length) {
      await showConfirmDialog({ message: t('所选设备的区域、分组和标签将统一替换，确认保存？') })
    }
    await api(base + 'assignments', { wvp: true, method: 'put', data: { protocolType, deviceKeys: props.deviceKeys || [String(props.device.id)],
      regionId: assigned.REGION || null, groupId: assigned.GROUP || null, tagIds: assigned.TAG }})
    showToast(t('已保存'))
    emit('saved')
  })
}
function saveNode() {
  run(async() => {
    const node = tree[kind.value].find(n => n.id === nodeId.value)
    await api(base + 'category', { wvp: true, method: node ? 'put' : 'post', data: {
      id: node?.id, categoryType: kind.value, categoryName: name.value, parentId: parent.value, sortNum: node?.sortNum || 0
    }})
    await load()
    selectNode('')
  })
}
function deleteNode() {
  run(async() => {
    await showConfirmDialog({ message: t('确认删除分类？') + ' ' + name.value })
    await api(base + 'category/' + nodeId.value, { wvp: true, method: 'delete' })
    await load()
    selectNode('')
  })
}
function toggleReview() {
  run(async() => {
    const path = '/vlsLlmReview/scopes/' + kind.value + '/' + nodeId.value
    const value = await api(path)
    await showConfirmDialog({ message: t(value ? '关闭该分类的自动复核？' : '开启该分类的自动复核？') })
    await api(path, { method: 'put', data: { enabled: !value }})
    showToast(t('已保存'))
  })
}
onMounted(refresh)
</script>
<style scoped>
fieldset { padding:0; margin:12px 0; border:0; }
label { display:flex; align-items:center; justify-content:space-between; gap:8px; margin:6px 0; }
select, input { min-height:44px; max-width:70%; }
button, summary { min-height:44px; }
summary { line-height:44px; }
</style>
