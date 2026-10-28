<template>
  <div class="fadeinPage">
    <!--  同意,拒绝  -->
    <van-popup v-model:show="showSub" round mode="center" border-radius="14" :style="{ width: '80%' }">
      <div class="fadein">
        <span v-if="approveStatus === '0'" class="title t1">{{ $t('同意') }}</span>
        <span v-if="approveStatus === '1'" class="title t1">{{ $t('委派') }}</span>
        <span v-if="approveStatus === '2'" class="title t1">{{ $t('转办') }}</span>
        <span v-if="approveStatus === '3'" class="title t1">{{ $t('退回') }}</span>
        <span v-if="approveStatus === '4'" class="title t2">{{ $t('拒绝') }}</span>
        <!-- 抄送人 -->
        <div class="addIcon flexRowAC" @click="showContact=true,showType='copy'">
          <div class="flexRowAC">
            <van-icon name="add-o" />
            <span class="sp">{{ $t('抄送人') }}</span>
          </div>
          <div v-if="form.copy.length" class="user_box flexRowAC" @click.stop>
            <div v-for="(item,i) in form.copy" :key="i" class="flexRowAC user_item">
              <img class="user_img" :src="item.photo" alt="" />
              <span>{{ item.user_name }}</span>
              <van-icon class="del_img" name="close" @click.stop="form.copy.splice(i,1)" />
            </div>
          </div>
        </div>
        <!-- 审批人 -->
        <div class="addIcon flexRowAC" @click="showContact=true,showType='next'">
          <div class="flexRowAC">
            <van-icon name="add-o" />
            <span class="sp">{{ $t('审批人') }}</span>
          </div>
          <div v-if="form.next.length" class="user_box flexRowAC" @click.stop>
            <div v-for="(item,i) in form.next" :key="i" class="flexRowAC user_item">
              <img class="user_img" :src="item.photo" alt="" />
              <span>{{ item.user_name }}</span>
              <van-icon class="del_img" name="close" @click.stop="form.next.splice(i,1)" />
            </div>
          </div>
        </div>
        <!-- 委派人或转办人 -->
        <div
          v-if="approveStatus === '1' || approveStatus === '2'"
          class="addIcon"
          @click="showContact=true,showType='person'"
        >
          <div class="flexRowAC">
            <van-icon name="add-o" />
            <span v-if="approveStatus === '1'" class="sp">{{ $t('委派操作时必填') }}</span>
            <span v-if="approveStatus === '2'" class="sp">{{ $t('转办操作时必填') }}</span>
          </div>
          <div v-if="form.person.length" class="user_box flexRowAC" @click.stop>
            <div v-for="(item,i) in form.person" :key="i" class="flexRowAC user_item">
              <img class="user_img" :src="item.photo" alt="" />
              <span>{{ item.user_name }}</span>
              <van-icon class="del_img" name="close" @click.stop="form.person.splice(i,1)" />
            </div>
          </div>
        </div>
        <!-- 退回节点 -->
        <div v-if="approveStatus === '3'" class="returnTaskBox flexRowAC">
          <span class="des"> {{ $t('退回节点：') }}</span>
          <van-radio-group v-model="targetKey" direction="horizontal">
            <van-radio v-for="(item,i) in returnTaskList" :key="i" :name="item.id">
              <span class="sp"> {{ item.name }}</span>
            </van-radio>
          </van-radio-group>
        </div>
        <!-- 审批意见 -->
        <div v-if="!editAdvice" class="des_title flexRowAC">
          <span class="des">{{ $t('审批意见') }}: {{ approveOpinion }} </span>
          <span class="edit_text" @click="editAdvice=true">{{ $t('编辑') }}</span>
        </div>
        <template v-if="editAdvice">
          <div class="des_title flexRowAC">
            <span class="des">{{ $t('审批意见') }}</span>
            <span class="edit_text" @click="editAdvice=false">{{ $t('收起') }}</span>
          </div>
          <van-field
            v-model="approveOpinion"
            rows="2"
            autosize
            type="textarea"
            maxlength="256"
            :placeholder="$t('内容（必填）')"
            show-word-limit
          />
        </template>
        <div class="buttonBox">
          <div class="btns" @click="emits('close')">
            {{ $t('取消') }}
          </div>
          <div class="btnEmp" />
          <div class="btns on" @click="submitTask()">
            {{ $t('确定') }}
          </div>
        </div>
      </div>
    </van-popup>
    <oort_popup v-model="showContact" position="right" style="width: 100%;height: 100%">
      <Contact :person-list="form[showType]" @editClose="contactClose" />
    </oort_popup>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'
