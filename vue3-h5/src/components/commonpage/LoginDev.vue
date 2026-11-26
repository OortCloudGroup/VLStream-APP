<!--
  LoginDev 登录面板（现代化重设计）。
  多租户（业务逻辑与 T-OORT.SH/login-page 保持一致）：
    登录方式由平台配置 apaas-sso frontConf/v1/config.json 决定（isOpenOtherLoginWay + loginWaySort），
    移动端支持：账号密码(1) / 手机验证码(6) / 邮箱验证码(9)；微信扫码等需要 PC 的方式与 login-page 移动视口一致不展示。
    getLoginV2（sso/v2/getLoginCode）→ getUserTenants
    → 单租户直登 / 未要求选择时自动登录最近租户 / 弹窗选择（同密码直登、不同密码再输密码走 fastLogin）
    → loginSSO；返回 441 时进入双因子（短信/邮箱验证码，fastLogin 第二步）。
    验证码 5 分钟内重复发送需先通过滑块。
  单租户（Config.authMode === 'local'）：只有账号密码，getLogin 一步完成（vls-server/blade-auth/token）。
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

    <!-- 表单卡片：第一步登录 -->
    <div v-if="!isTwoFactor" class="form_card">
      <div class="form_card_title">
        {{ currentWayTitle }}
      </div>

      <!-- 登录方式切换（平台开启了多种方式时出现） -->
      <div v-if="loginWays.length > 1" class="way_tabs">
        <div
          v-for="item in loginWays"
          :key="item.key"
          class="way_tab"
          :class="{ active: loginWay === item.way }"
          @click="changeLoginWay(item.way)"
        >
          {{ $t(item.label) }}
        </div>
      </div>

      <!-- 账号密码 -->
      <template v-if="loginWay === 1">
        <div class="field_group">
          <van-field
            v-model="username"
            class="login_field"
            left-icon="manager-o"
            :placeholder="isLocalAuth ? $t('请输入用户名') : $t('请输入账号/手机号/邮箱')"
            clearable
            @blur="checkCaptcha"
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
            :src="codePngUrl + captchaID + '.png?' + timeStamp"
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
      </template>

      <!-- 手机号 / 邮箱 + 验证码 -->
      <template v-else>
        <div class="field_group">
          <van-field
            v-if="loginWay === 6"
            v-model="phone"
            class="login_field"
            left-icon="phone-o"
            type="tel"
            maxlength="11"
            :placeholder="$t('请输入手机号')"
            clearable
          />
          <van-field
            v-else
            v-model="email"
            class="login_field"
            left-icon="envelop-o"
            type="email"
            :placeholder="$t('请输入邮箱')"
            clearable
          />
        </div>
        <div class="captcha_row">
          <van-field
            v-model="loginCode"
            class="login_field captcha_field"
            left-icon="shield-o"
            type="digit"
            maxlength="8"
            :placeholder="$t('请输入验证码')"
          />
          <van-button
            class="code_btn"
            :disabled="countdownOf(wayCodeType) > 0 || codeSending"
            :loading="codeSending"
            @click="sendWayCode"
          >
            {{ countdownOf(wayCodeType) > 0 ? countdownOf(wayCodeType) + 's' : $t('获取验证码') }}
          </van-button>
        </div>
        <div class="aux_row" />
      </template>

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

    <!-- 表单卡片：双因子第二步 -->
    <div v-else class="form_card">
      <div class="twofa_head">
        <div class="form_card_title twofa_title">
          {{ getLabel(selectedType) }}
        </div>
        <span class="twofa_link" @click="handleChangeMethod">{{ $t('其他验证方式') }}</span>
      </div>
      <div v-if="selectedIdentifier" class="twofa_desc">
        {{ $t('验证码已发送至') }} {{ desensitize(selectedType, selectedIdentifier) }}
      </div>

      <div v-if="selectedType === 1 || selectedType === 7" class="captcha_row twofa_code_row">
        <van-field
          v-model="twoFaCode"
          class="login_field captcha_field"
          left-icon="shield-o"
          type="digit"
          maxlength="8"
          :placeholder="$t('请输入验证码')"
        />
        <van-button
          class="code_btn"
          :disabled="countdownOf(selectedType) > 0 || codeSending"
          :loading="codeSending"
          @click="sendTwoFaCode"
        >
          {{ countdownOf(selectedType) > 0 ? countdownOf(selectedType) + 's' : $t('获取验证码') }}
        </van-button>
      </div>
      <div v-else class="twofa_desc">
        {{ $t('移动端暂不支持该验证方式，请选择其他验证方式') }}
      </div>

      <van-button
        class="login_btn twofa_btn"
        :loading="loading"
        :loading-text="$t('登录中...')"
        :disabled="!(selectedType === 1 || selectedType === 7)"
        block
        @click="handle2FALogin"
      >
        {{ $t('登录') }}
      </van-button>
      <div class="twofa_back" @click="exitTwoFactor">
        {{ $t('返回账号登录') }}
      </div>
    </div>

    <!-- 华为审核 7.5 项要求：默认不勾选的空白复选框 + 用户主动勾选同意，禁止"登录即表示同意"式默认同意表述 -->
    <div class="privacy_agree">
      <span class="agree_box" :class="{ checked: agreePrivacy }" @click="agreePrivacy = !agreePrivacy">
        <van-icon v-if="agreePrivacy" name="success" />
      </span>
      <span class="agree_text">
        {{ $t('我已阅读并同意') }}<span class="policy_link" @click="openPrivacyPolicy">《{{ $t('用户协议和隐私政策') }}》</span>
      </span>
    </div>

    <!-- 租户选择弹窗 -->
    <oort-popup v-model="tenantVis" position="center" :close-on-click-overlay="true" class="tenant_popup">
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
            v-for="item in tenantSamePassList"
            :key="item.tenant_id + (item.user_id || '')"
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
                {{ item.user_name || item.tenant_code }}
              </div>
            </div>
            <van-icon v-if="selectedTenantId === item.tenant_id" name="success" class="tenant_check" />
          </div>

          <div v-if="tenantDiffPassList.length > 0" class="tenant_group_tip">
            {{ $t('以下租户账号使用独立密码') }}
          </div>
          <div
            v-for="item in tenantDiffPassList"
            :key="item.tenant_id + (item.user_id || '')"
            class="tenant_item"
            @click="tenantDiffPassClickLogin(item)"
          >
            <div class="tenant_avatar">
              {{ (item.tenant_name || item.tenant_code || 'T').charAt(0) }}
            </div>
            <div class="tenant_info">
              <div class="tenant_name">
                {{ item.tenant_name }}
              </div>
              <div class="tenant_code">
                {{ item.user_name || item.tenant_code }}
              </div>
            </div>
            <van-icon name="lock" class="tenant_check" />
          </div>
        </div>
      </div>
    </oort-popup>

    <!-- 不同密码租户：输入该租户账号密码 -->
    <oort-popup v-model="inputPwdVis" position="center" :close-on-click-overlay="true" class="tenant_popup">
      <div class="tenant_container">
        <div class="tenant_header">
          <div class="tenant_title">
            {{ $t('输入密码') }}
          </div>
          <div class="tenant_desc">
            {{ $t('请输入该租户账号的登录密码') }}：{{ curSelAccount.tenant_name }}
          </div>
        </div>
        <van-field
          v-model="tenantPassword"
          class="login_field"
          left-icon="lock"
          type="password"
          :placeholder="$t('请输入密码')"
        />
        <van-button
          class="login_btn pwd_confirm_btn"
          :loading="loading"
          :disabled="!tenantPassword"
          block
          @click="confirmPwd"
        >
          {{ $t('下一步') }}
        </van-button>
      </div>
    </oort-popup>

    <!-- 双因子：选择其他验证方式 -->
    <van-action-sheet
      v-model:show="showMethodPanel"
      :actions="methodActions"
      :cancel-text="$t('取消')"
      :description="$t('选择验证方式')"
      close-on-click-action
      @select="onSelectMethod"
    />

    <!-- 滑块验证：5 分钟内重复发送验证码时要求通过 -->
    <oort-popup v-model="slideVisible" position="center" :close-on-click-overlay="true" class="slide_popup">
      <!-- 内边距写内联 px：PostCSS 不转换，300 画布 + 2×8 在 320 宽屏也放得下 -->
      <div class="tenant_container slide_container" :style="{ padding: '18px 8px 16px' }">
        <div class="tenant_header">
          <div class="tenant_title">
            {{ $t('安全验证') }}
          </div>
          <div class="tenant_desc">
            {{ $t('拖动下方滑块完成拼图') }}
          </div>
        </div>
        <slide-verify
          ref="slideRef"
          :width="300"
          :height="150"
          :slider-width="40"
          :slider-y="slideYPos"
          :slide-id="slideId"
          :bg-image="slideBgUrl"
          :slider-image="slidePieceUrl"
          @position="onSliderPosition"
          @request-new-captcha="getSlideCaptcha"
        />
      </div>
    </oort-popup>
  </div>
