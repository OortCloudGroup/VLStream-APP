<template>
  <div class="buttonsPage buttons">
    <div class="btn_op_box flexRowAC">
      <div class="btn_op_item ic i1 flexRowAC" @click="groupChat">
        <img class="btn_op_img" src="@/assets/img/process-flow/group.png" alt="" />
        发起群聊
      </div>
      <div class="btn_op_item ic i2 flexRowAC" @click.stop="uniPopupRef=true">
        <img class="btn_op_img" src="@/assets/img/process-flow/more.png" alt="" />
        更多
      </div>
      <div
        v-if="oprArrTemp.includes('4')"
        class="btn_op_item i_bor flexRowAC"
        @click="showSub=true,approveStatus='4'"
      >
        <img class="btn_op_img" src="@/assets/img//process-flow/btn1.png" alt="" />
        拒绝
      </div>
      <div
        v-if="oprArrTemp.includes('0')"
        class="btn_op_item i_bor bl flexRowAC"
        @click="showSub=true,approveStatus='0'"
      >
        <img class="btn_op_img" src="@/assets/img/process-flow/btn2.png" alt="" />
        同意
      </div>
    </div>
    <!-- 其他流程 -->
    <van-popup v-model:show="uniPopupRef" position="bottom" style="z-index: 2003">
      <div class="otherBtnsBox">
        <div v-if="oprArrTemp.includes('2')" class="btn" @click="turnTo">
          转办
        </div>
        <div v-if="oprArrTemp.includes('1')" class="btn" @click="delegate">
          委派
        </div>
        <div v-if="oprArrTemp.includes('3')" class="btn" @click="toSpecifiedNode">
          退回节点
        </div>
        <!--  已处理    -->
        <template v-if="route.query.act==='finish'">
          <div class="btn fin" @click="handleCallBack">
            撤回
          </div>
        </template>
        <!-- 已发起的流程 -->
        <template v-if="route.query.act==='own'">
          <!-- 完成时间为空-强制关闭 -->
          <div v-if="route.query.status !== 'canceled' && !route.query.FT" class="btn ora" @click="handleCancel()">
            强制关闭
          </div>
          <!-- 重新发起 -->
          <div v-else class="btn ora" @click="handleReStart()">
            重新发起
          </div>
          <!-- 完成时间-删除 -->
          <div v-if="route.query.FT" class="btn red" @click="handleDelete">
            删除
          </div>
        </template>
      </div>
    </van-popup>
    <!--  同意,拒绝  -->
    <agree-reject-btn
      v-if="showSub"
      class="bp_agree-reject-btn"
      :return-task-list="returnTaskList"
      :act="approveStatus"
      :show-sub="showSub"
      @close="showSub=false"
      @handle="submitTask"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { showConfirmDialog, showFailToast, showSuccessToast, showToast } from 'vant'
import {
  claimTask,
  completeTask,
  delegateTask, deleteProcess,
  rejectTask,
  returnTask, revokeProcess, stopProcess,
  transferTask,
  unClaimTask
} from '@/api/processui'
import { useRoute } from 'vue-router'
import AgreeRejectBtn from '@/pages/VLStreamCloud/page/components/event/agreeRejectBtn.vue'
import { useRouter } from 'vue-router'
import { returnList } from '@/api/processui'
import { getUserList } from '@/api/login/indexapaas'
import { useUserStore } from '@/store/modules/useraPaas'

const store = useUserStore()
let props = defineProps(['startFlow', 'oprArr', 'procInsId', 'taskId', 'work_order_data'])
const emits = defineEmits(['handle'])
const route = useRoute()
const router = useRouter()
let approveStatus = ref(NaN)// 状态
let showSub = ref(false)// 同意,拒绝dialog
let uniPopupRef = ref(false)// 其他
let oprArrTemp = ref(props.oprArr || '') // 按钮
let returnTaskList = ref([]) // 可退回的节点
let groupMembersTemp = ref([]) // 群聊人员
let creatorId = ref() // 群聊发起人ID

