<template>
  <div class="my-page">
    <div class="my-header">
      <div class="top-title">
        {{ $t('我的') }}
      </div>
    </div>

    <div class="my-content">
      <!-- 用户信息卡片 -->
      <div class="profile-card" @click="onProfileClick">
        <div class="avatar" @click.stop="onAvatarClick">
          <img v-if="avatarSrc" :src="avatarSrc" class="avatar-img" alt="" />
          <div v-else class="avatar-img avatar-generated" :style="{ background: avatarColor }">
            {{ avatarLetter }}
          </div>
        </div>
        <div class="profile-info">
          <div class="name-row">
            <span class="name">{{ displayName }}</span>
            <span class="phone">{{ displayPhone }}</span>
          </div>
          <div v-if="displayDept" class="dept">
            {{ displayDept }}
          </div>
        </div>
        <LineIcon v-if="!isLocalAuth" name="chevron" :size="18" class="menu-arrow" />
      </div>

      <!-- 菜单列表 -->
      <div class="menu-list">
        <div
          v-for="item in menuItems"
          :key="item.key"
          class="menu-item"
          @click="onMenuClick(item)"
        >
          <div class="menu-left">
            <div class="menu-icon-wrapper">
              <LineIcon :name="item.icon" :size="20" />
            </div>
            <span class="menu-title">{{ item.title }}</span>
          </div>
          <LineIcon name="chevron" :size="18" class="menu-arrow" />
        </div>
      </div>
    </div>

    <!-- 设置菜单 -->
    <van-action-sheet
      v-model:show="showSettings"
      :actions="settingsActions"
      :cancel-text="$t('取消')"
      @select="onSettingsSelect"
    />

    <!-- 语言设置 -->
    <van-action-sheet
      v-model:show="showLanguage"
      :actions="languageActions"
      :cancel-text="$t('取消')"
      @select="onLanguageSelect"
    />

    <!-- 头像操作 -->
    <van-action-sheet
      v-model:show="showAvatarActions"
      :actions="avatarActions"
      :cancel-text="$t('取消')"
      @select="onAvatarSelect"
    />

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="avatar-input"
      @change="onFileChange"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/useraPaas'
import { getAppLocale, setAppLocale } from '@/lang/index'
import config from '@/config'
import LineIcon from '@/pages/VLStreamCloud/page/components/LineIcon.vue'
import { getUserInfo } from '@/api/login/indexapaas'

const { t } = useI18n()

// 用户信息
const store = useUserStore()
const router = useRouter()
// 单租户集群没有 apaas-sso 的个人信息接口，资料编辑、密码、我的设备只在多租户提供
const isLocalAuth = config.authMode === 'local'
const displayName = computed(() => store.userInfo?.userName || store.userInfo?.user_name || '--')
// 手机号中间四位打码展示
const displayPhone = computed(() => {
  const phone = String(store.userInfo?.phone || '')
  if (!phone) return '--'
  return /^\d{7,}$/.test(phone) ? phone.slice(0, 3) + '****' + phone.slice(-4) : phone
})
const displayDept = computed(() => store.userInfo?.deptName || '')

// 登录接口只返回名字，手机号、部门、头像从平台资料补齐（脱敏手机号用于展示）
const refreshProfile = async() => {
  if (isLocalAuth || !store.token) return
  try {
    const res = await getUserInfo({ accessToken: store.token })
    const data = res && res.code === 200 ? res.data : null
    if (!data) return
    const ex = data.user_detail?.ex_data || {}
    const deptName = (data.dept_list || []).map(x => x.deptinfo?.dept_name || x.dept_name).filter(Boolean).join(' / ')
    store.setUserInfo({
      userName: data.user_name || store.userInfo?.userName,
      phone: ex.phone || data.phone || '',
      deptName,
      photo: data.photo || ''
    })
  } catch (e) {
    // 拉取失败保留登录时的信息
  }
}
refreshProfile()

// 菜单配置
const menuItems = computed(() => [
  ...(isLocalAuth ? [] : [
    { key: 'devices', title: t('我的设备'), icon: 'device' },
    { key: 'password', title: t('登录密码'), icon: 'lock' }
  ]),
  { key: 'help', title: t('帮助'), icon: 'help' },
  { key: 'about', title: t('关于我们'), icon: 'info' },
  { key: 'settings', title: t('设置'), icon: 'settings' }
])

// ========= 头像 =========
// 多租户：用平台资料里的头像（在“个人信息”里上传更换）；单租户：默认由用户名生成，支持本地更换
// 黑白主题：头像统一用深浅不同的中性色
const AVATAR_COLORS = ['#ff6a00', '#f2780c', '#e8590c', '#ff8a33']
const avatarStorageKey = computed(() => `vlstream_avatar_${store.userInfo?.userName || 'default'}`)
const customAvatar = ref(localStorage.getItem(avatarStorageKey.value) || '')
const avatarSrc = computed(() => (isLocalAuth ? customAvatar.value : (store.userInfo?.photo || '')))
const avatarLetter = computed(() => {
  const name = (store.userInfo?.userName || store.userInfo?.user_name || '').trim()
  return name ? name.charAt(0).toUpperCase() : 'U'
})
const avatarColor = computed(() => {
  const name = store.userInfo?.userName || ''
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
})

