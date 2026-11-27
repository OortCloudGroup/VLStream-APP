<template>
  <section class="directory">
    <header>
      <strong>{{ $t(heading) }} <small>{{ total }}</small></strong>
      <van-button v-if="kind === 'onvif'" icon="search" size="small" @click="discover">
        {{ $t('发现设备') }}
      </van-button>
      <van-button v-if="canCreate" icon="plus" size="small" type="primary" @click="edit(null)">
        {{ $t('添加') }}
      </van-button>
    </header>
    <div v-if="kind === 'live'" class="monitor">
      <div v-for="(feed, i) in feeds" :key="i">
        <ProtocolStream v-if="feed" :key="feed.id || feed.gbDeviceId" kind="live" :row="feed" />
        <button :aria-pressed="slot === i" @click="slot = i">
          {{ $t('窗口') }} {{ i + 1 }} · {{ feed ? title(feed) : $t('选择通道') }}
        </button>
        <button v-if="feed" @click="feeds[i] = null">
          {{ $t('关闭') }}
        </button>
      </div>
    </div>
    <van-loading v-if="busy" />
    <van-empty v-else-if="error" :description="error">
      <van-button @click="load">
        {{ $t('重试') }}
      </van-button>
    </van-empty>
    <van-empty v-else-if="!rows.length" :description="$t('暂无数据')" />
    <template v-else>
      <button v-for="(row, i) in rows" :key="row.id ?? row.deviceId ?? i" class="entry" @click="open(row)">
        <span><b>{{ title(row) }}</b><small>{{ subtitle(row) }}</small></span><van-icon name="arrow" />
      </button>
      <van-pagination v-if="total > size" v-model="page" :items-per-page="size" :total-items="total" mode="simple" />
    </template>
    <van-popup v-model:show="sheet" round position="bottom" teleport="body" safe-area-inset-bottom :close-on-click-overlay="!working">
      <section class="detail">
        <header>
          <h3>{{ editing ? $t(selected ? '编辑' : '添加') : title(selected) }}</h3><van-button size="small" :disabled="working" @click="sheet=false">
            {{ $t('关闭') }}
          </van-button>
        </header>
        <template v-if="tool === 'discovery'">
          <van-loading v-if="working" />
          <van-empty v-else-if="!found.length" :description="$t('未发现设备')" />
          <van-cell v-for="item in found" :key="item.hostName || item.ip" is-link :title="item.hostName || item.ip" @click="prepareOnvif(item)" />
        </template>
        <form v-else-if="editing" @submit.prevent="save">
          <van-field v-for="key in fields" :key="key" v-model="form[key]" :type="key === 'password' ? 'password' : 'text'" :label="$t(labels[key])" :required="required.includes(key)" />
          <van-button block native-type="submit" type="primary" :loading="working">
            {{ $t('保存') }}
          </van-button>
        </form>
        <ProtocolStream v-else-if="sheet && tool === 'preview'" :kind="kind" :row="selected" />
        <ProtocolClassification v-else-if="tool === 'classification'" :device="selected" :protocol-type="def.classType" @saved="tool = ''" />
        <ProtocolRecording v-else-if="sheet && tool === 'recording'" :device="selected" :protocol="def.classType" />
        <video v-else-if="recordingUrl && sheet" :src="recordingUrl" playsinline autoplay controls style="width:100%" />
        <template v-else-if="selected">
          <van-cell v-if="['rtsp','custom','onvif','push','proxy','channel'].includes(kind)" is-link :title="$t('预览')" @click="tool = 'preview'" />
          <van-cell v-if="def.classType && selected.id != null" is-link :title="$t('设置分类')" @click="tool = 'classification'" />
          <van-cell v-if="['onvif','custom','rtsp'].includes(kind)" is-link :title="$t('录像与回放')" @click="tool = 'recording'" />
          <van-cell v-if="kind === 'records'" is-link :title="$t('播放录像')" @click="playRecord" />
          <van-cell v-for="key in details" :key="key" :title="$t(labels[key])" :value="String(selected[key])" />
          <van-cell v-if="fields.length && (def.edit || def.editRow)" is-link :title="$t('编辑')" @click="edit(selected)" />
          <van-cell v-if="kind === 'gb'" is-link :title="$t('同步通道')" @click="syncChannels" />
          <van-cell v-if="def.remove && selected.id != null" is-link :title="$t('删除')" @click="remove" />
        </template>
        <p v-if="sheetError" role="alert">
          {{ sheetError }}
        </p>
      </section>
    </van-popup>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { showConfirmDialog, showSuccessToast } from 'vant'
