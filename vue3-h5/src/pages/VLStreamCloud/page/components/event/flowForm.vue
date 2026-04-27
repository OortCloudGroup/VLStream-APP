<template>
  <div class="eventItem">
    <div class="eventItem_c flexRowAC" @click="workPicker=true">
      <img src="@/assets/img/eventMana/work.png" alt="" />
      <span class="title">工单名称</span>
      <img class="arrow-icon" src="@/assets/img/ancientTrees/biaodan-icon-tiaozhuan.png" />
    </div>
    <div class="e_r locationBox flexRowAC">
      <span class="red">*</span>
      <van-field
        v-model="form.processName"
        class="location"
        autosize
        readonly
        clearable
        placeholder="请选择工单"
      />
    </div>
    <!--选择工单-->
    <van-popup v-model:show="workPicker" position="bottom">
      <van-picker
        :columns="options"
        title="选择工单"
        value-key="text"
        :columns-field-names="{ text: 'modelName', value: 'modelKey' }"
        @cancel="workPicker = false"
        @confirm="workConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listModel } from '@/api/processui'

const props = defineProps(['listObj'])
let workPicker = ref(false)// 选择工单
let options = ref([]) // 选择工单
const appObj = ref(null)
const vmFormRef = ref(null)
const selectedOptions_1 = ref('')
let form = reactive({
  processKey: props.listObj?.work_order_data?.processKey,
  processName: props.listObj?.work_order_data?.processName,
  work_order_data: props.listObj?.work_order_data || undefined
})

// 选择工单
const workConfirm = ({ selectedOptions }) => {
  form.processName = selectedOptions?.[0]?.label
  form.processKey = selectedOptions?.[0]?.value
  selectedOptions_1.value = selectedOptions?.[0] || undefined
  workPicker.value = false
}

// 工单-列表（流程管理-事件管理）
const workListFn = async() => {
  try {
    const appObjStr = window.sessionStorage.getItem('taskCenterClassify')
    appObj.value = appObjStr ? JSON.parse(appObjStr) : null
    const data = {
      pageNum: 1,
      pageSize: 99,
      workOrderCategory: appObj.value?.appId
    }
    const res = await listModel(data)
    if (res?.code === 200 && res?.rows) {
      options.value = res.rows.map((item) => ({
        ...item,
        label: item.modelName,
        value: item.modelKey
      }))
      form.processName = options.value.find(tt => tt.value === form.processKey)?.label
    }
  } catch (error) {
    // 获取工单列表失败，使用空数组
    options.value = []
  }
}

onMounted(() => {
  workListFn() // 流程管理-事件管理
})

defineExpose({ form, vmFormRef, appObj, selectedOptions_1 })
</script>

<style lang="scss" scoped>
.eventItem {

  padding: 16px 16px 0;
  background-color: #fff;

  img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .title {
    font-family: OPPOSans-M;
    font-size: 12px;
    color: #999999;
    letter-spacing: 0;
    font-weight: 500;
  }
}

.eventItem {
  &.Top {
    margin-top: 8px;
  }

  img.add {
    width: 32px;
    height: 32px;
  }
}

.red {
  padding-top: 3px;
  color: red;
}

.locationBox {
  align-items: flex-start;
  margin-left: 30px;
  padding: 16px 0;

  .location {
    padding: 0;
    border-bottom: 1px solid #D8D8D8;
  }
}

.vf_content {
  background-color: #F5F6F8;
  display: flex;
  flex-direction: column;
  overflow: auto;
  color: #333;
  padding: 4px 0 10px;
}
</style>
