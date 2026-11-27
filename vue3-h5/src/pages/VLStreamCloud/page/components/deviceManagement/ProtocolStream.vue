<template>
  <div class="stream">
    <video ref="video" playsinline muted autoplay controls @playing="loading = false" />
    <p v-if="error || loading" role="status">
      {{ error || $t('正在连接视频') }}
    </p>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { wvp } from '@/api/VLStreamCloud/deviceCatalog'
import { resolveZlmPlaybackUrl, addZlmLanCandidate } from '@/utils/zlmPlaybackUrl'

const props = defineProps({ kind: String, row: Object })
const video = ref(null)
const loading = ref(true)
const error = ref('')
let closed = false
let lease = ''
let heartbeat
let timeout
let pc
const controller = new AbortController()
async function close() {
  closed = true
  controller.abort()
  clearInterval(heartbeat)
  clearTimeout(timeout)
  pc?.close()
  if (video.value) video.value.srcObject = null
  const path = lease
  lease = ''
  if (path) await wvp(path, { method: 'delete' }).catch(() => {})
}
function fail(message) {
  if (closed) return
  error.value = message
  loading.value = false
  close()
}
async function connect() {
  const row = props.row
  const base = { rtsp: '/rtsp/RtspDevice', onvif: '/onvif/device', custom: '/custom/device' }[props.kind]
  let result
  if (base) {
    const path = base + '/' + encodeURIComponent(row.id) + '/preview'
    result = (await wvp(path, { method: 'post', params: props.kind === 'custom' ? { lease: true } : undefined, timeout: 35000 })).data
    if (result?.sessionId) {
      lease = path + '/' + encodeURIComponent(result.sessionId)
      if (closed) { await close(); return }
      heartbeat = setInterval(() => wvp(lease, { method: 'put' }).catch(() => fail('视频会话已断开')), 25000)
    }
  } else {
    const type = props.kind === 'push' ? 2 : props.kind === 'proxy' ? 3 : Number(row.dataType)
    if (type === 1 && row.gbParentId && row.gbDeviceId) {
      result = (await wvp('/api/play/start/' + encodeURIComponent(row.gbParentId) + '/' + encodeURIComponent(row.gbDeviceId))).data
    } else if ([2, 3].includes(type)) {
      result = (await wvp(type === 2 ? '/api/push/start' : '/api/proxy/start', { params: { id: row.dataDeviceId ?? row.id }})).data
    } else throw new Error('此通道没有可用视频源')
  }
  if (closed) return
  if (result?.playMode === 'DIRECT' && /^https?:\/\//i.test(result.url)) {
    video.value.src = result.url
    video.value.onerror = () => fail('当前设备无法播放此视频格式')
    return
  }
  const info = result?.streamInfo || result
  const address = location.protocol === 'https:' ? info?.rtcs : info?.rtc || info?.rtcs
  if (!address) throw new Error('设备未返回可用播放地址')
  const endpoint = resolveZlmPlaybackUrl(address)
  pc = new RTCPeerConnection()
  pc.ontrack = event => { if (video.value) video.value.srcObject = event.streams[0] || new MediaStream([event.track]) }
  pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') fail('视频连接失败') }
  pc.addTransceiver('video', { direction: 'recvonly' })
  pc.addTransceiver('audio', { direction: 'recvonly' })
  const offer = await pc.createOffer()
  await pc.setLocalDescription(offer)
  const response = await fetch(endpoint, { method: 'POST', credentials: 'omit', body: offer.sdp, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: controller.signal })
  const answer = await response.json()
  if (!response.ok || answer.code !== 0 || !answer.sdp) throw new Error('媒体协商失败')
  await pc.setRemoteDescription({ type: 'answer', sdp: addZlmLanCandidate(answer.sdp, undefined, endpoint) })
  timeout = setTimeout(() => { if (loading.value) fail('视频连接超时') }, 20000)
}
onMounted(() => connect().catch(e => fail(e.message || '播放失败')))
onBeforeUnmount(close)
</script>

<style scoped>
.stream { position:relative; background:#181a1d; border-radius:8px; overflow:hidden; }
video { display:block; width:100%; aspect-ratio:16/9; }
p { position:absolute; top:25%; left:0; right:0; text-align:center; font-size:13px; color:white; pointer-events:none; }
</style>