import { useI18n } from 'vue-i18n'
import ProtocolClassification from './ProtocolClassification.vue'
import ProtocolStream from './ProtocolStream.vue'
import ProtocolRecording from './ProtocolRecording.vue'
import { directories, gbPages, pageOf, wvp } from '@/api/VLStreamCloud/deviceCatalog'
const props = defineProps({ kind: { type: String, required: true }, keyword: String })
const { t } = useI18n()
const def = computed(() => directories[props.kind])
const heading = computed(() => gbPages.find(item => item[0] === props.kind)?.[1] || '设备')
const rows = ref([])
const total = ref(0)
const page = ref(1)
const size = 20
const busy = ref(true)
const error = ref('')
const feeds = ref([null, null])
const slot = ref(0)
const sheet = ref(false)
const selected = ref(null)
const editing = ref(false)
const working = ref(false)
const sheetError = ref('')
const tool = ref('')
const recordingUrl = ref('')
const found = ref([])
const form = ref({})
const schemas = { isup: ['name', 'remark'], ehome: ['name', 'remark'], rtsp: ['name', 'ip', 'userName', 'password', 'channel', 'remark'], custom: ['deviceName', 'deviceCode', 'deviceType', 'streamUrl', 'address', 'remark'], onvif: ['name', 'remark'], gb: ['name'] }
const fields = computed(() => tool.value === 'register' ? ['name', 'ip', 'userName', 'password'] : schemas[props.kind] || [])
const required = computed(() => tool.value === 'register' ? fields.value : ({ rtsp: ['name', 'ip'], custom: ['deviceName', 'deviceCode', 'streamUrl'] })[props.kind] || ['name'])
const canCreate = computed(() => def.value.add && fields.value.length)
const labels = { id: '编号', name: '名称', deviceName: '设备名称', deviceCode: '设备编号', deviceId: '设备 ID', deviceType: '设备类型', channel: '通道', status: '状态', model: '型号', ip: 'IP 地址', ipAddress: 'IP 地址', hostAddress: '地址', remark: '备注', userName: '用户名', password: '密码', streamUrl: '视频流地址', address: '地址', stream: '流标识', app: '应用', mediaServerId: '媒体节点', gbName: '名称', gbDeviceId: '国标编码', gbCivilCode: '行政区划', parentId: '上级编号', serverGBId: '平台编码', serverIp: '平台地址', fileName: '文件名', updateTime: '更新时间', alarmTime: '报警时间', alarmDescription: '报警描述', channelId: '通道编号', type: '类型' }
const details = computed(() => Object.keys(labels).filter(key => !['password', 'userName', 'streamUrl'].includes(key) && selected.value?.[key] != null && selected.value[key] !== ''))
function title(row) { return row && (def.value.names.map(k => row[k]).find(Boolean) || String(row.id ?? '—')) }
function subtitle(row) { return def.value.subtitle.map(k => row[k]).filter(v => v != null && v !== '' && v !== title(row)).join(' · ') }
let generation = 0
let timer
async function load() {
  const version = ++generation
  busy.value = true
  error.value = ''
  try {
    const data = await pageOf(props.kind, page.value, size, props.keyword?.trim())
    if (version === generation) { rows.value = data.rows; total.value = data.total }
  } catch (e) { if (version === generation) { error.value = e.message; total.value = 0 } } finally { if (version === generation) busy.value = false }
}
watch(() => props.keyword, () => { page.value = 1 })
watch([page, () => props.keyword], () => { generation++; busy.value = true; clearTimeout(timer); timer = setTimeout(load, 200) }, { immediate: true })
onBeforeUnmount(() => { generation++; clearTimeout(timer) })
function open(row) {
  if (props.kind === 'live') { feeds.value[slot.value] = row; return }
  tool.value = ''
  recordingUrl.value = ''
  selected.value = row
  editing.value = false
  sheetError.value = ''
  sheet.value = true
}
async function discover() {
  open(null)
  tool.value = 'discovery'
  found.value = []
  working.value = true
  try { found.value = (await wvp('/onvif/device/WSDiscovery', { timeout: 60000 })).data || [] } catch (e) { sheetError.value = e.message } finally { working.value = false }
}
function prepareOnvif(item) {
  const ip = item.hostName || item.ip
  editing.value = true
  tool.value = 'register'
  form.value = { ip, name: item.ip || ip, userName: '', password: '' }
}
async function registerOnvif() {
  const account = form.value
  const verified = (await wvp('/onvif/device/addOnvif', { method: 'post', timeout: 60000, data: {
    ip: account.ip, username: account.userName, password: account.password, auth: '1'
  }})).data
  const streams = typeof verified?.streamUris === 'string' ? JSON.parse(verified.streamUris) : verified?.streamUris
  const channel = Object.keys(streams || {}).find(key => /^rtsps?:\/\//i.test(streams[key]))
  if (!channel) throw new Error(t('认证失败，设备未返回可用通道'))
  await wvp('/onvif/device', { method: 'post', data: { ...account, firm: verified.firm, model: verified.model,
    firmwareVersion: verified.firmwareVersion, auth: '1', playType: '1', streamUris: streams, channel, url: streams[channel] }})
}
async function edit(row) {
  if (working.value) return
  open(row)
  working.value = true
  try {
    const data = row && def.value.detail ? (await wvp(def.value.detail + encodeURIComponent(row.id))).data : row
    form.value = data ? { ...data } : { firm: '1', playType: '1', channel: '1', deviceType: '摄像头', status: 'UNKNOWN' }
    editing.value = true
  } catch (e) { sheetError.value = e.message } finally { working.value = false }
}
async function save() {
  if (working.value) return
  if (required.value.some(key => !String(form.value[key] || '').trim())) { sheetError.value = t('请填写必填项'); return }
  working.value = true
  try {
    const row = selected.value
    const path = !row ? def.value.add : def.value.editRow ? def.value.editRow + encodeURIComponent(row.id) : def.value.edit
    const data = def.value.editRow ? { name: form.value.name, remark: form.value.remark } : form.value
    if (tool.value === 'register') await registerOnvif()
    else await wvp(path, { method: row ? (def.value.editMethod || 'put') : 'post', data })
    sheet.value = false
    await load()
  } catch (e) { sheetError.value = e.message } finally { working.value = false }
}
async function remove() {
  if (working.value) return
  const row = selected.value
  try { await showConfirmDialog({ title: t('确认删除'), message: title(row) }) } catch { return }
  working.value = true
  try {
    await wvp(def.value.remove + encodeURIComponent(row.id), { method: 'delete' })
    sheet.value = false
    if (page.value > 1 && rows.value.length === 1) page.value--
    else await load()
  } catch (e) { sheetError.value = e.message } finally { working.value = false }
}
async function playRecord() {
  if (working.value) return
  working.value = true
  try {
    const { data } = await wvp('/api/cloud/record/play/path', { params: { recordId: selected.value.id }})
    const url = new URL((location.protocol === 'https:' ? data.httpsPath : data.httpPath) || data.httpsPath)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error(t('录像地址无效'))
    recordingUrl.value = url.href
  } catch (e) { sheetError.value = e.message } finally { working.value = false }
}
async function syncChannels() {
  if (working.value) return
  working.value = true
  try { await wvp('/api/device/query/devices/' + encodeURIComponent(selected.value.deviceId) + '/sync', { method: 'post' }); showSuccessToast(t('已提交同步')) } catch (e) { sheetError.value = e.message } finally { working.value = false }
}
</script>

<style scoped>
.monitor { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.monitor button { min-height:44px; border:0; background:var(--van-background); color:inherit; }
.monitor button[aria-pressed=true] { color:var(--van-primary-color); }
header,.entry { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.directory header { min-height:48px; }
small { color:var(--vl-text-2); font-size:12px; font-weight:400; }
.entry { width:100%; text-align:left; padding:14px 0; min-height:60px; background:transparent; color:inherit; border:0; border-bottom:1px solid var(--van-border-color); font:inherit; }
.entry span { display:grid; gap:5px; overflow-wrap:anywhere; }
.entry .van-icon { color:var(--vl-text-2); }
.detail { padding:12px 16px 20px; max-height:76vh; overflow:auto; }
.detail h3 { overflow-wrap:anywhere; }
.detail p { color:var(--van-danger-color); }
.detail form .van-button { margin-top:16px; }
</style>
