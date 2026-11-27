<template>
  <section class="claim">
    <header>
      <h3>{{ $t('扫码添加设备') }}</h3><button :disabled="saving" @click="$emit('close')">
        {{ $t('关闭') }}
      </button>
    </header>
    <template v-if="!payload">
      <p>{{ $t('请扫描设备机身上的 VLStream 认领码。') }}</p>
      <video ref="video" autoplay muted playsinline :hidden="!scanning" />
      <van-button v-if="!scanning" block type="primary" :loading="starting" @click="start">
        {{ $t('打开摄像头') }}
      </van-button>
      <label class="photo">{{ $t('拍照或从相册识别') }}<input type="file" accept="image/*" @change="readPhoto" /></label>
    </template>
    <template v-else>
      <small>{{ $t('设备 ID') }}</small><strong>{{ payload.deviceId }}</strong>
      <p>{{ $t('确认后，这台设备将归入当前登录租户。') }}</p>
      <van-button block type="primary" :loading="saving" @click="claim">
        {{ $t('确认添加') }}
      </van-button>
      <button :disabled="saving" @click="reset">
        {{ $t('重新扫码') }}
      </button>
    </template>
    <p v-if="error" role="alert">
      {{ error }}
    </p>
  </section>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import { claimWvpDevice } from '@/api/VLStreamCloud/wvp'
const { t } = useI18n()
const emit = defineEmits(['close', 'saved'])
const video = ref(null)
const payload = ref(null)
const error = ref('')
const scanning = ref(false)
const starting = ref(false)
const saving = ref(false)
const canvas = document.createElement('canvas')
let session = 0
let stream
let timer
let decoder
function stop() {
  session++
  clearTimeout(timer)
  stream?.getTracks().forEach(track => track.stop())
  stream = null
  if (video.value) video.value.srcObject = null
  scanning.value = false
  starting.value = false
}
function reset() {
  stop()
  error.value = ''
  payload.value = null
}
function decode(source, width, height) {
  const scale = Math.min(1, 1280 / Math.max(width, height))
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
  return decoder(pixels.data, pixels.width, pixels.height)?.data
}
function accept(raw) {
  let value
  try { value = JSON.parse(raw) } catch { /* non-device QR */ }
  if ((!value || (value.type != null && value.type !== 'vlstream-claim-v1')) || typeof value.deviceId !== 'string' ||
      !/^[A-Za-z0-9_-]{1,100}$/.test(value.deviceId) || typeof value.claimProof !== 'string' ||
      !/^[A-Za-z0-9_-]{43}$/.test(value.claimProof)) throw new Error(t('请扫描 VLStream 设备认领码'))
  stop()
  error.value = ''
  payload.value = { type: 'vlstream-claim-v1', deviceId: value.deviceId, claimProof: value.claimProof }
}
async function start() {
  reset()
  const ticket = session
  starting.value = true
  try {
    decoder = (await import('jsqr')).default
    if (ticket !== session) return
    if (!navigator.mediaDevices?.getUserMedia) throw new Error()
    const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }}, audio: false })
    if (ticket !== session) { media.getTracks().forEach(track => track.stop()); return }
    stream = media
    scanning.value = true
    starting.value = false
    await nextTick()
    if (!video.value || ticket !== session) return
    video.value.srcObject = media
    await video.value.play()
    const tick = () => {
      if (ticket !== session) return
      try {
        const frame = video.value
        const raw = frame?.readyState >= 2 && decode(frame, frame.videoWidth, frame.videoHeight)
        if (raw) { accept(raw); return }
      } catch (failure) { error.value = failure.message }
      timer = setTimeout(tick, 220)
    }
    tick()
  } catch {
    if (ticket === session) { stop(); error.value = t('摄像头不可用，请允许访问或选择二维码照片。') }
  }
}
async function readPhoto(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  reset()
  const ticket = session
  const url = URL.createObjectURL(file)
  try {
    decoder = (await import('jsqr')).default
    const image = new Image()
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url })
    if (ticket !== session) return
    const raw = decode(image, image.naturalWidth, image.naturalHeight)
    if (!raw) throw new Error(t('未识别到二维码，请重拍清晰、完整的设备标签。'))
    accept(raw)
  } catch (failure) {
    if (ticket === session) error.value = failure.message || t('无法读取照片')
  } finally { URL.revokeObjectURL(url) }
}
async function claim() {
  if (saving.value || !payload.value) return
  saving.value = true
  error.value = ''
  try {
    const result = await claimWvpDevice(payload.value)
    if (result?.code !== 200) throw new Error(result?.msg || t('添加设备失败'))
    showToast(t('设备已添加'))
    emit('saved')
  } catch (failure) {
    error.value = failure.response?.data?.msg || failure.message || t('添加设备失败')
  } finally { saving.value = false }
}
onBeforeUnmount(reset)
</script>

<style scoped>
.claim { padding:18px 18px calc(16px + env(safe-area-inset-bottom)); color:var(--vl-text-1); }
header { display:flex; align-items:center; justify-content:space-between; }
h3 { margin:0; }
button, .photo { min-height:44px; }
header button, .claim > button:not(.van-button) { background:none; border:0; font:inherit; }
video { width:100%; max-height:42vh; object-fit:contain; background:black; }
small, strong { display:block; margin-top:12px; overflow-wrap:anywhere; }
.photo { position:relative; display:grid; place-items:center; cursor:pointer; }
.photo:focus-within { outline:2px solid var(--van-primary-color); }
.photo input { position:absolute; inset:0; width:100%; opacity:0; cursor:pointer; }
[role=alert] { color:#9d3518; }
</style>
