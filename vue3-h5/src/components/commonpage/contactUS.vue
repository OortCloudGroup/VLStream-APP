<!--
 * @Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2025-05-22 11:03:05
 * @Last Modified by:  兰舰
 * @Copyright 奥尔特云(深圳)智慧科技 aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="page_container contact_page">
    <nav-header-banner :title="$t('联系我们')" />
    <div class="contactUS_body">
      <div class="contact_group">
        <div class="contact_item">
          <span class="contact_icon"><van-icon name="service-o" /></span>
          <span class="contact_main">
            <span class="contact_label">{{ $t('技术支持：') }}</span>
            <span class="contact_value">zhanglimin@oortcloudsmart.com</span>
          </span>
        </div>
        <div class="contact_item">
          <span class="contact_icon"><van-icon name="setting-o" /></span>
          <span class="contact_main">
            <span class="contact_label">{{ $t('运维支持：') }}</span>
            <span class="contact_value">zhanglimin@oortcloudsmart.com</span>
          </span>
        </div>
      </div>
      <div class="contact_group">
        <a
          v-for="link in links"
          :key="link.url"
          class="contact_item is-link"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="contact_icon"><van-icon :name="link.icon" /></span>
          <span class="contact_main">
            <span class="contact_label">{{ link.label }}</span>
            <span class="contact_value">{{ link.url }}</span>
          </span>
          <van-icon class="contact_arrow" name="arrow" />
        </a>
      </div>
      <div v-if="appInfo?.develop_unit" class="contact_footer">
        {{ appInfo.develop_unit }}
      </div>
    </div>
  </div>
</template>

<script>
import NavHeaderBanner from '@/components/navHeaderBanner/index'
import config from '@/config'
export default {
  name: 'ContactUS',
  components: { NavHeaderBanner },
  data() {
    return {
      appInfo: config.appInfo,
      links: [
        { label: this.$t('官方网站'), icon: 'browsing-history-o', url: 'https://vls.oortcloudsmart.com/zh/' },
        { label: 'GitHub', icon: 'cluster-o', url: 'https://github.com/OortCloudGroup/VLStream-Cloud' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.contact_page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vl-bg);
}

.contactUS_body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.contact_group {
  background: var(--vl-surface);
  border-radius: var(--vl-radius);
  overflow: hidden;

  & + & {
    margin-top: 12px;
  }
}

.contact_item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: inherit;
  text-decoration: none;

  & + &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 68px;
    right: 16px;
    height: 1px;
    background: var(--vl-line);
  }

  &.is-link:active {
    background: var(--vl-surface-2);
  }
}

.contact_icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--vl-primary);
  background: #ffffff;
  border-radius: 50%;
}

.contact_main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.contact_label {
  font-size: 12px;
  line-height: 18px;
  color: var(--vl-text-2);
}

.contact_value {
  margin-top: 2px;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: var(--vl-ink);
  word-break: break-all;
}

.contact_arrow {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--vl-text-3);
}

.contact_footer {
  margin-top: auto;
  padding-top: 32px;
  text-align: center;
  font-size: 12px;
  color: var(--vl-text-3);
}
</style>
