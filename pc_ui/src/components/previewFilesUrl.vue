<template>
  <div class="flexRowAC" @click="handlePreview()">
    <slot name="url" />
  </div>
</template>

<script setup lang="ts">
import config from '@/config'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const props = defineProps(['url'])
const store: any = useUserStore()

// 文件预览
const handlePreview = () => {
  let filePath = props.url
  if (filePath) {
    // 使用完整的文件路径进行预览
    let imageSrc
    if (filePath.includes('http')) {
      let arr = filePath.split('/oortwj1/')
      if (arr.length === 2) {
        imageSrc = config.URL + config.gateWay + 'oortwj1/' + arr[1]
      }
    } else {
      imageSrc = filePath
    }
    let W = '?'
    if (filePath.includes('?')) W = '&'
    let appendStr = '&applyid=' + config.headers.applyID + '&appID=' + config.headers.appID + '&secretKey=' + config.headers.secretKey + '&requestType=' + config.headers.requestType

    let openUrl = imageSrc + W + 'accessToken=' + store.userInfo?.accessToken + appendStr + '&requestType=app'

    let previewURL = config.URL + config.gateWay + 'oortcloud-fileview' + '/onlinePreview?url=' + encodeURIComponent(btoa(encodeURI(openUrl))) + '&accessToken=' + store.userInfo?.accessToken + appendStr
    window.open(previewURL, '预览', 'autoHideMenuBar=true,icon=""')
  } else {
    ElMessage.warning('文件路径不存在')
  }
}
</script>

<style lang="scss" scoped>

</style>
