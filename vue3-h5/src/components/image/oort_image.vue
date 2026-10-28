<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2025-06-15 11:45:51
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <img
    :src="imageSrc"
    :class="{'defaultS': defaultStyle}"
    v-bind="$attrs"
    @error="imageError"
  />
</template>
``
<script setup>
import { watch, ref } from 'vue'
import Config from '@/config/index'
import defaultImg from '@/assets/img/default_pic.png'
import deptDefaultImg from '@/assets/img/dept_default.png'
import userDefaultImg from '@/assets/img/tx.png'
import featureImage from '@/assets/img/featureDefault.png'
import dituImage from '@/assets/img/dituDefault.png'
const props = defineProps({
  'src': {
    type: String,
    default: ''
  },
  'errorImg': {
    type: String,
    default: defaultImg
  },
  'defaultType': {
    type: String,
    default: ''
  }
})
let imageSrc = ref('')
let defaultStyle = ref(false)
watch(() => props.src, (val) => {
  if (!val) {
    imageError()
    return
  }
  // 只有 aPaaS 老对象存储的相对路径才需要改写域名；已经是完整 URL（例如单租户 S3 预签名事件图片）直接用
  const wj1 = val.split('/wj1/')
  const oortwj1 = val.split('/oortwj1/')
  if (val.includes('http') && wj1.length === 2) {
    imageSrc.value = Config.platformURL + Config.gateWay + 'wj1/' + wj1[1]
  } else if (val.includes('http') && oortwj1.length === 2) {
    imageSrc.value = Config.platformURL + Config.gateWay + 'oortwj1/' + oortwj1[1]
  } else {
    imageSrc.value = val
  }
}, { immediate: true })

function imageError() {
  defaultStyle.value = true
  if (props.defaultType === 'dept') {
    imageSrc.value = deptDefaultImg
  } else if (props.defaultType === 'user') {
    imageSrc.value = userDefaultImg
  } else if (props.defaultType === 'feature') {
    imageSrc.value = featureImage
  } else if (props.defaultType === 'ditu') {
    imageSrc.value = dituImage
  } else {
    imageSrc.value = defaultImg
  }
}

</script>

<style scoped>

.defaultS {
  width: 100%;
}

</style>
