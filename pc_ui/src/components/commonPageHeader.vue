<template>
  <div class="header_container flexRowAC">
    <div class="main_header_logos flexRowAC">
      <div v-if="props.config && !collapse" class="main_header_logos_item" @click="pcAppMarketFn">
        <oort-img style="height:2.19rem;width: auto" :src="props.config.logoWhite" />
        <span>{{ props.config.login_logo_text }}</span>
      </div>
      <div class="flexRowAC" @click="collapseChage">
        <oort-svg-icon v-if="!collapse" class="collapseImg" name="close_left" width="24" height="24" />
        <oort-svg-icon v-else class="collapseImg" name="open_left" width="24" height="24" />
      </div>
    </div>
    <common-page-header-right-info />
  </div>
</template>

<script lang='ts' setup>
import CommonPageHeaderRightInfo from './commonPageHeaderRightInfo.vue'
import { computed } from 'vue'
import { useCounter } from '@/store/counter'
import Config from '@/config/index'

const props = defineProps({
  config: {
    type: Object,
    default: null
  }
})

const storeC = useCounter()
const collapse = computed(() => storeC.collapse)
// 侧边栏折叠
const collapseChage = () => {
  storeC.collapse = !collapse.value
}

// 回到控制台
const pcAppMarketFn = () => {
  window.open(Config.URL.slice(0, -1) + Config.frontURLStr + '/console_manage/index.html#/pcAppMarket', '_blank')
}
</script>
<style lang='scss' scoped>
.collapse-btn {
  cursor: pointer;
  margin-left: 20px;
  margin-right: 24px;
}

.collapseImg {
  color: var(--el-color-primary);
  width: 28.57px;
  height: 25.14px;
  cursor: pointer;
}

.main_header_logos {
  height: 64px;

  .main_header_logos_item {
    display: flex;
    align-items: center;
    min-width: 260px;
    color: #fff;
    font-size: 20px;
    span {
      min-width: 100px;
      margin: 0 12px;
    }
  }
}

.header_container {
  flex: 1;
  height: 64px;
  min-height: 64px;
  padding: 0 20px;
  justify-content: space-between;
  background-color: var(--el-color-primary);
  /* background-color: #fff; */
}
</style>
