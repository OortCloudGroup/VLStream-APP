<template>
  <div class="es-preview-body">
    <div v-show="!base64Img" ref="editorRef" class="es-editor preview" :style="editorStyle">
      <template v-for="item in data.elements">
        <!-- eslint-disable-next-line vue/valid-v-for -->
        <EsIcon
          v-if="item.component === 'EsIcon'"
          :icon="item.props.icon"
          :element="item"
          v-bind="item.props"
          :style="{
            ...pickStyle(item.style, false),
            width: item.width + 'px',
            height: item.height + 'px',
            position: 'absolute',
            left: item.left + 'px',
            top: item.top + 'px'
          }"
        />
        <!-- eslint-disable-next-line vue/valid-v-for -->
        <component
          :is="item.component!"
          v-bind="item.props"
          :style="{
            ...pickStyle(item.style, false),
            width: item.width + 'px',
            height: item.height + 'px',
            position: 'absolute',
            left: item.left + 'px',
            top: item.top + 'px'
          }"
        >
          <TextEditor v-if="item.text" :text="item.text" :style="pickStyle(item.style)" />
        </component>
      </template>
    </div>
    <img v-if="base64Img" class="basePreview" :src="base64Img" />
  </div>
  <!-- <div v-if="isSavePng" class="es-preview-tools">
    <el-button class="es-preview-tools_button" @click="cancel">
      取消
    </el-button>
    <el-button type="primary" @click="handleExport('png')">
      确定保存
    </el-button>
  </div> -->
</template>

<script setup lang="ts">
import TextEditor from '../editor/TextEditor.vue'
import { computed, ref, onMounted } from 'vue'
import html2canvas from 'html2canvas'
import { pickStyle } from '../../utils'
import EsIcon from '../icon/icon.vue'
const editorRef = ref<HTMLElement>(null)

const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  isSavePng: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '800x480'
  }
})

const editorStyle = computed(() => {
  const { width, height } = props.data.container.style
  return {
    ...props.data.container.style,
    width: width + 'px',
    height: height + 'px',
    transform: `scale(${scaleRatio.value})`,
    transformOrigin: 'top left'
  }
})
const scaleRatio = computed(() => props.data.container?.scaleRatio || 1)

const emits = defineEmits(['saveBase64'])

const handleExport = async() => {
  const width = props.size.split('x')[0]
  const height = props.size.split('x')[1]
  // const { width, height } = store.data.container.style
  // 生成文件名称
  // const filename = dayjs().format('YYYY-MM-DD') + '-es-drager-editor.' + type
  let canvas = await html2canvas(editorRef.value!, { scale: 1, width: width, height: height, useCORS: true, allowTaint: true })
  // if (type === 'pdf') {
  //   const doc = new JsPdf('l', 'pt', 'a4')
  //   const imageData = canvas.toDataURL()
  //   doc.addImage(imageData, 'PNG', 0, 0, +width!, +height!)
  //   return doc.save(filename)
  // }
  const imageData = canvas.toDataURL('image/png')
  emits('saveBase64', imageData)
  return imageData
}

const base64Img = ref('')

onMounted(async() => {
  base64Img.value = await handleExport()
})

defineExpose({
  handleExport
})

</script>

<style lang="scss" scoped>
.es-editor {
  &.preview {
    margin: 0 auto;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.10);
    position: relative;

    .es-drager.disabled {
      opacity: 1;
    }
  }
}

.es-preview-body {
  padding: 2px;
  width: 100%;
  border: var(--es-border);
  background-color: #fff;
}

.es-preview-tools {
  display: flex;
  justify-content: flex-end;
  height: 60px;
  align-items: center;
}

.basePreview {
  width: 100%;
  height: 100%;
}
</style>