</template>

<script setup>

import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { getSafeAreaTop } from '@/utils/safeArea'

import OortPopup from '@/components/popup/oort_popup'
import SlideVerify from '@/components/slideVerify/index.vue'

import {
  getUserTenants,
  getCaptcha,
  getUserOtherLogin,
  sendLoginSmsCode,
  sendLoginEmailCode,
  authConfigList,
  generateCaptcha
} from '@/api/login/indexapaas.ts'
import { getClientPublicIp } from '@/utils/getClientPublicIp'
import { loadLoginPlatformConfig, parseLoginWaySort } from '@/utils/loginPlatformConfig'
import JSEncrypt from 'jsencrypt'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/modules/useraPaas'
import Config from '@/config'

const { t } = useI18n()
const store = useUserStore()
const emits = defineEmits(['loginSuccess'])

// 单租户（local）用 vls-server 的 BladeX 登录，没有验证码、没有租户选择
const isLocalAuth = Config.authMode === 'local'

// 沉浸式状态栏适配：整页内容垂直居中，安全区只作为容器上边距，避免内容顶进状态栏
const safeAreaTop = ref('0px')
const computeSafeAreaTop = () => {
  safeAreaTop.value = getSafeAreaTop() + 'px'
}

/* ---------------- 登录方式（平台配置驱动，同 login-page） ---------------- */
// way：1 账号密码 / 6 手机验证码 / 9 邮箱验证码（编号沿用 login-page）
const WAY_CONFIG = [
  { key: 'mobileVerificationCode', way: 6, label: '验证码登录', title: '手机号登录', defaultOrder: 1 },
  { key: 'account', way: 1, label: '密码登录', title: '账号登录', defaultOrder: 2 },
  { key: 'emailVerificationCode', way: 9, label: '邮箱登录', title: '邮箱登录', defaultOrder: 3 }
]
const isOpenOtherLoginWay = ref({})
const loginWaySortMap = ref({})
const loginWay = ref(1)