/* // 获取按钮
const getOprBtns = async() => {
  let res = await getApprovalButton('')
  buttonsArr.value = (res.data || [])
} */

// 发起群聊-用户列表
const getUserListFn = async() => {
  let val = props.work_order_data
  let groupMembers = props.work_order_data.groupMembers
  if (groupMembers && groupMembers.length > 1) {
    let data = {
      accessToken: store.token,
      user_id: groupMembers
    }
    let res = await getUserList(data)
    if (res.code === 200) {
      let list = res.data.list
      if (list && list.length) {
        groupMembersTemp.value = list.map(tt => {
          if (val.creatorId === tt.user_id) {
            creatorId.value = tt.im_user_info.im_user_id
          }
          return tt.im_user_info.im_user_id
        })
      }
    }
  }
}

// 发起群聊
const groupChat = () => {
  let val = props.work_order_data
  window.cordova.exec(
    () => {
      console.log(222)
      // resolve(res)
    },
    () => {
      // reject()
      console.log('openMessage error')
    },
    'ChatPlugin',
    'createTaskGroupChat',
    [{
      groupName: val.groupName + '交流群',
      groupMembers: groupMembersTemp.value, // ['zhangsan', 'lisi', 'wangwu']
      groupDesc: val.groupDesc + '事件工单交流群',
      groupType: 'normal',
      groupCallBackURL: '',
      creatorId: creatorId.value, // 发起人ID
      taskUniqueKey: val.packageName, // 任务唯一标识 // 'com.oort.msg'
      // 任务核心数据
      taskRelation: {
        taskId: val.primaryKey,
        taskType: 'APPROVAL',
        taskStatus: 'TODO',
        taskTitle: val.taskTitle + '审批',
        taskAssignee: val.taskAssignee,
        taskDeadline: val.taskDeadline,
        taskActionUrl: 'https://oa.example.com/approval/002'
      },
      // 悬浮窗配置（核心：title/summary/keyValueList）
      floatWindowConfig: {
        show: true,
        collapsible: true,
        defaultState: 'expand',
        position: 1, // 1-右上角 2-右下角
        title: val.title, // 自定义标题
        summary: val.summary, // 自定义摘要
        keyValueList: [ // 自定义展示键值对
          // { key: '预算金额', value: '10000元', show: true },
          // { key: '审批类型', value: '财务审批', show: true },
          // { key: '项目编号', value: 'PROJ-A-2025', show: true }
        ]
      }
    }]
  )
}

// 委派
const delegate = () => {
  showSub.value = true
  approveStatus.value = '1'
}

// 转办
const turnTo = () => {
  showSub.value = true
  approveStatus.value = '2'
}

// 回到指定节点
const toSpecifiedNode = () => {
  showSub.value = true
  approveStatus.value = '3'
}

// 可退回的节点
const getReturnList = async() => {
  const params = {
    procInsId: route.query.pid || props.procInsId,
    taskId: route.query.tid || props.taskId
  }
  returnList(params).then(res => {
    if (res.code === 200) {
      returnTaskList.value = res.data || []
    }
  })
}

// 撤回流程
const handleCallBack = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认撤回此流程吗?'
  }).then(async() => {
    let data = {
      procInsId: route.query.pid || props.procInsId,
      taskId: route.query.tid || props.taskId
    }
    let res = await revokeProcess(data)
    if (res.code === 200) {
      // 返回
      showSuccessToast('流程撤回成功')
      emits('handle')
    } else {
      showFailToast(res.msg)
    }
  }).catch(() => {
    // on cancel
  })
}

// 强制关闭
const handleCancel = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认强制关闭此流程吗?'
  }).then(async() => {
    let data = {
      procInsId: route.query.pid || props.procInsId
    }
    let res = await stopProcess(data)
    if (res.code === 200) {
      // 返回
      showSuccessToast('流程关闭成功')
      emits('handle')
    } else {
      showFailToast(res.msg)
    }
  }).catch(() => {
    // on cancel
  })
}

