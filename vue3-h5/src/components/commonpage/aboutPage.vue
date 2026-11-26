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
  <div class="page_container about_page">
    <nav-header-banner :title="$t('关于')" />
    <div class="about_home_body">
      <div v-if="appDetail" class="about_hero">
        <oort-image class="about_icon" :src="appDetail.icon_url" @click="showVConsole" />
        <span class="about_name">{{ appDetail.applabel }}</span>
        <span class="about_version">{{ $t('版本') }} {{ appDetail.version }}</span>
      </div>
      <div class="about_group">
        <van-cell :title="$t('版本说明')" is-link to="/versionsPage" />
        <van-cell :title="$t('联系我们')" is-link to="/contactUS" />
        <van-cell :title="$t('隐私政策')" is-link @click="openPrivacyPolicy" />
      </div>
      <div v-if="appDetail" class="about_footer">
        {{ $t('开发公司：') }}{{ appDetail.develop_unit }}
        <a class="about_icp" href="https://beian.miit.gov.cn/" target="_blank">粤ICP备19160414号-8A</a>
      </div>
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
    },
    openPrivacyPolicy() {
      // 隐私政策公网页址（与 App Store Connect 登记一致）
      window.location.href = 'https://oortcloudsmart.com/privacypolicy_vlstream.html'
    }
  }
}
</script>

<style lang="scss" scoped>
.about_page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vl-bg);
}

.about_home_body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 16px calc(24px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.about_hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0 32px;
}

.about_icon {
  width: 76px;
  height: 76px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
}

.about_name {
  margin-top: 16px;
  font-size: 20px;
  line-height: 28px;
  font-weight: 700;
  color: var(--vl-ink);
}

.about_version {
  margin-top: 6px;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 18px;
  color: var(--vl-text-2);
  background: var(--vl-surface);
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.about_group {
  background: var(--vl-surface);
  border-radius: var(--vl-radius);
  overflow: hidden;

  :deep(.van-cell) {
    padding: 16px;
    font-size: 15px;
    background: transparent;

    &::after {
      left: 16px;
      right: 16px;
      border-color: var(--vl-line);
    }
  }

  :deep(.van-cell__title) {
    text-align: left;
    font-weight: 500;
    color: var(--vl-ink);
  }
}

.about_footer {
  margin-top: auto;
  padding-top: 32px;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  color: var(--vl-text-3);
}

.about_icp {
  display: block;
  margin-top: 4px;
  color: var(--vl-text-3);
  text-decoration: none;
}
</style>