const loginWays = computed(() => {
  if (isLocalAuth) return WAY_CONFIG.filter(item => item.way === 1)
  const open = isOpenOtherLoginWay.value
  const sortOf = item => loginWaySortMap.value[item.key] || 0
  return WAY_CONFIG
    .filter(item => item.key === 'account' || open[item.key])
    .sort((a, b) => {
      const sa = sortOf(a)
      const sb = sortOf(b)
      if (sa && sb) return sa - sb || a.defaultOrder - b.defaultOrder
      if (sa) return -1
      if (sb) return 1
      return a.defaultOrder - b.defaultOrder
    })
})
const currentWayTitle = computed(() => t((WAY_CONFIG.find(item => item.way === loginWay.value) || WAY_CONFIG[1]).title))

/** 默认方式：已开启且排序最小的（微信扫码等移动端不可用的不参与） */
const initDefaultLoginWay = () => {
  loginWay.value = loginWays.value[0]?.way || 1
}

const changeLoginWay = (way) => {
  if (loginWay.value === way) return
  loginWay.value = way
  loginCode.value = ''
  captchaID.value = ''
  code.value = ''
}

/* ---------------- 账号密码 ---------------- */
const username = ref('')
const password = ref('')
const autoLogin = ref(false)
const showPwd = ref(false)
const loading = ref(false)

// 隐私政策勾选状态：新装/审核环境（localStorage 为空）默认不勾选；
// 用户勾选并登录成功后持久化，下次进入自动勾选，保证"下次自动登录"链路可用
const agreePrivacy = ref(window.localStorage.getItem('privacyAgreed') === 'true')

// 华为应用市场隐私审核要求：注册/登录界面需能明确阅读隐私政策。
// 与「我的 → 关于 → 隐私政策」(aboutPage.vue) 使用同一公网页址。
const PRIVACY_POLICY_URL = 'https://oortcloudsmart.com/privacypolicy_vlstream.html'
const openPrivacyPolicy = () => {
  window.location.href = PRIVACY_POLICY_URL
}

const captchaID = ref('')
const code = ref('')
const codePngUrl = ref(Config.platformURL + Config.gateWay + Config.authService + '/captcha/v1/')
const timeStamp = ref(new Date().getTime())
const refreshCaptcha = () => {
  timeStamp.value = new Date().getTime()
}

/** 账号变更后询问后端是否需要图形验证码（login-page checkCaptcha） */
const checkCaptcha = () => {
  if (isLocalAuth) return Promise.resolve()
  const account = username.value
  if (!account) return Promise.resolve()
  return getCaptcha({ model: 'login', username: account }).then((res) => {
    if (res.code === 200 && username.value === account) {
      captchaID.value = res.data?.CaptchaID || ''
      refreshCaptcha()
    }
  }).catch(() => {})
}

