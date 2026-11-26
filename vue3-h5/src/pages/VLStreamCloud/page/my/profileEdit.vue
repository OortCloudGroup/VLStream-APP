<!--
  我的 → 个人信息：修改头像、名字，并进入登录密码设置。
  接口与 apaas-web 个人中心一致：sso/v1/getUserInfo 取原始（不脱敏）信息，
  sso/v1/userEdit 保存。userEdit 会整体覆盖 ex_data，所以手机号、邮箱等原值必须原样带回。
-->
<template>
  <div class="page_container profile_page">
    <nav-header-banner :title="$t('个人信息')" />
    <div class="profile_body">
      <div class="avatar_block" @click="pickAvatar">
        <div class="avatar_wrap">
          <img v-if="form.photo" :src="form.photo" class="avatar_img" alt="" />
          <div v-else class="avatar_img avatar_letter">
            {{ avatarLetter }}
          </div>
          <div class="avatar_badge">
            <van-loading v-if="uploading" size="14" color="#fff" />
            <van-icon v-else name="photograph" />
          </div>
        </div>
        <span class="avatar_tip">{{ $t('点击更换头像') }}</span>
      </div>

      <div class="group">
        <van-field
          v-model="form.userName"
          :label="$t('名字')"
          :placeholder="$t('请输入名字')"
          maxlength="30"
          input-align="right"
          clearable
        />
        <van-cell :title="$t('手机号')" :value="maskedPhone || $t('未绑定')" />
        <van-cell :title="$t('邮箱')" :value="maskedEmail || $t('未绑定')" />
      </div>

      <div class="group">
        <van-cell
          :title="$t('登录密码')"
          :value="pwdStatusText"
          is-link
          @click="goPassword"
        />
      </div>

      <van-button
        class="save_btn"
        block
        round
        :loading="saving"
        :disabled="!loaded || !dirty"
        @click="save"
      >
        {{ $t('保存') }}
      </van-button>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="file_input"
      @change="onFileChange"
    />
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showLoadingToast, closeToast } from 'vant'
import NavHeaderBanner from '@/components/navHeaderBanner/index'
import { useUserStore } from '@/store/modules/useraPaas'
import { getUserInfo, userEdit } from '@/api/login/indexapaas'
import { uploadFile } from '@/api/fastdfs'

const { t } = useI18n()
const router = useRouter()
const store = useUserStore()

const raw = ref(null)
const loaded = ref(false)
const saving = ref(false)
const uploading = ref(false)
const fileInputRef = ref(null)
const form = reactive({ userName: '', photo: '' })
const origin = reactive({ userName: '', photo: '' })

const exData = computed(() => raw.value?.user_detail?.ex_data || {})
const mask = (value, isEmail) => {
  if (!value) return ''
  if (isEmail) {
    const [name, domain] = String(value).split('@')
    if (!domain) return value
    return (name.length <= 2 ? name.charAt(0) + '*' : name.slice(0, 2) + '***') + '@' + domain
  }
  const s = String(value)
  return s.length >= 7 ? s.slice(0, 3) + '****' + s.slice(-4) : s
}
const maskedPhone = computed(() => mask(exData.value.phone, false))
const maskedEmail = computed(() => mask(exData.value.email, true))

/** 登录密码（identity_type 0）的认证状态：1 已设置 */
const hasPassword = computed(() => {
  const list = raw.value?.user_ident_info?.user_ident || []
  const item = list.find(i => i.identity_type === 0)
  return !!item && item.status === 1
})
const pwdStatusText = computed(() => {
  if (!loaded.value) return ''
  return hasPassword.value ? t('修改') : t('未设置')
})

const avatarLetter = computed(() => {
  const name = (form.userName || '').trim()
  return name ? name.charAt(0).toUpperCase() : 'U'
})

const dirty = computed(() => form.userName.trim() !== origin.userName || form.photo !== origin.photo)

