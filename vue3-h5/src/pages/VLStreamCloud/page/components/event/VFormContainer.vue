<template>
  <vm-form-render
    ref="preForm"
    :form-json="formJson"
    :form-data="{}"
    :preview-state="false"
    :option-data="{}"
    :global-dsv="{}"
  />
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  formJson: {
    type: Object,
    required: true
  },
  formData: {
    type: Object,
    required: true
  },
  previewState: {
    type: Boolean,
    required: true
  },
  optionData: {
    type: Object,
    required: true
  },
  globalDsv: {
    type: Object,
    required: true
  },
  nodeFormProperties: {
    type: Object
  }
})

const formJson = ref(props.formJson)
const preForm = ref(null)

onMounted(() => {
  // 禁用表单
  if (formJson.value) {
    // TODO 禁用表单
    nextTick(() => {
      preForm.value?.disableForm()
    })
  }
})

</script>
