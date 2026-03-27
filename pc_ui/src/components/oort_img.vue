<template>
  <img
    :src="imageSrc"
    v-bind="$attrs"
    :class="{'defaultS': defaultStyle}"
    @error="imageError"
  />
</template>

<script setup>
import { watch, ref } from 'vue'
import Config from '@/config/index'
import errorimg from '@/assets/img/default_pic.png'
import tx from '@/assets/img/tx.png'
import dept_default from '@/assets/img/dept_default.png'
const props = defineProps({
  'defaultImg': {
    type: String,
    default: 'errorimg'
  },
  'src': {
    type: String,
    default: ''
  },
  'errorImg': {
    type: String,
    default: errorimg
  }
})
let imageSrc = ref('')
let defaultStyle = ref(false)
watch(() => props.src, (val) => {
  imageSrc.value = val
})
if (props.src.includes('http')) {
  let arr = props.src.split('/oortwj1/')
  if (arr.length === 2) {
    // this.firstTemp++
    imageSrc.value = Config.URL + Config.gateWay + 'oortwj1/' + arr[1]
  }
} else {
  imageSrc.value = props.src
}

function imageError() {
  defaultStyle.value = true
  imageSrc.value = errorimg
  if (props.defaultImg === 'tx') imageSrc.value = tx
  if (props.defaultImg === 'dept') imageSrc.value = dept_default
}

</script>

<style scoped>

.defaultS {
  width: 100%;
}

</style>

