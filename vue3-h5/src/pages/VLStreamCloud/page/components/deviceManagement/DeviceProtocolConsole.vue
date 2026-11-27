<template>
  <section class="device-console">
    <van-loading v-if="pending" />
    <van-empty v-else-if="error || !available.length" :description="error || $t('当前账号没有设备管理权限')">
      <van-button v-if="error" @click="authorize">
        {{ $t('重试') }}
      </van-button>
    </van-empty>
    <template v-else>
      <nav>
        <button class="protocol" @click="picker = 'protocol'">
          {{ $t(active[1]) }} <van-icon name="arrow-down" />
        </button>
        <button v-if="active[0] === 'gb'" @click="picker = 'page'">
          {{ $t(leaf[1]) }} <van-icon name="arrow-down" />
        </button>
      </nav>
      <van-search v-model="keyword" shape="round" :placeholder="$t('搜索名称或设备标识')" clearable />
      <DeviceManage v-if="kind === 'vls'" :keyword="keyword" />
      <ProtocolDirectory v-else :key="kind" :kind="kind" :keyword="keyword" />
      <van-action-sheet v-model:show="showPicker" :duration="0" :title="$t(picker === 'page' ? '国标功能' : '选择协议')" :actions="choices" :cancel-text="$t('取消')" @select="choose" />
    </template>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import DeviceManage from './DeviceManage.vue'
import ProtocolDirectory from './ProtocolDirectory.vue'
import { protocols, gbPages, menuAllowed } from '@/api/VLStreamCloud/deviceCatalog'
import { managementRequest } from '@/api/VLStreamCloud/protocolManagement'
import { useUserStore } from '@/store/modules/useraPaas'

const { t } = useI18n()
const user = useUserStore()
const permissions = ref([])
const selected = ref('')
const subpage = ref('')
const picker = ref('')
const keyword = ref('')
const error = ref('')
const pending = ref(true)
const leaves = computed(() => gbPages.filter(p => menuAllowed('gbmanger/' + p[2], permissions.value)))
const available = computed(() => protocols.filter(p => p[0] === 'gb' ? leaves.value.length : menuAllowed(p[2], permissions.value)))
const active = computed(() => available.value.find(p => p[0] === selected.value) || available.value[0])
const leaf = computed(() => leaves.value.find(p => p[0] === subpage.value) || leaves.value[0])
const kind = computed(() => active.value?.[0] === 'gb' ? leaf.value?.[0] : active.value?.[0])
const showPicker = computed({ get: () => !!picker.value, set: open => { if (!open) picker.value = '' } })
const choices = computed(() => (picker.value === 'page' ? leaves.value : available.value).map(p => ({ name: t(p[1]), key: p[0], color: p[0] === (picker.value === 'page' ? leaf.value?.[0] : active.value?.[0]) ? 'var(--van-primary-color)' : undefined })))
function choose(item) {
  if (picker.value === 'page') subpage.value = item.key
  else selected.value = item.key
  keyword.value = ''
  picker.value = ''
}
let version = 0
async function authorize() {
  const current = ++version
  permissions.value = []
  pending.value = true
  error.value = ''
  picker.value = ''
  try {
    const data = await managementRequest('/blade-system/user/info')
    if (current === version) permissions.value = data?.permissions || []
  } catch (e) {
    if (current === version) error.value = e.message || t('设备管理加载失败')
  } finally {
    if (current === version) pending.value = false
  }
}
watch(() => [user.token, user.tenantId], authorize, { immediate: true })
</script>

<style scoped>
.device-console { box-sizing:border-box; height:100%; overflow:auto; overscroll-behavior:contain; padding:0 16px 20px; color:var(--vl-text-1); font-size:14px; }
nav { display:flex; align-items:center; gap:12px; }
nav button { min-height:44px; padding:0; border:0; background:none; color:inherit; font:inherit; }
.protocol { font-size:18px; font-weight:650; }
nav .van-icon { margin-left:4px; font-size:12px; }
.van-search { padding:4px 0 12px; }
</style>
