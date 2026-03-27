<template>
  <img :src="calcFileType(props.data)" alt="" />
</template>

<script setup>
import jugeFileType from '@/utils/jugeFileType'
import file from '@/assets/img/filesType/file.png'
import z from '@/assets/img/filesType/7z.png'
import aep from '@/assets/img/filesType/aep.png'
import ai from '@/assets/img/filesType/ai.png'
import apk from '@/assets/img/filesType/apk.png'
import doc from '@/assets/img/filesType/doc.png'
import excel from '@/assets/img/filesType/excel.png'
import mov from '@/assets/img/filesType/mov.png'
import mp3 from '@/assets/img/filesType/mp3.png'
import mp4 from '@/assets/img/filesType/mp4.png'
import pdf from '@/assets/img/filesType/pdf.png'
import pic from '@/assets/img/filesType/pic.png'
import ppt from '@/assets/img/filesType/ppt.png'
import psd from '@/assets/img/filesType/psd.png'
import rar from '@/assets/img/filesType/rar.png'
import ttf from '@/assets/img/filesType/ttf.png'
import txt from '@/assets/img/filesType/txt.png'
import word from '@/assets/img/filesType/word.png'
import xls from '@/assets/img/filesType/xls.png'
import zip from '@/assets/img/filesType/zip.png'

const props = defineProps({
  'data': {
    type: String,
    default: ''
  }
})

function fileTypeUrL(val) {
  if (val === 'z') return z
  if (val === 'aep') return aep
  if (val === 'ai') return ai
  if (val === 'apk') return apk
  if (val === 'doc') return doc
  if (val === 'excel') return excel
  if (val === 'mov') return mov
  if (val === 'mp3') return mp3
  if (val === 'mp4') return mp4
  if (val === 'pdf') return pdf
  if (val === 'pic') return pic
  if (val === 'ppt') return ppt
  if (val === 'psd') return psd
  if (val === 'rar') return rar
  if (val === 'ttf') return ttf
  if (val === 'txt') return txt
  if (val === 'word') return word
  if (val === 'xls') return xls
  if (val === 'zip') return zip
}

function calcFileType(value) {
  let fileType = jugeFileType(value)
  if (!!fileType) {
    return fileTypeUrL(fileType)
  } else {
    return file
  }
}

watch(() => props.data, (val) => {
  if (val) calcFileType(val)
}, { immediate: true })
</script>

<style scoped>
img {
  height: 48px;
  width: auto;
  background-size: cover;
}
</style>