const showAvatarActions = ref(false)
const fileInputRef = ref(null)
const avatarActions = computed(() => (customAvatar.value
  ? [{ name: t('更换头像'), key: 'change' }, { name: t('恢复默认'), key: 'reset' }]
  : [{ name: t('更换头像'), key: 'change' }]))

const onProfileClick = () => {
  if (!isLocalAuth) router.push('/profileEdit')
}

const onAvatarClick = () => {
  if (!isLocalAuth) {
    router.push('/profileEdit')
    return
  }
  showAvatarActions.value = true
}

const onAvatarSelect = (action) => {
  showAvatarActions.value = false
  if (action.key === 'reset') {
    localStorage.removeItem(avatarStorageKey.value)
    customAvatar.value = ''
    return
  }
  if (fileInputRef.value) fileInputRef.value.click()
}

// 压缩到 256px 再存 dataURL，避免 localStorage 超限
const onFileChange = (event) => {
  const file = event.target.files && event.target.files[0]
  event.target.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const size = 256
      const scale = Math.min(size / img.width, size / img.height, 1)
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        localStorage.setItem(avatarStorageKey.value, dataUrl)
        customAvatar.value = dataUrl
        showToast(t('头像已更新'))
      } catch (e) {
        showToast(t('头像保存失败'))
      }
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
}

// ========= 设置菜单 =========
const showSettings = ref(false)
// 注销客服电话：与隐私政策「个人信息保护投诉渠道」登记号码一致
const servicePhone = '13723775143'
const settingsActions = computed(() => [
  { name: t('语言设置'), key: 'language' },
  { name: '注销账号', color: '#ee0a24', key: 'deleteAccount' },
  { name: t('退出登录'), key: 'logout' }
])

const onMenuClick = (item) => {
  if (item.key === 'devices') {
    router.push('/myDevices')
    return
  }
  if (item.key === 'password') {
    router.push('/passwordEdit')
    return
  }
  if (item.key === 'help') {
    router.push('/contactUS')
    return
  }
  if (item.key === 'about') {
    router.push('/aboutAppPage')
    return
  }
  if (item.key === 'settings') {
    showSettings.value = true
  }
}

const onSettingsSelect = async(action) => {
  showSettings.value = false
  // 注销账号：电话联系客服办理（App 内不直接删除，符合隐私政策声明）
  if (action.key === 'deleteAccount') {
    try {
      await showConfirmDialog({
        title: '注销账号',
        message: `注销账号请联系客服办理，将删除账号及关联个人信息。\n客服电话：${servicePhone}\n（工作日 9:00-18:00）`,
        confirmButtonText: '拨打客服电话',
        cancelButtonText: '取消'
      })
    } catch (e) {
      return
    }
    window.location.href = `tel:${servicePhone}`
    return
  }

  if (action.key === 'language') {
    showLanguage.value = true
    return
  }

  if (action.key === 'logout') {
    try {
      await showConfirmDialog({ title: t('提示'), message: t('确认退出登录？') })
    } catch (e) {
      return
    }

    // 单租户集群没有 apaas-sso，服务端 logout 接口不存在，只清本地登录态
    if (config.authMode !== 'local') {
      try {
        await store.loginOut(store.getStoreToken())
      } catch (e) {
        // 服务端退出失败也要清掉本地，避免停在登录态
      }
    }
    store.removeStoreToken()
    location.reload()
  }
}

// ========= 语言设置 =========
const showLanguage = ref(false)
// 语言名用各自母语显示，不随语言切换翻译
const languageActions = [
  { name: '中文', key: 'cn' },
  { name: 'English', key: 'en' }
]

const onLanguageSelect = (action) => {
  showLanguage.value = false
  if (action.key === getAppLocale()) return
  setAppLocale(action.key)
  showToast(t('操作成功'))
}
</script>

<style lang="scss" scoped>
.my-page {
  min-height: 100vh;
  background: var(--vl-bg);
  position: relative;
  padding: 0 20px 24px;
}

.my-header {
  position: relative;
  z-index: 1;
  padding-top: calc(12px + var(--vl-safe-top, 0px));
}

.top-title {
  font-size: 28px;
  line-height: 36px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: var(--vl-ink);
}

.my-content {
  position: relative;
  z-index: 1;
  margin-top: 18px;
}

.profile-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: var(--vl-surface);
  border-radius: var(--vl-radius-lg);
}

.avatar {
  margin-right: 16px;
}

.avatar-img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-generated {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
}

.avatar-input {
  display: none;
}

.profile-info {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
}

.name {
  color: var(--vl-ink);
  font-size: 18px;
  font-weight: 700;
}

.phone {
  color: var(--vl-text-2);
  font-size: 14px;
  font-family: var(--vl-font-mono);
}

.dept {
  color: var(--vl-text-2);
  font-size: 13px;
}

.menu-list {
  margin-top: 16px;
  border: 1px solid var(--vl-line);
  border-radius: var(--vl-radius-lg);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #ffffff;

  & + .menu-item {
    border-top: 1px solid var(--vl-line);
  }

  &:active {
    background: var(--vl-surface);
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-icon-wrapper {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--vl-surface);
  color: var(--vl-ink);
}

.menu-title {
  color: var(--vl-ink);
  font-size: 15px;
  font-weight: 500;
}

.menu-arrow {
  color: var(--vl-text-3);
}
</style>