// 重新发起
const handleReStart = () => {
  router.push({
    path: 'flowForm',
    query: {
      id: route.query.id,
      pid: route.query.pid,
      fkey: route.query.fkey,
      fid: route.query.fid,
      title: route.query.title
    }
  })
}

// 删除流程
const handleDelete = () => {
  showConfirmDialog({
    title: '提示',
    message: '确认删除此流程吗?'
  }).then(async() => {
    let data = {
      procInsId: route.query.pid || props.procInsId
    }
    let res = await deleteProcess(data)
    if (res.code === 200) {
      // 返回
      showSuccessToast('流程删除成功')
      emits('handle')
    } else {
      showFailToast(res.msg)
    }
  }).catch(() => {
    // on cancel
  })
}

// 按钮事件
const submitTask = async(data) => {
  // 数据
  let flag = data.approveStatus
  let nextUserIds = data.nextUserIds
  let copyUserIds = data.copyUserIds
  let personList = data.personList
  let approveOpinion = data.approveOpinion
  let targetKey = data.targetKey
  // 提交
  let taskId = route.query.tid || props.taskId
  let procInsId = route.query.pid || props.procInsId
  let formSubTemp = await props.startFlow()
  for (let key in formSubTemp) {
    let tt = formSubTemp[key]
    if (tt && !tt.flag) {
      return tt.flag
    }
  }
  // flag 0 同意 ，1委派 ， 2 转办 ，3退回 ，4拒绝 5指派 6接单 7退单 8提交回访记录  9验收通过 10验收不通过
  let params = {
    taskId: taskId, // 任务Id
    procInsId: procInsId, // 流程实例Id
    comment: approveOpinion, // 审批意见
    nextUserIds: nextUserIds.map(item => item.user_id).join(','), // 下一节点审批人
    copyUserIds: copyUserIds.map(item => item.user_id).join(',') // 抄送用户Id
  }
  // 子表单
  if (formSubTemp && formSubTemp.length) {
    params['variables'] = formSubTemp[0].preFormSubTemp
  }
  let res = null
  // 同意
  if (flag === '0') {
    res = await completeTask(params)
  }
  // 委派
  if (flag === '1') {
    if (!personList || !personList.length) return showToast('请选择委派人')
    params.userId = personList.map(item => item.user_id).join(',')
    res = await delegateTask(params)
  }
  // 转办
  if (flag === '2') {
    if (!personList || !personList.length) return showToast('请选择转办人')
    params.userId = personList.map(item => item.user_id).join(',')
    res = await transferTask(params)
  }
  // 退回节点
  if (flag === '3') {
    if (!targetKey) return showToast('请选择可退回的节点')
    params['targetKey'] = targetKey
    res = await returnTask(params)
  }
  // 拒绝
  if (flag === '4') {
    res = await rejectTask(params)
  }
  // 接单-签收
  if (flag === '6') {
    res = await claimTask(params)
  }
  // 7退单
  if (flag === '7') {
    res = await unClaimTask(params)
  }
  if (flag && parseInt(flag) < 8 && res.code === 200) {
    showSuccessToast('操作成功')
    showSub.value = false
    emits('handle')
  }
}

onMounted(() => {
  if (route.query.tid) {
    getReturnList() // 可退回的节点
  }
})

watch(() => props.oprArr, (val) => {
  oprArrTemp.value = val
  // getOprBtns()
}, { immediate: true })

watch(() => props.work_order_data, () => {
  getUserListFn() // 发起群聊-用户列表
}, { immediate: true })
</script>