/* ---------------- 手机 / 邮箱验证码登录 ---------------- */
const phone = ref('')
const email = ref('')
const loginCode = ref('')
const isValidPhone = value => /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(value)
const isValidEmail = value => /^([a-z0-9_.-]+)@([\da-z.-]+)\.([a-z.]{2,6})$/.test(value)
// 验证码类型：1 短信 / 7 邮箱（发送与计时按类型区分）
const wayCodeType = computed(() => (loginWay.value === 6 ? 1 : 7))

/** 校验当前方式的手机号/邮箱，不合法时提示并返回空 */
const checkWayIdentifier = () => {
  const isPhone = loginWay.value === 6
  const value = (isPhone ? phone.value : email.value).trim()
  let error = ''
  if (!value) {
    error = isPhone ? '请输入手机号' : '请输入邮箱'
  } else if (isPhone ? !isValidPhone(value) : !isValidEmail(value)) {
    error = isPhone ? '请输入正确的手机号' : '请输入正确的邮箱'
  }
  if (error) {
    showToast(t(error))
    return ''
  }
  return value
}

const sendWayCode = () => {
  const identifier = checkWayIdentifier()
  if (!identifier) return
  requestCode(wayCodeType.value, identifier)
}

/* ---------------- 提交 ---------------- */
const tempToken = ref('')
const account = ref('')

const finishLogin = () => {
  showToast(t('登录成功'))
  emits('loginSuccess')
}

/** 第一步拿到临时 token 后进入选租户；失败时刷新图形验证码 */
const afterFirstStep = async(res, identifier) => {
  if (res.code === 200) {
    tempToken.value = res.data.token
    account.value = identifier
    await getTenantInfo()
    return
  }
  if (loginWay.value === 1) {
    code.value = ''
    refreshCaptcha()
    captchaID.value = res.data?.CaptchaID || ''
  }
}

const loginByAccount = async() => {
  if (!username.value) {
    showToast(t('请输入用户名'))
    return
  }
  if (!password.value) {
    showToast(t('请输入密码'))
    return
  }
  if (captchaID.value && !code.value) {
    showToast(t('请输入图形验证码'))
    return
  }
  if (autoLogin.value) {
    window.sessionStorage.setItem('autoLogin', JSON.stringify({
      username: username.value,
      password: password.value
    }))
  } else {
    window.sessionStorage.removeItem('autoLogin')
  }

  if (isLocalAuth) {
    try {
      const res = await store.getLogin({ loginId: username.value, password: password.value })
      if (res.code === 200) {
        // 单租户一步登录：本地令牌即业务令牌，没有租户选择这一步
        finishLogin()
      } else if (res.msg) {
        // 本地认证走裸 axios，没有 service.ts 的统一错误提示，这里补上
        showToast(res.msg)
      }
    } catch (error) {
      showToast(error?.response?.data?.msg || error?.message || t('登录失败'))
    }
    return
  }

  // 多租户：统一密码登录（identity_type 0），拿临时 token 再选租户
  const res = await store.getLoginV2({
    identity_type: 0,
    identifier: username.value,
    credential: password.value,
    code: code.value,
    captchaID: captchaID.value,
    client: 'pcweb',
    select_type: 1
  })
  await afterFirstStep(res, username.value)
}

const loginByCode = async() => {
  const identifier = checkWayIdentifier()
  if (!identifier) return
  if (!loginCode.value) {
    showToast(t('请输入验证码'))
    return
  }
  const isSms = loginWay.value === 6
  // 手机验证码 identity_type 1；邮箱验证码 identity_type 8（与 login-page 一致）
  const res = await store.getLoginV2({
    identity_type: isSms ? 1 : 8,
    config_code: isSms ? configCode.sms : configCode.email,
    identifier,
    credential: loginCode.value,
    client: 'pcweb',
    select_type: 1
  })
  await afterFirstStep(res, identifier)
}

const loginBtn = async() => {
  if (!agreePrivacy.value) {
    showToast(t('请先阅读并勾选同意用户协议和隐私政策'))
    return
  }
  window.localStorage.setItem('privacyAgreed', 'true')
  if (loading.value) return
  loading.value = true
  try {
    if (loginWay.value === 1) {
      await loginByAccount()
    } else {
      await loginByCode()
    }
  } catch (e) {
    // service.ts 已统一 toast
  } finally {
    loading.value = false
  }
}

