<template>
  <div class="page-container flexRowAC">
    <template v-if="headerSid">
      <v-sidebar v-if="finish" />
    </template>
    <div class="content_box" :class="{ 'content_collapse': collapse }">
      <common-page-header :coll="headerSid" :config="uiConfig.cameraMana" @handle="headerClick" />
      <div v-if="finish" class="content" :class="{pl20:!headerSid}">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import uiConfig from '@/config/UIConfig'
import VSidebar from './components/sidebar.vue'
// import { ElMessage, ElMessageBox } from 'element-plus'
// import { useUserStore } from '@/store/modules/user'
import { useCounter } from '@/store/counter'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'
import CommonPageHeader from './components/commonPageHeader.vue'
// import { getUserInfo } from '@/api/login'
// import { getToken, removeToken } from '@/utils/cache/cookies'

const finish = ref(true)
const headerSid = ref(true)
// const store: any = useUserStore()
const router = useRouter()
const storeC: any = useCounter()
const collapse = computed(() => storeC.collapse)
// let accessToken = getToken()
// if (accessToken) {
//   store.versionToken().then(() => {
//     finish.value = true
//     const data = {
//       accessToken: accessToken,
//       oort_uuid: store.userInfo.oort_uuid
//     }
//     getUserInfo(data).then((res: any) => {
//       store.userInfo = { ...store.userInfo, ...res.data.userInfo }
//       finish.value = true
//     })
//   }).catch((err: any) => {
//     removeToken()
//     ElMessage.error(err.msg)
//     router.push('/')
//   })
// } else {
//   ElMessageBox.alert('登录信息失效，请重新登录', '提示', {
//     confirmButtonText: '确定',
//     callback: () => {
//       removeToken()
//       router.push('/')
//     }
//   })
// }

// 配置
const sidebarPaths = [
  '/system',
  '/upgrade',
  '/security',
  '/user',
  '/basic',
  '/advance',
  '/audio',
  '/messRecord',
  '/PTZ',
  '/events',
  '/smart',
  '/plan',
  '/storage'
]
headerSid.value = sidebarPaths.includes(router.currentRoute.value.path)
const headerClick = (val) => {
  headerSid.value = val
}
</script>
<style lang="scss">
.page-container {
  gap: 20px;
  align-items: flex-start;
  height: 100vh;
  width: 100%;
  background-image: url("@/assets/img/camera/bg.png");
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: top left;
  color: #000;
}

.content_box {
  flex: 1;
  height: 100%;

  .content {
    padding-right: 20px;
    height: calc(100% - 64px);
    overflow: auto;
  }
}

.content_collapse {
  width: 100%;
}

.content.pl20 {
  padding-left: 20px;
}
</style>
