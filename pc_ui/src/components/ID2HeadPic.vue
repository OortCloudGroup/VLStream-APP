<template>
  <img class="id2HeaOicImg" :src="srcUrl" :style="round?'border-radius: 100%':''" @error="showDefault" />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { getUserInfo } from '@/api/unifiedUsert/sso'
import defaultImage from '@/assets/img/tx.png'
import Config from '@/config'

const store: any = useUserStore()
const props = defineProps({
  src: {
    type: String,
    default: null
  },
  id: {
    type: String,
    required: true,
    default: ''
  },
  valueKey: {
    type: String,
    default: 'oort_name'
  },
  round: {
    type: Boolean,
    default: false
  }
})
let srcUrl = ref<any>(defaultImage)
const init = () => {
  let headerAppend = '?accessToken=' + store.userInfo.accessToken + '&secretKey=' + Config.headers.secretKey +
    '&appID=' + Config.headers.appID + '&requestType=' + Config.headers.requestType
  srcUrl.value = `${Config.URL + Config.gateWay}oortcloud-sso/photo/${props.id}${headerAppend}`
  if (props.src === null) {
    getUserInfoFn()
  } else {
    srcUrl.value = props.src
  }
}

// error
const showDefault = () => {
  srcUrl.value = defaultImage
}

// oort_photo
const getUserInfoFn = () => {
  // 是否vuex中已经存在这个用户，避免重复请求
  if (store.userListStore[props.id]) {
    srcUrl.value = store.userListStore[props.id].oort_photo
    return
  }
  let data = {
    accessToken: store.userInfo.accessToken,
    oort_uuid: props.id
  }
  data['hideLoading'] = true
  getUserInfo(data).then((res: any) => {
    if (res.code === 200) {
      store.addUser(res.data.userInfo)
      if (res.data.userInfo.oort_photo) {
        srcUrl.value = res.data.userInfo.oort_photo
      }
    }
  })
}

watch(() => props.id, () => {
  init()
})

onMounted(() => {
  init()
})

</script>

<style lang="scss" scoped>
.id2HeaOicImg {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
}
</style>
