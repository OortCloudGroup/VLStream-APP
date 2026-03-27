<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2025-03-26 16:06:39
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="pover_right">
    <div class="pover_apps">
      <div v-for="(item,index) in appList" :key="index" class="pover_apps_item" @click="gotoApp(item)">
        <oort-img v-if="item.icon_url" :src="item.icon_url" />
        <img v-else src="../assets/img/login/icon_user.png" alt="" />
        <div class="pover_apps_item_name">
          {{ item.applabel }}
        </div>
      </div>
      <div v-if="appList.length === 0" class="no_data">
        <img src="../assets/img/no_app_list.png" alt="" />
        <span>
          暂无应用
        </span>
      </div>
      <!-- <div class="pover_apps_item">
        <img src="../assets/img/login/icon_user.png" alt="" />
        <div class="pover_apps_item_name">
          个人中心
        </div>
      </div>
      <div class="pover_apps_item">
        <img src="../assets/img/login/icon_user.png" alt="" />
        <div class="pover_apps_item_name">
          生产力平台
        </div>
      </div>
      <div class="pover_apps_item">
        <img src="../assets/img/login/icon_user.png" alt="" />
        <div class="pover_apps_item_name">
          云盘
        </div>
      </div>
      <div class="pover_apps_item">
        <img src="../assets/img/login/icon_user.png" alt="" />
        <div class="pover_apps_item_name">
          VLStream
        </div>
      </div> -->
    </div>
    <!-- 更多应用跳转到门户 -->
    <div class="more_apps">
      <div class="more_apps_tips" @click="pcAppMarketFn">
        <span>更多应用</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

import { myPcList } from '@/api/admin_platform/index'
import { useUserStore } from '@/store/modules/user'
const store = useUserStore()
const appList = ref([])
const getMyPCAppList = async() => {
  const params = {
    accessToken: store.token,
    uuid: store.userInfo.oort_uuid,
    pageNum: 1,
    pageSize: 999
  }
  let res = await myPcList(params)
  if (res.code === 200) {
    let tempArr = res.data.list || []
    tempArr.forEach(item => {
      item.app_list.forEach(itd => {
        if (appList.value.length < 9) {
          appList.value.push(itd)
        }
      })
    })
  }
}

import useGoWhere from '@/hooks/useGoWhere'
import { verifyToken } from '@/api/login/index'
import Config from '@/config'
// 平台应用
const gotoApp = async(item) => {
  // 校验token
  const params = {
    accessToken: store.token
  }
  let res = await verifyToken(params)
  if (res.code !== 200) {
    ElMessage.warning('用户信息失效， 请重新登录')
    useGoWhere().goWhere()
    return
  }
  const tempObj = {
    accessToken: store.token,
    fromWhere: 'console_manage'
  }
  window.sessionStorage.setItem('tempObj', JSON.stringify(tempObj))
  let appendStr = '?accessToken=' + store.token + '&fromWhere=console_manage'
  if (item.apk_url.indexOf('?') !== -1) {
    appendStr = '&accessToken=' + store.token + '&fromWhere=console_manage'
  }
  if (item.apk_url.includes('http') || item.apk_url.includes('//')) {
    window.open(item.apk_url + appendStr)
  } else {
    window.open(Config.URL.slice(0, -1) + Config.frontURLStr + item.apk_url + appendStr)
  }
}

// 回到首页 即门户
const pcAppMarketFn = () => {
  window.open(Config.URL.slice(0, -1), '_blank')
}
onMounted(() => {
  getMyPCAppList()
})

</script>

<style lang="scss" scoped>

pover_right {
  border-radius: 10px;
  background-color: #EDF3F9;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.pover_apps {
  display: flex;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 98%;
  background-color: #fff;
  border-radius: 10px;
}

.pover_apps_item:hover {
  background-color: #EDF3F9;
  border-radius: 10px;
}

.pover_apps_item {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 6px;
  justify-content: center;
  cursor: pointer;
  img {
    width: 40px;
    height: 40px;
    border-radius: 100%;
    margin: 8px 0px;
    margin-top: 4px;
  }
  &_name {
    height: 32px;
    padding: 2px 10px;
    font-size: 16px;
    color: #575656;
    line-height: 18px;
    text-align: center;
  }
}

.pover_more {
  width: 98%;
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
}

.pover_more_item:hover{
  background-color: #EDF3F9;
  border-radius: 10px;
}

.pover_more_item {
  display: flex;
  flex-direction: column;
  min-height: 32px;
  background-color: #fff;
  margin: 4px 8px;
  padding: 8px 12px;
  &_title {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    span {
      font-size: 16px;
      color: #575656;
    }
  }
  &_content {
    display: flex;
    border-top: 1px solid #fdfdfd;
  }

}

.more_apps {
  height: 48px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more_apps_tips {
  border-radius: 136px 136px 136px 136px;
  border: 1px solid #2278FF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:2px 12px;
  cursor: pointer;
  span {
    color: #2278FF;
    font-size: 18px;
  }
}

.theme_predefine {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
  &_item {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #f8f8f9;
  }

  &_item:hover {
    border: 1px solid #464646;
  }
}

.el-icon {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.rotate-icon {
  transform: rotate(90deg);
}

:deep(.el-color-picker) {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #f8f8f9;
}

:deep(.el-color-picker__trigger) {
  width: 100%!important;
  height: 100%!important;
  padding: 0px;
  border: none;
  border-radius: 4px;
}

.no_data {
  width: 100%;
  height: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 6px;
  justify-content: center;
  cursor: pointer;
  img {
    width: 160px;
    height: auto;
    border-radius: 100%;
    margin: 8px 0px;
  }
  span {
    margin-top: 10px;
    font-size: 16px;
    color: #999;
  }
}

</style>