import Contact from '@/components/contactTree/Contact.vue'
import Oort_popup from '@/components/popup/oort_popup.vue'

const { t } = useI18n()
let props = defineProps(['act', 'showSub', 'returnTaskList'])
let showSub = ref(props.showSub)
const emits = defineEmits(['close', 'handle'])
let approveStatus = ref(NaN)// 状态
let approveOpinion = ref('') // 审批意见
let editAdvice = ref(true) // 审批意见flag
let showContact = ref(false) // 人员选择
let showType = ref('') // 人员选择类型
let targetKey = ref('') // 可退回的节点
let form = reactive({
  'copy': [],
  'next': [],
  'person': []
})

// 人员选择
const contactClose = (data) => {
  showContact.value = false
  if (data && data.userList) {
    console.log(showType.value)
    form[showType.value] = [...data.userList]
    console.log('copyUserIds.value', form)
  }
}

// 提交
const submitTask = () => {
  // 审批意见未填写
  if (approveStatus.value === '0') {
    if (!approveOpinion.value) approveOpinion.value = '同意'
  }
  if (approveStatus.value === '1') {
    if (!approveOpinion.value) approveOpinion.value = '委派'
    if (!form.person || !form.person.length) return showToast(t('请选择委派人'))
  }
  if (approveStatus.value === '2') {
    if (!approveOpinion.value) approveOpinion.value = '转办'
    if (!form.person || !form.person.length) return showToast(t('请选择转办人'))
  }
  if (approveStatus.value === '3') {
    if (!approveOpinion.value) approveOpinion.value = '退回'
    if (!targetKey.value) return showToast(t('请选择可退回的节点'))
  }
  if (approveStatus.value === '4') {
    if (!approveOpinion.value) approveOpinion.value = '拒绝'
  }
  if (!approveOpinion.value) return showToast(t('请填写审批意见'))
  emits('handle', {
    approveStatus: approveStatus.value,
    nextUserIds: form.next,
    copyUserIds: form.copy,
    personList: form.person,
    approveOpinion: approveOpinion.value,
    targetKey: targetKey.value
  })
}

watch(() => props.act, (val) => {
  approveStatus.value = val
}, { immediate: true, deep: true })

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

/*添加人员*/
.addIcon {
  align-items: flex-start;
  flex-wrap: wrap;
  color: #4776ff;
  font-size: 22px;
  padding-bottom: 10px;

  .sp {
    padding-left: 10px;
    font-size: 10px;
    color: #999;
  }

  .user_box {
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 10px;

    .user_item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 6px;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
      font-size: 10px;
      color: #333;
    }

    .user_img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }

    .del_img {
      color: red;
      font-size: 10px;
    }
  }
}

.fadeinPage {
  width: 100%;
  height: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

:deep(.returnTaskBox) {
  padding-bottom: 4px;

  .sp {
    font-size: 12px;
    line-height: 16px;
    color: #999;
  }

  .van-radio__label {
    margin-left: 4px;
  }

  .van-radio {
    //border: 1px solid #ccc;
    //padding: 2px 6px;
    align-items: center;
  }

  .van-radio__icon {
    height: 14px;
    line-height: 14px;

    &.van-radio__icon--checked {
      //border: 1px solid #4776ff;
      //background-color: #4776ff;
      //color: #fff;
    }
  }

  .van-icon {
    // height: 20px;
    line-height: 14px;
    font-size: 12px;
    // display: none;
  }
}
</style>