/* ---------------- 租户选择 ---------------- */
const tenantList = ref([])
const tenantSamePassList = ref([])
const tenantDiffPassList = ref([])
const tenantVis = ref(false)
const selectedTenantId = ref('')

const getTenantInfo = async() => {
  try {
    const res = await getUserTenants({
      accessToken: tempToken.value,
      isDesensitizeAccount: false
    })
    if (res.code !== 200) return false
    tenantList.value = res.data?.list || []
    tenantDiffPassList.value = tenantList.value.filter(item => item.is_password_different_account === 1)
    tenantSamePassList.value = tenantList.value.filter(item => item.is_password_different_account !== 1)
    if (tenantList.value.length === 1) {
      return await tenantClickLogin(tenantList.value[0])
    }
    if (tenantList.value.length > 1) {
      if (!res.data.isSelect) {
        // 后端不要求选择时，直接登录最近一次登录（last_login_at 最大）的租户
        let recentlyTenant = tenantList.value[0]
        tenantList.value.forEach((item) => {
          if (item.last_login_at > recentlyTenant.last_login_at) recentlyTenant = item
        })
        return await tenantClickLogin(recentlyTenant)
      }
      if (res.data.account) account.value = res.data.account
      tenantVis.value = true
      return true
    }
    showToast(t('暂无租户信息'))
  } catch (e) {
    return false
  }
  return false
}

const tenantClickLogin = async(item) => {
  selectedTenantId.value = item.tenant_id
  const params = {
    accessToken: tempToken.value,
    tenant_id: item.tenant_id,
    unique_id: tenantVis.value ? item.unique_id : ''
  }
  try {
    const res = await store.login(params)
    if (res.code === 200) {
      tenantVis.value = false
      finishLogin()
      return true
    }
    if (res.code === 441) {
      tenantVis.value = false
      await enterTwoFactor(res.data)
      return true
    }
  } catch (e) {
    return false
  }
  return false
}

/* 不同密码的租户账号：再输一次该账号密码 */
const inputPwdVis = ref(false)
const tenantPassword = ref('')
const curSelAccount = ref({})
const tenantDiffPassClickLogin = (item) => {
  tenantVis.value = false
  curSelAccount.value = item
  tenantPassword.value = ''
  inputPwdVis.value = true
}

const confirmPwd = () => {
  loading.value = true
  store.getFastLogin({
    identity_type: 0,
    identifier: account.value || username.value,
    credential: tenantPassword.value,
    auth_token: tempToken.value,
    to_user_id: curSelAccount.value.user_id,
    to_tenant_id: curSelAccount.value.tenant_id,
    is_password_different_account: 1,
    select_type: 0
  }).then(async(res) => {
    if (res.code === 200) {
      inputPwdVis.value = false
      store.applyLoginResult(res.data)
      finishLogin()
    } else if (res.code === 441) {
      inputPwdVis.value = false
      await enterTwoFactor(res.data)
    }
  }).catch(() => {}).finally(() => {
    loading.value = false
  })
}

/* ---------------- 认证配置编码 ---------------- */
// 短信/邮箱等认证的 config_code：优先平台配置 common.authConfig，缺的再按 types 查 configList
const configCode = { sms: '', email: '', wx: '', dingding: '' }
const typeKeyMap = { 1: 'sms', 4: 'wx', 5: 'dingding', 7: 'email' }
const initAuthConfigCode = async() => {
  const authConfigArr = Config.common?.authConfig || []
  authConfigArr.forEach((item) => {
    const key = typeKeyMap[item.types]
    if (key) configCode[key] = item.value
  })
  await Promise.all([1, 7].map(async(types) => {
    const key = typeKeyMap[types]
    if (configCode[key]) return
    try {
      const res = await authConfigList({ types })
      if (res.code === 200 && res.data?.list?.[0]?.config_code) {
        configCode[key] = res.data.list[0].config_code
      }
    } catch (e) {
      // 拿不到时由发送验证码接口报错提示
    }
  }))
}

/* ---------------- 双因子（441） ---------------- */
const isTwoFactor = ref(false)
const selectedType = ref(1)
const selectedIdentifier = ref('')
const twoFaCode = ref('')

const enterTwoFactor = async(data) => {
  isTwoFactor.value = true
  tempToken.value = data.auth_token
  showToast(t('该账号已开启双因子认证，请完成二次验证'))
  await selectOtherLogin({ identity_type: data.identifier_type, identifier: data.identifier })
}

const exitTwoFactor = () => {
  isTwoFactor.value = false
  twoFaCode.value = ''
}

