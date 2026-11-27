<template>
  <div>
    <div v-show="points.length" ref="canvas" class="map" :aria-label="$t('设备地图')" />
    <van-empty v-if="!points.length" :description="$t('本页设备尚未上报位置')" />
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
const props = defineProps({ rows: { type: Array, required: true }})
const emit = defineEmits(['select'])
const canvas = ref(null)
const points = computed(() => props.rows.filter(row => Number.isFinite(row.latitude) && Math.abs(row.latitude) <= 90 &&
  Number.isFinite(row.longitude) && Math.abs(row.longitude) <= 180))
let map
let markers
async function draw() {
  await nextTick()
  if (!map || !points.value.length) return
  markers.clearLayers()
  for (const row of points.value) {
    const label = document.createElement('span')
    label.textContent = row.deviceName || row.deviceId
    const location = [row.latitude, row.longitude]
    L.circleMarker(location, { radius: 10, color: row.online ? '#22744e' : '#777', fillOpacity: 0.8 })
      .bindTooltip(label).on('click', () => emit('select', row)).addTo(markers)
  }
  map.invalidateSize()
  map.fitBounds(markers.getBounds(), { padding: [18, 18], maxZoom: 16 })
}
onMounted(() => {
  map = L.map(canvas.value)
  L.tileLayer(import.meta.env.VITE_OSM_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)
  markers = L.featureGroup().addTo(map)
  draw()
})
watch(points, draw)
onBeforeUnmount(() => { map?.remove(); map = null })
</script>

<style scoped>
.map { height: min(52vh, 440px); width:100%; z-index:0; }
</style>
