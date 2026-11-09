<!--
  LoginDev 登录面板（现代化重设计）。
  多租户：getLogin（apaas-sso）→ getUserTenants → loginSSO；
  单租户（Config.authMode === 'local'）：getLogin 一步完成（vls-server/blade-auth/token），无验证码与租户选择。
  @Author 兰舰 (UI redesign)
-->
<template>
  <div class="login_page" :style="{ paddingTop: safeAreaTop, paddingBottom: '16px' }">
    <!-- 品牌区 -->
    <div class="brand_area">
      <img class="brand_logo" src="@/assets/img/login_logo.png" alt="VLStream Cloud" />
      <div class="brand_subtitle">
        {{ $t('视频流云平台') }}
      </div>
    </div>

    <!-- 表单卡片 -->
    <div class="form_card">
      <div class="form_card_title">
        {{ $t('账号登录') }}
      </div>

      <div class="field_group">
        <van-field
          v-model="username"
          class="login_field"
          left-icon="manager-o"
          :placeholder="$t('请输入用户名')"
          clearable
        />
        <van-field
          v-model="password"
          class="login_field"
          left-icon="lock"
          :type="showPwd ? 'text' : 'password'"
          :placeholder="$t('请输入密码')"
          :right-icon="showPwd ? 'eye-o' : 'closed-eye'"
          @click-right-icon="showPwd = !showPwd"
        />
      </div>

      <!-- 图形验证码（后端要求时出现） -->
      <div v-if="captchaID" class="captcha_row">
        <van-field
          v-model="code"
          class="login_field captcha_field"
          left-icon="shield-o"
          :placeholder="$t('请输入图形验证码')"
        />
        <img
          class="captcha_img"
          :src="codePngUrl + '/' + captchaID + '.png?' + timeStamp"
          alt="验证码"
          @click="refreshCaptcha"
        />
      </div>

      <div class="aux_row">
        <div class="auto_login" @click="autoLogin = !autoLogin">
          <span class="auto_login_box" :class="{ checked: autoLogin }">
            <van-icon v-if="autoLogin" name="success" />
          </span>
          <span class="auto_login_text">{{ $t('下次自动登录') }}</span>
        </div>
      </div>

      <van-button
        class="login_btn"
        :loading="loading"
        :loading-text="$t('登录中...')"
        block
        @click="loginBtn"
      >
        {{ $t('登录') }}
      </van-button>
    </div>

    <div class="footer_tip">
      {{ $t('登录即表示同意平台服务条款') }}
    </div>

    <!-- 租户选择弹窗 -->
    <oort-popup v-model="tenantVis" position="center" :close-on-click-overlay="false" class="tenant_popup">
      <div class="tenant_container">
        <div class="tenant_header">
          <div class="tenant_title">
            {{ $t('请选择登录租户') }}
          </div>
          <div class="tenant_desc">
            {{ $t('该账号关联了多个租户') }}
          </div>
        </div>
        <div class="tenant_list">
          <div
            v-for="item in tenantList"
            :key="item.tenant_id"
            class="tenant_item"
            :class="{ active: selectedTenantId === item.tenant_id }"
            @click="tenantClickLogin(item)"
          >
            <div class="tenant_avatar">
              {{ (item.tenant_name || item.tenant_code || 'T').charAt(0) }}
            </div>
            <div class="tenant_info">
              <div class="tenant_name">
                {{ item.tenant_name }}
              </div>
              <div class="tenant_code">
                {{ item.tenant_code }}
              </div>
            </div>
            <van-icon v-if="selectedTenantId === item.tenant_id" name="success" class="tenant_check" />
          </div>
        </div>
      </div>
    </oort-popup>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'

import OortPopup from '@/components/popup/oort_popup'

import { getUserTenants } from '@/api/login/indexapaas.ts'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tenantList = ref([])
const tenantVis = ref(false)
const tempToken = ref('')
const selectedTenantId = ref('')

// 沉浸式状态栏适配：整页内容垂直居中，安全区只作为容器上边距，避免内容顶进状态栏
const safeAreaTop = ref('0px')
const computeSafeAreaTop = () => {
  const sh = window.global && window.global.is_native_shell
    ? (window.__safeAreaTop || 0)
    : 0
  safeAreaTop.value = sh + 'px'
}

const getTenantInfo = () => {
  const params = {
    accessToken: tempToken.value
  }
  getUserTenants(params).then((res) => {
    if (res.code === 200) {
      tenantList.value = res.data.list
      if (tenantList.value.length === 1) {
        tenantClickLogin(tenantList.value[0])
      } else if (tenantList.value.length > 1) {
        tenantVis.value = true
      } else {
        showToast(t('暂无租户信息'))
      }
    }
  })
}

const emits = defineEmits(['loginSuccess'])
const tenantClickLogin = (item) => {
  selectedTenantId.value = item.tenant_id
  const params = {
    accessToken: tempToken.value,
    tenant_id: item.tenant_id
  }
  store.login(params).then((res) => {
    if (res.code === 200) {
      showToast(t('登录成功'))
      emits('loginSuccess')
    }
  })
}

const autoLogin = ref(false)
const showPwd = ref(false)
const loading = ref(false)

import { useUserStore } from '@/store/modules/useraPaas'
import Config from '@/config'
const store = useUserStore()
// 单租户（local）用 vls-server 的 BladeX 登录，没有验证码、没有租户选择
const isLocalAuth = Config.authMode === 'local'
const username = ref('')
const password = ref('')
const captchaID = ref('')
const code = ref('')
const codePngUrl = ref(Config.platformURL + Config.gateWay + Config.authService + '/captcha/v1/')

const timeStamp = ref(new Date().getTime())
const refreshCaptcha = () => {
  timeStamp.value = new Date().getTime()
}

