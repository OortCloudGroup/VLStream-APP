<template>
  <div class="feedbackRecordList-page">
    <div class="fkInfoBox flexRowAC">
      <!--审批记录-->
      <div v-if="work_order_data" class="main_item">
        <div class="main_item_name flexRowAC">
          <div class="line" />
          工单详情
        </div>
        <!--总表单-->
        <template v-if="formJson&&formJson.length">
          <div v-for="(item,i) in formJson" :key="i" class="preFormBox f">
            <v-form-container
              v-if="item"
              :disabled-mode="true"
              :form-json="item"
              :form-data="{}"
              :preview-state="false"
              :option-data="{}"
              :global-dsv="{}"
            />
          </div>
        </template>
        <div class="main_item_name flexRowAC">
          <div class="line" />
          处置记录
        </div>
        <approval-record
          v-if="historyProcNodeList&&historyProcNodeList.length"
          :history-proc-node-list="historyProcNodeList"
        />
      </div>
      <!-- 空态 -->
      <div v-if="!work_order_data" class="no_data">
        <img src="@/assets/img/daily_activity/no_data.png" />
        <span>暂无数据</span>
      </div>
    </div>
    <!--拒绝 同意-->
    <div class="buttons">
      <buttons-page
        v-if="procInsId"
        :work_order_data="work_order_data"
        :proc-ins-id="procInsId"
        :task-id="taskId"
        :opr-arr="oprArr"
        :start-flow="startFlow"
        @handle="getProcessDetail"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllContainerWidgets } from '@/utils/widgetList'
import { useUserStore } from '@/store/modules/useraPaas'
import { useRoute } from 'vue-router'
import { event_info } from '@/api/eventManagement'
import ApprovalRecord from '@/pages/VLStreamCloud/page/components/event/approvalRecord.vue'
import { detailProcess } from '@/api/processui'
import VFormContainer from '@/pages/VLStreamCloud/page/components/event/VFormContainer.vue'
import ButtonsPage from '@/pages/VLStreamCloud/page/components/event/buttonsPage.vue'
import config from '@/config'

const store = useUserStore()
const route = useRoute()
let work_order_data = ref('') // 工单记录
let procInsId = ref('') // 工单记录
let taskId = ref('') // 工单记录
const formJson = ref(null) // 表单数据
const formJsonSub = ref(null) // 子表单信息
const approverIds = ref([]) // 工单流程-所有人员id
const oprArr = ref([]) // 按钮-all
const historyProcNodeList = ref('') // 流转记录

// let preFormSubFlage = false
// 子表单-提交
// 校验表单值
const startFlow = async() => {
  return [{ flag: true, preFormSubTemp: {}}]
}

// 流程节点详情
const getProcessDetail = async() => {
  historyProcNodeList.value = ''
  const params = {
    procInsId: procInsId.value,
    taskId: taskId.value,
    // 调它的时候如果需要approverIds就加个参数includeApproverIds=true
    includeApproverIds: true
  }
  detailProcess(params).then((res) => {
    if (res.code === 200) {
      approverIds.value = res.data.approverIds || []
      oprArr.value = res.data?.buttonsMap?.buttonOprArr || []
      if (res.data.processFormList && res.data.processFormList.length > 0) {
        // 容器组件
        res.data.processFormList?.map(tt => {
          getAllContainerWidgets(tt.widgetList)
        })
        // 容器组件
        res.data.taskFormData?.map(tt => {
          getAllContainerWidgets(tt.widgetList)
        })
        formJson.value = res.data?.processFormList
        // 子表单
        formJsonSub.value = res.data?.taskFormData
      }
      if (res.data?.historyProcNodeList) {
        historyProcNodeList.value = res.data?.historyProcNodeList.reverse()
      }
    }
  })
}

// 任务事件-info
const event_listFn = async(id) => {
  let data = {
    accessToken: store.token,
    id: id
  }
  let res = await event_info(data)
  if (res.code === 200) {
    procInsId.value = res.data?.work_order_data?.procInsId
    taskId.value = res.data?.work_order_data?.taskId
    if (procInsId.value) await getProcessDetail()
    if (!res.data?.work_order_data) return
    let D = { ...res.data }
    let W = { ...res.data?.work_order_data }
    W.packageName = config.appInfo?.apppackage // h5包名
    W.groupName = W.title // 群名
    W.primaryKey = D.id // 唯一值（群聊里面跳转事件详情页）
    W.groupDesc = D.describe // 群描述
    W.creatorId = store.userInfo.userId // 群聊发起人ID
    W.taskTitle = W.processName // 任务名
    W.groupMembers = [
      store.userInfo.userId, D.uuid, // 登录人id
      ...D.uuids.map(tt => tt.uuid), // 事件执行人id
      W.userId, // 工单发起人id
      ...approverIds.value // 工单流程-所有人员id
    ] // ['zhangsan', 'lisi', 'wangwu']
    W.taskAssignee = W.createBy // taskAssignee
    W.taskDeadline = W.updateTime // taskDeadline
    W.summary = `工单发起人：${W.createBy} | 更新：${W.updateTime}` // 悬浮窗配置 自定义摘要
    work_order_data.value = W
  }
}

onMounted(() => {
  // 从路由参数中获取任务数据
  if (route.query.event_id) event_listFn(route.query.event_id)
})
</script>

<style scoped lang="scss">
.feedbackRecordList-page {
  height: calc(100vh - 126px);
  padding: 16px 0;
  overflow: auto;
}

.fkInfoBox {
  width: calc(100% - 32px);
  height: calc(100% - 82px);
  flex-direction: column;
  align-items: flex-start;
  padding: 0 16px 20px;
  overflow: auto;
}

// 暂无数据
.no_data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  width: 100%;

  img {
    width: 162px;
    height: auto;
  }

  span {
    margin: 4px 0;
    font-size: 16px;
    color: #999;
    text-align: center;
  }
}

.main_item {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background-color: #fff;
}

.main_item_name {
  //padding-top: 10px;
  .line {
    background: #3476FC;
    width: 3px;
    height: 14px;
    flex-shrink: 0;
    margin-right: 4px;
  }
}

// 表单
.preFormBox {
  &.f {
    border: 1px solid rgba(0, 0, 0, .1);
    //margin-top: 16px;
    //margin-bottom: 16px;
    margin: 16px 0;
  }

  :deep(.render-form.van-form) {
    background-color: #fff !important;

    .field-wrapper {
      margin: 0;
    }

    .field-wrapper:last-child .van-cell:after {
      display: none;
    }
  }
}

.buttons {
  position: relative;
  z-index: 1;
}
</style>
