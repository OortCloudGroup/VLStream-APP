<!-- eslint-disable vue/no-multiple-template-root -->
<!--
 * @Author: lanjian
 * @Date: 2021-11-13 09:13:06
 * @LastEditors: lanjian
 * @LastEditTime: 2021-11-27 12:19:03
 * @FilePath: \cordava_utils\demo\src\App.vue
 * @Description: Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
-->

<template>
  <div id="page_container">
    <router-view v-if="isInitFinsh" />
    <!--    pc 登陆的开发界面-->
    <oort-popup v-model="showLoginDev" position="right" style="width: 100%;height: 100%;">
      <login-dev @loginSuccess="loginSuccess" />
    </oort-popup>
  </div>
</template>

<script setup>

import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Config, { applyVlEnv } from '@/config'
import appConfig from '@/config/AppConfig'
import { showLoadingToast, showFailToast } from 'vant'
import { getAccessToken, getGateWay, getAppInfo, getAppInfoFromHttp } from '@/utils/cordovatUtils.js'
import { pushStatusBar, popStatusBar } from '@/utils/shellStatusBar'
import { useUserStore } from '@/store/modules/useraPaas'
import OortPopup from '@/components/popup/oort_popup'
import LoginDev from '@/components/commonpage/LoginDev'

const { t } = useI18n()

const store = useUserStore()

const showLoginDev = ref(false)
const isInitFinsh = ref(false)

// The login panel covers the whole screen with a light gradient; align the
// shell status bar with it while it is visible (no-op in browsers)
watch(showLoginDev, (visible) => {
  if (visible) {
    pushStatusBar('#EEF3FF', '#000000')
  } else {
    popStatusBar()
  }
})

const init = () => {
// 设置 应用id等配置
  const configObj = appConfig['VLStreamCloud']
  Config.appId = configObj.appId
  Config.secretKey = configObj.secretKey
  Config.requestType = configObj.requestType
  Config.headers.appId = Config.appId
  Config.headers.secretKey = Config.secretKey
  Config.headers.requestType = Config.requestType

  Config.appName = configObj.appName
  if (window.global && window.global.is_native_shell) {
    // 新原生壳（AgentWeb）：网关由原生注入，token 由 H5 LoginDev 自取
    // 原生壳可只下发环境名（multi/single），由 config 预设表决定各服务域名
    const staticVars = window.__VL_STATIC__ || {}
    if (staticVars.vlEnv) applyVlEnv(staticVars.vlEnv)
    const gw = window.androidFunUtils && window.androidFunUtils.getGateway
      ? window.androidFunUtils.getGateway()
      : ''
    if (gw) {
      Config.URL = gw.endsWith('/') ? gw : gw + '/'
    }
    // 弹出 H5 登录面板
    showLoginDev.value = true
  } else if (!!window.cordova && !!window.cordova.exec) {
    let toastInst = showLoadingToast({
      message: t('加载中...'),
      forbidClick: true,
      duration: 0
    })
    Promise.all([
      getAccessToken(),
      getGateWay()
    ]).then(async res => {
      window.accessToken = res[0]
      store.setStoreToken(res[0])
      Config.URL = res[1] + '/'
      toastInst.close()
      let resp = await store.versionToken()
      if (resp.code === 200) {
        let respp = await getAppInfo()
        if (respp) {
          isInitFinsh.value = true
        } else {
          let resa = await getAppInfoFromHttp()
          if (resa) {
            isInitFinsh.value = true
          } else {
            showFailToast(t('获取应用信息失败'))
          }
        }
      }
    })
  } else {
    // 仅生产构建下按当前源覆盖网关（H5 与网关同源部署时）；dev server 的源不是后端网关，局域网 IP 调试同样不能覆盖
    if (!import.meta.env.DEV && window.location.protocol.startsWith('http')) {
      Config.URL = window.location.origin + '/'
    }
    showLoginDev.value = true
  }
}

const loginSuccess = async() => {
  if (Config.authMode === 'local') {
    // 单租户集群没有 apaas-admin-platform，应用信息退回到原生壳注入的静态值（浏览器调试时为空）
    Config.appInfo = Config.appInfo || (window.__VL_STATIC__ && window.__VL_STATIC__.appInfo) || {}
    showLoginDev.value = false
    isInitFinsh.value = true
    return
  }
  let res = await getAppInfoFromHttp()
  if (res.code === 200) {
    showLoginDev.value = false
    isInitFinsh.value = true
  }
}

onMounted(() => {
  if (window.global && window.global.is_native_shell) {
    // 新原生壳：直接初始化（无需 deviceready）
    init()
  } else if (window.global.is_cordova) {
    // this.isInitFinsh = true
    document.addEventListener('deviceready', init, false)
  } else {
    init()
  }
})

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width:100vw;
  height: 100vh;
}

#page_container {
  width:100%;
  height: 100%;
  overflow:auto;
}
</style>