const getLabel = (type) => {
  switch (type) {
    case 1: return t('短信验证')
    case 7: return t('邮箱验证')
    case 4: return t('微信扫码验证')
    case 5: return t('钉钉扫码验证')
    case 3: return t('人脸验证')
    default: return t('其他验证方式')
  }
}

// 手机号/邮箱脱敏
const maskEmail = (value) => {
  const [name, domain] = value.split('@')
  const visibleLen = 3
  if (name.length <= visibleLen + 1) return value
  return `${name.slice(0, visibleLen)}${'*'.repeat(name.length - visibleLen - 1)}${name.slice(-1)}@${domain}`
}
const desensitize = (type, value) => {
  if (!value) return ''
  if (type === 1) return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  if (type === 7 && value.includes('@')) return maskEmail(value)
  return value
}

const otherLoginList = ref([])
const showMethodPanel = ref(false)
const methodActions = computed(() => otherLoginList.value
  // 移动端只支持短信/邮箱验证码，扫码与人脸需要 PC 端
  .filter(item => item.identity_type === 1 || item.identity_type === 7)
  .map(item => ({
    name: getLabel(item.identity_type),
    subname: desensitize(item.identity_type, item.identifier),
    item
  })))

const fetchOtherLogin = async() => {
  try {
    const res = await getUserOtherLogin({
      accessToken: tempToken.value,
      config_code: [configCode.dingding, configCode.wx],
      tenant_id: selectedTenantId.value || tenantList.value[0]?.tenant_id
    })
    if (res.code === 200 && res.data?.length) otherLoginList.value = res.data
  } catch (e) {
    // ignore
  }
}

const handleChangeMethod = async() => {
  await fetchOtherLogin()
  if (!methodActions.value.length) {
    showToast(t('暂无其他可用验证方式'))
    return
  }
  showMethodPanel.value = true
}

const onSelectMethod = (action) => {
  selectOtherLogin(action.item)
}

const selectOtherLogin = async(item) => {
  twoFaCode.value = ''
  selectedType.value = item.identity_type
  selectedIdentifier.value = item.identifier
  // 倒计时中说明刚发过，不重复发送
  if ((item.identity_type === 1 || item.identity_type === 7) && !countdownOf(item.identity_type)) {
    await sendTwoFaCode()
  }
}

const sendTwoFaCode = () => {
  if (!selectedIdentifier.value) return
  requestCode(selectedType.value, selectedIdentifier.value)
}

const handle2FALogin = () => {
  if (!twoFaCode.value) {
    showToast(t('请输入验证码'))
    return
  }
  const isSms = selectedType.value === 1
  // 邮箱在第二步的 identity_type 是 8（与 login-page 一致）
  const loginStepEnd = selectedType.value === 7 ? 8 : selectedType.value
  loading.value = true
  store.getFastLogin({
    identity_type: loginStepEnd,
    config_code: isSms ? configCode.sms : configCode.email,
    identifier: selectedIdentifier.value,
    credential: twoFaCode.value,
    select_type: 1,
    auth_token: tempToken.value,
    current_step: 2,
    login_step: [0, loginStepEnd]
  }).then((res) => {
    if (res.code === 200) {
      store.applyLoginResult(res.data)
      finishLogin()
    }
  }).catch(() => {}).finally(() => {
    loading.value = false
  })
}

/* ---------------- 验证码发送（登录与双因子共用） ---------------- */
/* real_user_info 为 RSA 密文 { user_ip, timestamp, device_info } */
const LOGIN_RSA_PUBLIC_KEY =
  'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAzd2eYqgC6A3CvQN982C7s3xo2zjL97b0lHkfcAFEy50YHg+g5QD6RbvZt0NTQVOoC5Vv867lp0UBrwAslNCjt92QyxKkGLU+10UClkCJsiHpxy/J7AOOpS0wMGao80uWN94EZEsP/FKFfGNz3lJcZRtg4TGCMgXQGlKxBcYJDor/zK/06asTBGp4IxvTDAKTuMP+u88y5nQTUpKPnPstwmiLfqZLOSE3y4kIA7VC98GxPY8SqLZ7b9HzLSNoZNXKvA9US7A2F8/A97b8tExXsGPOodMQzrLFVr840ZV2WgpxJHqobqYReGhGMN4JdjfGlUvHyhYaCyOcSWalWuLh18cDQkum8yUrw5Tki8r8VPDTEZhsOXcq46cMr4437HGYeDA2ib7TOArFq1d0DD9Z0DAsjNfhgqqIP9A9kXrs6JIRrkz82skco2WQ5NUdpLT3yaAiXTxmFaajQGVIhFG24VL8CTloRo3FZmy9vMlUseCKmhfCBFbhUG9r7HOuhkO+jY4yfItE8BIrClbkQBAzMBMTuRM84VQQ4MnYlbdT3uSt5Qw5WmGIxsAKk93o8Hyhrg/OX8FCwntw2h5AjGDGn/H5H0TDAp8vX0NJgh4xhOpNT8pshuX7W1vcqr42sqOjM/mbRPV3s+tT4ynY0xQLuqp0P7GW3fu0fT0/OeHPwcsCAwEAAQ=='