<style lang="scss" scoped>
// 操作
.btn_op_box {
  justify-content: space-between;
  width: 100%;
  gap: 12px;

  .btn_op_img {
    width: 20px;
    height: 20px;
    background-size: cover;
  }

  .btn_op_item {
    font-size: 12px;
  }

  .btn_op_item.ic.i1 {
    padding-right: 12px;
  }

  .btn_op_item.ic.i2 {
    padding-right: 4px;
  }

  .btn_op_item.ic {
    flex-direction: column;
  }

  .btn_op_item.isMe {
    flex-direction: column;
    justify-content: center;
    flex: 1;
  }

  .btn_op_item.isMe.del {
    color: red;
  }

  .i_bor {
    gap: 4px;
    flex: 1;
    justify-content: center;
    height: 32px;
    background: #FFFFFF;
    font-size: 14px;
    color: #FF023C;
    border: 1px solid rgba(255, 2, 60, 1);
    border-radius: 4px;
  }

  .i_bor.bl {
    color: #027AFF;
    border: 1px solid rgba(2, 122, 255, 1);
  }
}

// 其他流程
.otherBtnsBox {
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  padding: 10px;
  padding-top: 20px;
  display: flex;
  flex-wrap: wrap;

  .btn {
    min-width: 80px;
    flex-shrink: 0;
    border-radius: 5px;
    padding: 6px 10px;
    border: none;
    margin-right: 10px;
    margin-bottom: 20px;
    background-color: #4776ff;
    color: #fff;
  }

  .btn.red {
    border: 1px solid red;
    color: red;
    padding: 4px 8px;
    background-color: transparent;
  }

  .btn.ora {
    border: 1px solid #F05A1F;
    color: #F05A1F;
    padding: 4px 8px;
    background-color: transparent;
  }

  .btn.fin {
    border: 1px solid #4776ff;
    color: #4776ff;
    padding: 4px 8px;
    background-color: transparent;
  }
}

// 拒绝 同意
.buttons {
  //z-index: 9;
  overflow: hidden;
  width: calc(100% - 32px);
  display: flex;
  align-items: center;
  gap: 10px;
  // justify-content: space-between;
  background-color: #fff;
  position: fixed;
  left: 0;
  bottom: 0;
  height: 60px;
  padding: 0 16px;
  font-size: 16px;
  text-align: center;

  .option {
    display: flex;
    align-items: center;
    border-radius: 4px;
    color: #000000;
    gap: 10px;
    flex: 2;

    .turn-down {
      flex: 1;
      background-color: #fff;
      border: 1px solid #ededf0;
    }

    .on {
      flex: 1;
      background-color: #4776ff;
      color: #fff;
      border: none;
    }
  }

  .weipai {
    flex: 1;
    background-color: #4776ff;
    color: #fff;
    border: none;
  }

  .padding {
    border-radius: 6px;
    padding: 10px 0;
  }
}

/*同意拒绝*/
.fadein {
  text-align: left;
  overflow: hidden;
  padding: 20px 18px;

  .title {
    display: block;
    font-size: 16px;
    color: #000000;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .title.t1 {
    color: #027AFF;
  }

  .title.t2 {
    color: red;
  }

  .des_title {
    padding-bottom: 8px;
    width: 100%;
    justify-content: space-between;
  }

  .des {
    display: block;
    font-size: 14px;
    color: #666666;
  }

  .buttonBox {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 22px;

    .btnEmp {
      width: 20px;
    }

    .btns {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 130px;
      height: 40px;
      font-size: 14px;
      color: #4876ff;
      border: 1px solid #4876ff;
      border-radius: 6px;

      &.on {
        background-color: #4876ff;
        border: none;
        color: #fff;
      }
    }
  }

  textarea {
    width: 100%;
    height: 100px;
    background: #f5f7f9;
    border-radius: 6px;
    margin-top: 12px;
    padding: 16px;
    font-size: 14px;
    color: #333;
  }

  .s {
    stop-color: #999999;
  }

  .user {
    display: flex;
    align-items: center;

    image {
      width: 42px;
      margin-right: 8px;
    }

    text {
      font-size: 16px;
      color: #000000;
    }
  }

  .edit_text {
    font-size: 12px;
    color: #027AFF;
    margin: 0 12px;
  }

  .van-cell.van-field {
    border: 1px solid #f5f7f9;
  }
}

.buttonsPage {
  :deep(.van-overlay) {
    z-index: 1 !important;
  }
}
</style>
