<!--
 * @Author: lanjian
 * @Date: 2021-11-27 11:27:44
 * @LastEditors: lanjian
 * @LastEditTime: 2021-12-10 10:28:27
 * @FilePath: \cordava_utils\demo\src\components\commonpage\aboutPage.vue
 * @Description: Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
-->
/**
Created by 兰舰 on 2019/12/12  17:14
*/
<template>
  <div class="page_container">
    <nav-header-banner :title="$t('关于')" />
    <div class="about_home_body">
      <van-cell title-style="text-align: left;" :title="$t('版本说明')" is-link to="/versionsPage" />
      <van-cell title-style="text-align: left;" :title="$t('联系我们')" is-link to="/contactUS" />
    </div>
    <div v-if="appDetail" style="position: absolute;top:66%;width: 100%;display: flex;align-items: center;flex-direction: column;justify-content: space-between;height: 180px;">
      <div style="display: flex;flex-direction: column;align-items: center;justify-content: space-around;height: 140px;">
        <oort-image :src="appDetail.icon_url" style="height: 70px;width: 70px" @click="showVConsole" />
        <span style="font-size: 16px;">{{ appDetail.applabel }}</span>
        <span style="font-size: 12px;color: #999999;">{{ appDetail.version }}</span>
      </div>
      <span style="font-size: 12px;color: #999999;">
        {{ $t('开发公司：') }}{{ appDetail.develop_unit }}
      </span>
    </div>
  </div>
</template>

<script>
import OortImage from '../image/oort_image.vue'
import NavHeaderBanner from '../navHeaderBanner/index'
import config from '@/config'
import appIcon from '@/assets/img/app_icon.png'
export default {
  name: 'AboutPage',
  components: { NavHeaderBanner, OortImage },
  data() {
    return {
      appDetail: null,
      clickCount: 0
    }
  },
  created() {
    this.getAPP()
  },
  methods: {
    getAPP() {
      // 新原生壳下走 getAppInfoFromHttp；否则走原生 getAppInfo
      const isNativeShell = window.global && window.global.is_native_shell
      const fetcher = isNativeShell
        ? Promise.resolve(this.getAppInfoFromHttp())
        : window.androidFunUtils.getAppInfo()
      Promise.resolve(fetcher).then((res) => {
        if (res) {
          const parsed = typeof res === 'string' ? JSON.parse(res) : res
          this.appDetail = parsed
          config.appInfo = parsed
          console.log(res)
        }
      })
    },
    getAppInfoFromHttp() {
      // 原生壳注入的静态应用信息（applabel/version 与桌面图标名一致），浏览器调试时退回默认值
      const staticInfo = window.__VL_STATIC__ && window.__VL_STATIC__.appInfo
      return {
        applabel: (staticInfo && staticInfo.applabel) || config.appName || 'VLStreamCloud',
        version: (staticInfo && staticInfo.version) || '1.0.0',
        develop_unit: this.$t('奥尔特云（深圳）智慧科技有限公司'),
        // 图标用与应用一致的本地资源（与鸿蒙桌面图标同源）
        icon_url: appIcon
      }
    },
    showVConsole() {
      if (this.clickCount === 5) {
        new window.VConsole()
      }
      this.clickCount++
    }
  }
}
</script>

<style lang="scss" scoped>
  @f_color: #FFFFFF;
  .about_home_body {
    height: calc(100vh - 48px);
    overflow: scroll;
  }
</style>

