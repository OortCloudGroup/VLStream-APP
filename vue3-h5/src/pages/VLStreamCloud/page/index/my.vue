<template>
  <div class="my-page">
    <!-- 顶部背景 -->
    <div class="top-bg" :style="{ backgroundImage: `url(${bgImg})` }" />

    <div class="my-header">
      <div class="top-title">
        {{ $t('我的') }}
      </div>
    </div>

    <div class="my-content">
      <!-- 用户信息卡片 -->
      <div class="profile-card">
        <div class="avatar" @click="onChangeAvatar">
          <img v-if="customAvatar" :src="customAvatar" class="avatar-img" alt="" />
          <div v-else class="avatar-img avatar-generated" :style="{ background: avatarColor }">
            {{ avatarLetter }}
          </div>
        </div>
        <div class="profile-info">
          <div class="name-row">
            <span class="name">{{ displayName }}</span>
            <span class="phone">{{ displayPhone }}</span>
          </div>
          <div class="dept">
            {{ displayDept }}
          </div>
        </div>
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
              <img :src="item.icon" alt="" class="menu-icon-img" />
            </div>
            <span class="menu-title">{{ item.title }}</span>
          </div>
          <img :src="arrowImg" alt="" class="menu-arrow-img" />
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
import bgImg from '@/assets/img/VLStreamCloud/bg.png'
import helpImg from '@/assets/img/VLStreamCloud/mine/bz.png'
import aboutImg from '@/assets/img/VLStreamCloud/mine/gywm.png'
import arrowImg from '@/assets/img/VLStreamCloud/mine/jt.png'
import settingImg from '@/assets/img/VLStreamCloud/mine/sz.png'

const { t } = useI18n()

// 用户信息
const store = useUserStore()
const router = useRouter()
const displayName = computed(() => store.userInfo?.userName || '--')
const displayPhone = computed(() => store.userInfo?.phone || '--')
const displayDept = computed(() => store.userInfo?.deptName || '--')

// 菜单配置
const menuItems = computed(() => [
  { key: 'help', title: t('帮助'), icon: helpImg },
  { key: 'about', title: t('关于我们'), icon: aboutImg },
  { key: 'settings', title: t('设置'), icon: settingImg }
])

// ========= 头像（默认由用户名生成，支持本地更换） =========
const AVATAR_COLORS = ['#2f69f8', '#00ba52', '#ff8d1e', '#e33645', '#7b61ff', '#00b8d4']
const avatarStorageKey = computed(() => `vlstream_avatar_${store.userInfo?.userName || 'default'}`)
const customAvatar = ref(localStorage.getItem(avatarStorageKey.value) || '')
const avatarLetter = computed(() => {
  const name = (store.userInfo?.userName || '').trim()
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

const onChangeAvatar = () => {
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
const settingsActions = computed(() => [
  { name: t('语言设置'), key: 'language' },
  { name: t('退出登录'), key: 'logout' }
])

const onMenuClick = (item) => {
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
  background: #F9FAFF;
  position: relative;
  padding: 0 16px 24px;
}

.top-bg {
  position: absolute;
  top: -15px;
  left: -20px;
  right: -20px;
  height: 200px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: 0;
}

.my-header {
  position: relative;
  z-index: 1;
  padding-top: 28px;
}

.top-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.my-content {
  position: relative;
  z-index: 1;
  margin-top: 18px;
}

.profile-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background:#f7f7f7;
  border-radius: 8px;
}

.avatar {
  margin-right: 16px;
}

.avatar-img {
  width: 50px;
  height: 50px;
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
  color: #333333;
  font-size: 16px;
}

.phone {
  color: #333333;
  font-size: 16px;
}

.dept {
  color: #666666;
  font-size: 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.menu-icon-wrapper {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.menu-icon-img {
  width: 34px;
  height: 34px;
  object-fit: contain;
}

.menu-title {
  color: #333333;
  font-size: 14px;
}

.menu-arrow-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>