const DEVICE_INFO_STORAGE_KEY = 'login_stable_device_info'
const getStableDeviceInfo = () => {
  let deviceInfo = localStorage.getItem(DEVICE_INFO_STORAGE_KEY)
  if (!deviceInfo) {
    deviceInfo = `app_${crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`
    localStorage.setItem(DEVICE_INFO_STORAGE_KEY, deviceInfo)
  }
  return deviceInfo
}
const buildRealUserInfo = async() => {
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(LOGIN_RSA_PUBLIC_KEY)
  return encrypt.encrypt(JSON.stringify({
    user_ip: await getClientPublicIp(),
    timestamp: Math.floor(Date.now() / 1000),
    device_info: getStableDeviceInfo()
  })) || ''
}

// 短信与邮箱各自倒计时（同 login-page 的 phoneCodeCountdown / emailCodeCountdown）
const codeSending = ref(false)
const countdowns = reactive({ 1: 0, 7: 0 })
const codeTimers = {}
const countdownOf = type => countdowns[type] || 0
const stopCodeTimer = (type) => {
  if (codeTimers[type]) clearInterval(codeTimers[type])
  codeTimers[type] = null
  countdowns[type] = 0
}
const startCodeTimer = (type) => {
  stopCodeTimer(type)
  countdowns[type] = 60
  codeTimers[type] = setInterval(() => {
    countdowns[type]--
    if (countdowns[type] <= 0) stopCodeTimer(type)
  }, 1000)
}

/*
 * 滑块验证（与 login-page 一致）：本页 5 分钟内已成功发送过验证码时，
 * 再次发送必须先通过滑块，请求带 captcha_type=1 / slide_id / xpos；首次发送不需要。
 * 发送记录按真实用户来源（IP+设备）计，换号码不重置。
 */
const CODE_SLIDER_INTERVAL_MS = 5 * 60 * 1000
let lastCodeSentAt = 0
const shouldRequireSlider = () => !!lastCodeSentAt && Date.now() - lastCodeSentAt < CODE_SLIDER_INTERVAL_MS

// 等待滑块通过后要发送的目标
const pendingCode = { type: 1, identifier: '' }

const slideVisible = ref(false)
const slideRef = ref(null)
const slideId = ref('')
const slideYPos = ref(0)
const slideBgUrl = ref('')
const slidePieceUrl = ref('')
const slideBase = () => `${Config.platformURL}${Config.gateWay}${Config.authService}/captcha/v1/`

// 预加载图片，两张都就绪后再一起显示，避免拼图块先于背景出现
const preloadImg = src => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(src)
  img.onerror = () => reject(new Error('captcha image load failed'))
  img.src = src
})

const getSlideCaptcha = async() => {
  slideBgUrl.value = ''
  slidePieceUrl.value = ''
  try {
    const res = await generateCaptcha({ captcha_type: 1 })
    if (res.code !== 200) return false
    const { slide_id: id, ypos } = res.data || {}
    slideId.value = id
    slideYPos.value = ypos || 0
    const ts = Date.now()
    const [bg, piece] = await Promise.all([
      preloadImg(`${slideBase()}${id}.png?slide=bg&t=${ts}`),
      preloadImg(`${slideBase()}${id}.png?slide=slice&t=${ts}`)
    ])
    // 期间又刷新过就丢弃旧结果
    if (slideId.value !== id) return false
    slideBgUrl.value = bg
    slidePieceUrl.value = piece
    return true
  } catch (e) {
    showToast(t('验证图片加载失败，请点击刷新'))
    return false
  }
}

const onSliderPosition = (x) => {
  doSendCode(pendingCode.type, pendingCode.identifier, { captcha_type: 1, slide_id: slideId.value, xpos: x })
}

