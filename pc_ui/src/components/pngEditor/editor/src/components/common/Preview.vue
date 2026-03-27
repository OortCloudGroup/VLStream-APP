<template>
  <el-dialog :title="!isSavePng ? '预览' : '保存'" draggable width="60%">
    <div class="es-preview-body">
      <div ref="editorRef" class="es-editor preview" :style="editorStyle">
        <template v-for="item in store.data.elements">
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
    </div>
    <div v-if="isSavePng" class="es-preview-tools">
      <el-button class="es-preview-tools_button" @click="cancel">
        取消
      </el-button>
      <el-button type="primary" @click="handleExport('png')">
        确定保存
      </el-button>
      <!-- <el-button type="primary" @click="handleExport('pdf')">
        导出PDF
      </el-button> -->
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import TextEditor from '../editor/TextEditor.vue'
import { computed, ref, defineEmits } from 'vue'
import html2canvas from 'html2canvas'
// import JsPdf from 'jspdf'
// import { dayjs } from 'element-plus'
import { pickStyle } from '../../utils'
import { useEditorStore } from '../../store'
import EsIcon from '../icon/icon.vue'
const store = useEditorStore()
const editorRef = ref<HTMLElement>()
const editorStyle = computed(() => {
  const { width, height } = store.data.container.style
  return {
    ...store.data.container.style,
    width: width + 'px',
    height: height + 'px',
    transform: `scale(${scaleRatio.value})`,
    transformOrigin: 'top left'
  }
})
const scaleRatio = computed(() => store.data.container?.scaleRatio || 1)

const props = defineProps({
  isSavePng: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '800x480'
  }
})

const emits = defineEmits(['cancel', 'savePng', 'save-click'])

function handleExport() {
  const width = props.size.split('x')[0]
  const height = props.size.split('x')[1]
  // const { width, height } = store.data.container.style
  // 生成文件名称
  // const filename = dayjs().format('YYYY-MM-DD') + '-es-drager-editor.' + type
  html2canvas(editorRef.value!, { scale: 1, width: width, height: height, useCORS: true, allowTaint: true }).then(canvas => {
    // if (type === 'pdf') {
    //   const doc = new JsPdf('l', 'pt', 'a4')
    //   const imageData = canvas.toDataURL()
    //   doc.addImage(imageData, 'PNG', 0, 0, +width!, +height!)
    //   return doc.save(filename)
    // }

    const imageData = canvas.toDataURL('image/png')

    emits('savePng', imageData)
    if (imageData) {
      emits('save-click')
    }

    // canvas.toBlob(blob => {
    //   // 创建a标签
    //   const link = document.createElement('a')
    //   link.download = filename
    //   // 创建临时url
    //   const href = URL.createObjectURL(blob!)
    //   link.href = href
    //   // 调用click
    //   link.click()
    //   // 销毁
    //   URL.revokeObjectURL(href)
    // })
  })
}

const cancel = () => {
  emits('cancel')
}

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
  padding: 10px;
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

</style>
