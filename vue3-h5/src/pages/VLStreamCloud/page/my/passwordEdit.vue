<!--
  我的 → 登录密码。与 apaas-web 个人中心 ModifyPasswordDialog 一致：
  - 未设置过密码（如验证码登录的新用户）：sso/v1/initPassword，同时设定登录账号
  - 已有密码：sso/v1/resetPassword，需验证旧密码
  明文用 sso/v1/getPublicKey 的公钥 RSA 加密；新密码先按租户策略 passwordPolicy/v1/validate 校验。
  设置后即可在登录页“密码登录”用 手机号 / 邮箱 / 登录账号 + 密码登录。
-->
<template>
  <div class="page_container password_page">
    <nav-header-banner :title="isInit ? $t('设置登录密码') : $t('修改登录密码')" />
    <div class="password_body">
      <div class="tip">
        {{ $t('设置后可在登录页使用 手机号 / 邮箱 / 登录账号 + 密码登录') }}
      </div>

      <div class="group">
        <van-field
          v-if="isInit"
          v-model="form.loginId"
          :label="$t('登录账号')"
          :placeholder="$t('4-40 位，可用于账号登录')"
          maxlength="40"
          clearable
        />
        <van-field
          v-else
          v-model="form.oldPwd"
          :label="$t('旧密码')"
          :type="showPwd ? 'text' : 'password'"
          :placeholder="$t('请输入旧密码')"
          autocomplete="current-password"
        />
        <van-field
          v-model="form.newPwd"
          :label="$t('新密码')"
          :type="showPwd ? 'text' : 'password'"
          :placeholder="$t('请输入新密码')"
          autocomplete="new-password"
          :right-icon="showPwd ? 'eye-o' : 'closed-eye'"
          @click-right-icon="showPwd = !showPwd"
        />
        <van-field
          v-model="form.confirmPwd"
          :label="$t('确认密码')"
          :type="showPwd ? 'text' : 'password'"
          :placeholder="$t('请再次输入新密码')"
          autocomplete="new-password"
        />
      </div>

      <ul v-if="ruleHints.length" class="rules">
        <li v-for="hint in ruleHints" :key="hint">
          {{ hint }}
        </li>
      </ul>

      <van-button
        class="save_btn"
        block
        round
        :loading="saving"
        @click="submit"
      >
        {{ $t('确定') }}
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import JSEncrypt from 'jsencrypt'
import NavHeaderBanner from '@/components/navHeaderBanner/index'
import { useUserStore } from '@/store/modules/useraPaas'
import {
  getUserInfo,
  getPublicKey,
  resetPassword,
  initPassword,
  getPasswordPolicy,
  validatePasswordPolicy
} from '@/api/login/indexapaas'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useUserStore()

const isInit = ref(route.query.init === '1')
const saving = ref(false)
const showPwd = ref(false)
const policy = ref(null)
const form = reactive({ loginId: '', oldPwd: '', newPwd: '', confirmPwd: '' })

const tenantId = () => store.tenantId || window.sessionStorage.getItem('tenantId') || ''

/** 进入时再确认一次是否已设置密码，并预填已有的登录账号 */
const loadUser = async() => {
  const res = await getUserInfo({ accessToken: store.token })
  if (!res || res.code !== 200 || !res.data) return
  const list = res.data.user_ident_info?.user_ident || []
  const pwd = list.find(i => i.identity_type === 0)
  isInit.value = !(pwd && pwd.status === 1)
  const loginInfo = res.data.unique_login_id || res.data.login_id || ''
  const loginId = typeof loginInfo === 'string' ? loginInfo : (loginInfo.login_id || '')
  if (loginId && !form.loginId) form.loginId = loginId
}

const loadPolicy = async() => {
  const id = tenantId()
  if (!id) return
  const res = await getPasswordPolicy({ tenant_id: id })
  if (res && res.code === 200 && res.data) policy.value = res.data
}

loadUser()
loadPolicy()