const load = async() => {
  const res = await getUserInfo({ accessToken: store.token, desensitize: false })
  if (res && res.code === 200 && res.data) {
    raw.value = res.data
    form.userName = origin.userName = res.data.user_name || ''
    form.photo = origin.photo = res.data.photo || ''
    loaded.value = true
  }
}
load()

const pickAvatar = () => {
  if (uploading.value) return
  if (fileInputRef.value) fileInputRef.value.click()
}

/** 头像压缩到 512px 以内的 JPEG 再上传，避免手机原图过大 */
const compressImage = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = reject
  reader.onload = () => {
    const img = new Image()
    img.onerror = reject
    img.onload = () => {
      const max = 512
      const scale = Math.min(max / img.width, max / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('toBlob'))), 'image/jpeg', 0.9)
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
})

const onFileChange = async(event) => {
  const file = event.target.files && event.target.files[0]
  event.target.value = ''
  if (!file) return
  uploading.value = true
  try {
    const blob = await compressImage(file)
    const fd = new FormData()
    fd.append('file', blob, 'avatar.jpg')
    const res = await uploadFile(fd)
    if (res && res.code === 200 && res.data?.url) {
      form.photo = res.data.url
    } else {
      showToast(t('头像上传失败'))
    }
  } catch (e) {
    showToast(t('头像上传失败'))
  } finally {
    uploading.value = false
  }
}

const save = async() => {
  const userName = form.userName.trim()
  if (!userName) {
    showToast(t('请输入名字'))
    return
  }
  const data = raw.value || {}
  const params = {
    accessToken: store.token,
    user_id: data.user_id || store.userInfo?.userId,
    dept_id: data.dept_list?.[0]?.dept_id,
    // 整体覆盖：原值原样带回
    ex_data: { ...(data.user_detail?.ex_data || {}) },
    photo: form.photo,
    user_name: userName
  }
  if (Array.isArray(data.custom_field)) params.custom_field = data.custom_field
  saving.value = true
  showLoadingToast({ message: t('保存中...'), forbidClick: true, duration: 0 })
  try {
    const res = await userEdit(params)
    closeToast()
    if (res && res.code === 200) {
      origin.userName = form.userName = userName
      origin.photo = form.photo
      store.setUserInfo({ userName, user_name: userName, photo: form.photo })
      showToast(t('保存成功'))
    }
  } catch (e) {
    closeToast()
  } finally {
    saving.value = false
  }
}

const goPassword = () => {
  if (!loaded.value) return
  router.push({ path: '/passwordEdit', query: { init: hasPassword.value ? '0' : '1' }})
}
</script>

<style lang="scss" scoped>
.profile_page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vl-bg);
}

.profile_body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 16px calc(24px + env(safe-area-inset-bottom));
}

.avatar_block {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 0 24px;
}

.avatar_wrap {
  position: relative;
}

.avatar_img {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  background: var(--vl-surface);
}

.avatar_letter {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30px;
  font-weight: 600;
  background: var(--vl-accent);
}

.avatar_badge {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: var(--vl-ink);
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar_tip {
  margin-top: 10px;
  font-size: 12px;
  color: var(--vl-text-3);
}

.group {
  margin-bottom: 12px;
  background: var(--vl-surface);
  border-radius: var(--vl-radius);
  overflow: hidden;

  :deep(.van-cell) {
    padding: 15px 16px;
    font-size: 15px;
    background: transparent;

    &::after {
      left: 16px;
      right: 16px;
      border-color: var(--vl-line);
    }
  }

  :deep(.van-cell__title),
  :deep(.van-field__label) {
    color: var(--vl-ink);
    font-weight: 500;
  }

  :deep(.van-cell__value) {
    color: var(--vl-text-2);
  }
}

.save_btn {
  margin-top: 24px;
  height: 46px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: var(--vl-ink);
  border-color: var(--vl-ink);
}

.file_input {
  display: none;
}
</style>
