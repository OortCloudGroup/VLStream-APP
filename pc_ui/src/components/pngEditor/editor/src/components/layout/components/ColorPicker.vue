<template>
  <el-color-picker :popper-class="popperClassName" show-alpha :predefine="predefineColors" />
</template>

<script setup lang='ts'>
import { onMounted } from 'vue'
import { useId } from '../../../utils'

const popperClassName = useId() + '-picker'
const predefineColors = [
  '#FFFF00',
  '#FF0000',
  '#000000',
  '#FFFFFF',
]

onMounted(() => {
  const popper = document.querySelector(`.${popperClassName}`)
  if (popper) {
    // 阻止popper点击事件冒泡
    popper.addEventListener('click', (e) => e.stopPropagation())
  }
})
</script>