const loginBtn = async() => {
  if (!username.value) {
    showToast(t('请输入用户名'))
    return
  }
  if (!password.value) {
    showToast(t('请输入密码'))
    return
  }
  if (autoLogin.value) {
    const tempObj = {
      username: username.value,
      password: password.value
    }
    window.sessionStorage.setItem('autoLogin', JSON.stringify(tempObj))
  }
  loading.value = true
  store.getLogin({
    loginId: username.value,
    password: password.value,
    code: code.value,
    captchaID: captchaID.value
  }).then((res) => {
    if (res.code === 200) {
      if (isLocalAuth) {
        // 单租户一步登录：本地令牌即业务令牌，没有租户选择这一步
        showToast(t('登录成功'))
        emits('loginSuccess')
        return
      }
      tempToken.value = res.data.token
      getTenantInfo()
    } else {
      // 本地认证走裸 axios，没有 service.ts 的统一错误提示，这里补上
      if (isLocalAuth && res.msg) showToast(res.msg)
      refreshCaptcha()
      captchaID.value = res.data && res.data.CaptchaID ? res.data.CaptchaID : ''
    }
  }).catch((error) => {
    if (isLocalAuth) showToast(error?.response?.data?.msg || error?.message || t('登录失败'))
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  computeSafeAreaTop()
  if (window.sessionStorage.getItem('autoLogin')) {
    try {
      const tempObj = JSON.parse(window.sessionStorage.getItem('autoLogin'))
      username.value = tempObj.username
      password.value = tempObj.password
      autoLogin.value = true
      loginBtn()
    } catch (e) {
      // ignore
    }
  }
})

</script>

<style lang="scss" scoped>
$brand: var(--vl-ink);
$text_main: var(--vl-ink);
$text_sub: var(--vl-text-2);

.login_page {
  min-height: 100vh;
  max-height: 100%;
  width: 100%;
  background: var(--vl-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 品牌区 */
.brand_area {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  padding-bottom: 28px;
  position: relative;
  z-index: 1;
}

/* 首屏入场：品牌区与表单依次上浮淡入 */
@keyframes vl-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.brand_area {
  animation: vl-rise 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.form_card {
  animation: vl-rise 0.6s 0.08s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.footer_tip {
  animation: vl-rise 0.6s 0.16s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.brand_logo {
  width: 168px;
  height: auto;
  margin-bottom: 12px;
  object-fit: contain;
}

.brand_subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: $text_sub;
}

/* 表单卡片 */
.form_card {
  align-self: stretch;
  margin: 0 20px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid var(--vl-line);
  border-radius: var(--vl-radius-lg);
  padding: 28px 20px 24px;
  box-shadow: var(--vl-shadow);
  position: relative;
  z-index: 1;
}

.form_card_title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.3px;
  color: $text_main;
  margin-bottom: 22px;
}

.field_group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

:deep(.login_field) {
  background: var(--vl-surface);
  border-radius: 16px;
  padding: 12px 16px;
  align-items: center;

  .van-field__left-icon {
    color: $text_main;
    font-size: 20px;
    margin-right: 10px;
  }

  .van-field__right-icon {
    color: $text_sub;
    font-size: 20px;
    padding-left: 8px;
  }

  input {
    color: $text_main;
    font-size: 15px;
  }

  input::placeholder {
    color: var(--vl-text-3);
  }
}

.captcha_row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.captcha_field {
  flex: 1;
}

.captcha_img {
  width: 110px;
  height: 44px;
  border-radius: 16px;
  object-fit: cover;
  background: var(--vl-surface);
}

.aux_row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  margin-bottom: 22px;
}

.auto_login {
  display: flex;
  align-items: center;
}

.auto_login_box {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid #c7c7cc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  transition: all 0.2s ease;

  &.checked {
    background: $brand;
    border-color: $brand;
  }
}

.auto_login_text {
  margin-left: 8px;
  font-size: 13px;
  color: $text_sub;
}

.login_btn {
  height: 50px;
  border-radius: 999px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #fff;
  background: $brand;
  box-shadow: none;
}

.login_btn:active {
  opacity: 0.9;
}

.footer_tip {
  margin-top: 28px;
  margin-bottom: auto;
  font-size: 12px;
  color: var(--vl-text-3);
  position: relative;
  z-index: 1;
}

/* 租户选择弹窗 */
:deep(.tenant_popup) {
  width: 86%;
  border-radius: var(--vl-radius-lg);
  overflow: hidden;
}

.tenant_container {
  background: #fff;
  border-radius: var(--vl-radius-lg);
  padding: 24px 18px 18px;
}

.tenant_header {
  text-align: center;
  margin-bottom: 18px;
}

.tenant_title {
  font-size: 18px;
  font-weight: 700;
  color: $text_main;
}

.tenant_desc {
  margin-top: 6px;
  font-size: 13px;
  color: $text_sub;
}

.tenant_list {
  max-height: 50vh;
  overflow-y: auto;
}

.tenant_item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  background: var(--vl-surface);
  border-radius: 16px;
  border: 1.5px solid transparent;
  transition: all 0.2s ease;

  &:active {
    background: var(--vl-surface-2);
  }

  &.active {
    background: #ffffff;
    border-color: $brand;
  }
}

.tenant_avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: $brand;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tenant_info {
  margin-left: 12px;
  flex: 1;
  overflow: hidden;
}

.tenant_name {
  font-size: 15px;
  font-weight: 600;
  color: $text_main;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tenant_code {
  margin-top: 3px;
  font-size: 12px;
  color: $text_sub;
}

.tenant_check {
  color: $brand;
  font-size: 18px;
}
</style>
