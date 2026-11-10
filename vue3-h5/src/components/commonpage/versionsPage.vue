<!--
 * @Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2025-05-22 11:02:44
 * @Last Modified by:  兰舰
 * @Copyright 奥尔特云(深圳)智慧科技 aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="page_container versions_page">
    <nav-header-banner :title="$t('文档说明')" />
    <div class="edition_home_body">
      <div v-for="(item, index) in list" :key="index" class="version_card">
        <div class="version_head">
          <span class="version_no">{{ item?.version }}</span>
          <span class="version_title">{{ $t('版本介绍') }}</span>
        </div>
        <div class="version_desc">
          {{ item?.ver_description || $t('暂无数据') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavHeaderBanner from '@/components/navHeaderBanner/index'
import config from '@/config'
export default {
  name: 'VersionsPage',
  components: { NavHeaderBanner },
  data() {
    return {
      list: [{
        version: config?.appInfo?.version,
        ver_description: config?.appInfo?.ver_description
      }]
    }
  }
}

</script>

<style lang="scss" scoped>
.versions_page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--vl-bg);
}

.edition_home_body {
  flex: 1;
  min-height: 0;
  padding: 12px 16px calc(24px + env(safe-area-inset-bottom));
  overflow-y: auto;
}

.version_card {
  margin-bottom: 12px;
  padding: 16px;
  background: var(--vl-surface);
  border-radius: var(--vl-radius);
}

.version_head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.version_no {
  padding: 2px 10px;
  font-size: 13px;
  line-height: 20px;
  font-weight: 700;
  color: var(--vl-primary);
  background: var(--vl-primary-soft);
  border-radius: 999px;
  font-variant-numeric: tabular-nums;

  &:empty {
    display: none;
  }
}

.version_title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: var(--vl-ink);
}

.version_desc {
  margin-top: 10px;
  font-size: 13px;
  line-height: 22px;
  color: var(--vl-text-2);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