/** 实际发送；captcha 为滑块参数，带上时由结果驱动滑块成功/失败状态 */
const doSendCode = async(type, identifier, captcha) => {
  codeSending.value = true
  let ok = false
  try {
    const base = {
      send_type: 'login',
      real_user_info: await buildRealUserInfo(),
      ...(captcha || {})
    }
    const res = type === 1
      ? await sendLoginSmsCode({ ...base, config_code: configCode.sms, mobile: identifier })
      : await sendLoginEmailCode({ ...base, config_code: configCode.email, email: identifier })
    ok = res.code === 200
    if (ok) {
      lastCodeSentAt = Date.now()
      showToast(t('验证码已发送'))
      startCodeTimer(type)
    }
  } catch (e) {
    // service.ts 已统一 toast
  } finally {
    codeSending.value = false
  }
  if (captcha) {
    slideRef.value?.setVerifyResult(ok ? 'success' : 'fail')
    if (ok) setTimeout(() => { slideVisible.value = false }, 300)
  }
  return ok
}

/** 发送入口：需要滑块时先弹出滑块，通过后再发 */
const requestCode = async(type, identifier) => {
  if (codeSending.value || countdownOf(type) > 0 || !identifier) return
  if (shouldRequireSlider()) {
    pendingCode.type = type
    pendingCode.identifier = identifier
    slideVisible.value = true
    await getSlideCaptcha()
    return
  }
  await doSendCode(type, identifier)
}

/* ---------------- 初始化 ---------------- */
const restoreAutoLogin = () => {
  if (!window.sessionStorage.getItem('autoLogin')) return
  try {
    const tempObj = JSON.parse(window.sessionStorage.getItem('autoLogin'))
    loginWay.value = 1
    username.value = tempObj.username
    password.value = tempObj.password
    autoLogin.value = true
    loginBtn()
  } catch (e) {
    // ignore
  }
}

onMounted(async() => {
  computeSafeAreaTop()
  if (isLocalAuth) {
    restoreAutoLogin()
    return
  }
  // 预取公网 IP，减少首次发验证码等待
  getClientPublicIp().catch(() => {})
  const common = await loadLoginPlatformConfig()
  isOpenOtherLoginWay.value = common.isOpenOtherLoginWay || {}
  loginWaySortMap.value = parseLoginWaySort(common.loginWaySort)
  initDefaultLoginWay()
  restoreAutoLogin()
  await initAuthConfigCode()
})

onBeforeUnmount(() => {
  stopCodeTimer(1)
  stopCodeTimer(7)
  slideVisible.value = false
})

</script>

<style lang="scss" scoped>
$brand: var(--vl-primary);
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

.privacy_agree {
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

.privacy_agree {
  margin-top: 20px;
  margin-bottom: auto;
  display: flex;
  align-items: flex-start;
  position: relative;
  z-index: 1;
  padding: 0 4px;
}

.agree_box {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 1px;
  border-radius: 50%;
  border: 1.5px solid #cfd4de;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.checked {
    background: $brand;
    border-color: $brand;
  }
}

.agree_text {
  margin-left: 8px;
  font-size: 12px;
  line-height: 18px;
  color: var(--vl-text-3);
}

.policy_link {
  color: $brand;
  cursor: pointer;
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

/* 双因子第二步 */
.twofa_head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.twofa_title {
  margin-bottom: 8px;
}

.twofa_link {
  font-size: 13px;
  color: $brand;
  flex-shrink: 0;
}

.twofa_desc {
  font-size: 13px;
  color: $text_sub;
  line-height: 1.5;
}

.twofa_code_row {
  margin-top: 18px;
}

.code_btn {
  width: 110px;
  height: 44px;
  border-radius: 16px;
  border: none;
  background: var(--vl-surface);
  color: $brand;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.twofa_btn {
  margin-top: 24px;
}

.twofa_back {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: $text_sub;
}

.tenant_group_tip {
  margin: 6px 2px 10px;
  font-size: 12px;
  color: $text_sub;
}

/* 滑块弹窗宽度随 300px 画布走，不用租户弹窗的 86% */
:deep(.slide_popup) {
  width: auto;
  max-width: 100vw;
  border-radius: var(--vl-radius-lg);
  overflow: hidden;
}

.slide_container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pwd_confirm_btn {
  margin-top: 18px;
}

/* 登录方式切换（分段选择） */
.way_tabs {
  display: flex;
  padding: 4px;
  margin: -8px 0 18px;
  border-radius: 999px;
  background: var(--vl-surface);
}

.way_tab {
  flex: 1;
  height: 34px;
  line-height: 34px;
  text-align: center;
  border-radius: 999px;
  font-size: 14px;
  color: $text_sub;
  transition: all 0.2s ease;

  &.active {
    background: #fff;
    color: $text_main;
    font-weight: 700;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }
}
</style>