/** 策略提示：启用了复杂度要求时逐条列出，未启用时只提示长度 */
const ruleHints = computed(() => {
  const p = policy.value
  if (!p) return []
  if (Array.isArray(p.password_rules) && p.password_rules.length) return p.password_rules
  // 中文文案以原文作 key，缺省时不做插值，数字统一拼在冒号后
  const hints = [`${t('密码长度')}：${p.password_min_length || 6}-${p.password_max_length || 32}`]
  if (p.password_enabled) {
    if (p.password_min_number) hints.push(`${t('最少数字个数')}：${p.password_min_number}`)
    if (p.password_min_lower) hints.push(`${t('最少小写字母个数')}：${p.password_min_lower}`)
    if (p.password_min_upper) hints.push(`${t('最少大写字母个数')}：${p.password_min_upper}`)
    if (p.password_min_special) hints.push(`${t('最少特殊字符个数')}：${p.password_min_special}`)
  }
  return hints
})

const encryptWithServerKey = async(payload) => {
  const res = await getPublicKey({ accessToken: store.token })
  const key = res && res.code === 200 ? res.data?.publicKey : ''
  if (!key) throw new Error(t('获取加密公钥失败'))
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(key)
  const encrypted = encryptor.encrypt(JSON.stringify(payload))
  if (!encrypted) throw new Error(t('密码加密失败'))
  return encrypted
}

const checkPolicy = async(password) => {
  const id = tenantId()
  const p = policy.value
  if (p && (password.length < (p.password_min_length || 0) || password.length > (p.password_max_length || 64))) {
    return `${t('密码长度')}：${p.password_min_length}-${p.password_max_length}`
  }
  if (!id) return ''
  const res = await validatePasswordPolicy({ tenant_id: id, password })
  if (res && res.code === 200) {
    const { valid, errors } = res.data || {}
    if (valid === false || (Array.isArray(errors) && errors.length)) {
      return (errors || []).join('；') || t('密码不符合安全策略')
    }
  }
  return ''
}

const submit = async() => {
  if (saving.value) return
  const loginId = form.loginId.trim()
  if (isInit.value && ([...loginId].length < 4 || [...loginId].length > 40)) {
    showToast(t('登录账号需为 4-40 位'))
    return
  }
  if (!isInit.value && !form.oldPwd) {
    showToast(t('请输入旧密码'))
    return
  }
  if (!form.newPwd) {
    showToast(t('请输入新密码'))
    return
  }
  if (form.newPwd !== form.confirmPwd) {
    showToast(t('两次输入的密码不一致'))
    return
  }
  saving.value = true
  try {
    const policyError = await checkPolicy(form.newPwd)
    if (policyError) {
      showToast(policyError)
      return
    }
    const timestamp = Math.floor(Date.now() / 1000)
    let res
    if (isInit.value) {
      const password = await encryptWithServerKey({ loginId, password: form.newPwd, timestamp })
      res = await initPassword({
        accessToken: store.token,
        password,
        refreshToken: store.userInfo?.refreshToken || '',
        with_im: 1
      })
    } else {
      const userInfo = await encryptWithServerKey({ oldPassword: form.oldPwd, password: form.newPwd, timestamp })
      res = await resetPassword({ accessToken: store.token, userInfo })
    }
    if (res && res.code === 200) {
      showToast(isInit.value ? t('密码设置成功') : t('密码修改成功'))
      setTimeout(() => router.back(), 600)
    }
  } catch (e) {
    if (e && e.message) showToast(e.message)
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.password_page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vl-bg);
}

.password_body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 16px calc(24px + env(safe-area-inset-bottom));
}

.tip {
  margin-bottom: 12px;
  font-size: 13px;
  line-height: 20px;
  color: var(--vl-text-2);
}

.group {
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

  :deep(.van-field__label) {
    color: var(--vl-ink);
    font-weight: 500;
  }
}

.rules {
  margin: 12px 4px 0;
  padding: 0;
  list-style: none;

  li {
    position: relative;
    padding-left: 12px;
    font-size: 12px;
    line-height: 20px;
    color: var(--vl-text-3);

    &::before {
      content: '';
      position: absolute;
      left: 2px;
      top: 9px;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: currentColor;
    }
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
</style>
