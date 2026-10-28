<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2025-04-16 10:27:55
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="eventBuilt_page">
    <nav-header-banner :title="$t('添加反馈')" />
    <div class="eventBox">
      <div v-if="queryTemp&&queryTemp.mod_type==='2'" class="eventItem">
        <div class="eventItem_c flexRowAC">
          <img class="e_img" src="@/assets/img/eventMana/theme.png" alt="" />
          <span class="title">{{ $t('告警事件') }}</span>
        </div>
        <div class="e_r locationBox user_box flexRowAC">
          <van-radio-group v-model="form.mod_status" direction="horizontal">
            <van-radio :name="1">
              {{ $t('真实告警') }}
            </van-radio>
            <!--            <van-radio :name="2">-->
            <!--              维保-->
            <!--            </van-radio>-->
            <van-radio :name="3">
              {{ $t('误报') }}
            </van-radio>
          </van-radio-group>
        </div>
      </div>
      <div class="eventItem">
        <div class="eventItem_c flexRowAC">
          <img src="@/assets/img/eventMana/work1.png" alt="" />
          <span class="title">{{ $t('是否转工单') }}</span>
        </div>
        <div class="e_r locationBox user_box flexRowAC">
          <van-switch
            v-model="form.work_order_status"
            :disabled="eventInfoData?.work_order_status===1"
            :active-value="1"
            :inactive-value="0"
          />
        </div>
      </div>
      <!-- 工单名称 -->
      <flow-form
        v-if="form.work_order_status===1"
        ref="flowFormRef"
        :list-obj="eventInfoData"
        class="eventItem"
      />
      <!-- 事件图片（单租户集群没有对象存储服务，反馈照片无处上传）-->
      <div v-if="!isLocalAuth" class="eventItem">
        <div class="eventItem_c flexRowAC">
          <img src="@/assets/img/eventMana/photo1.png" alt="" />
          <span class="title">{{ $t('反馈照片') }}（{{ imgArr.length }}/5）</span>
        </div>
        <div class="e_r locationBox flexRowAC coverBox">
          <div v-if="imgArr.length>=5" class="uploadBox flexRowAC">
            <img src="@/assets/img/eventMana/photo.png" alt="" />
            {{ $t('拍照/上传') }}
          </div>
          <div v-else class="uploadBox flexRowAC" @click="showUploader=true">
            <img src="@/assets/img/eventMana/photo.png" alt="" />
            {{ $t('拍照/上传') }}
          </div>
          <!-- imgArr-->
          <template v-if="imgArr&&imgArr.length">
            <div v-for="(item,i) in imgArr" :key="i" class="img1 d">
              <oort_image class="img1" :src="item.url" alt="" />
              <van-icon class="del_img" name="close" @click.stop="imgArr.splice(i,1)" />
            </div>
          </template>
        </div>
      </div>
      <!-- 事件位置-->
      <div class="eventItem">
        <div class="eventItem_c flexRowAC" @click="!isLocalAuth && (selectLocationVisible = true)">
          <img src="@/assets/img/eventMana/event_location.png" alt="" />
          <span class="title">{{ $t('事件反馈位置') }}</span>
          <img v-if="!isLocalAuth" class="arrow-icon" src="@/assets/img/ancientTrees/biaodan-icon-tiaozhuan.png" alt="跳转" />
        </div>
        <div class="e_r locationBox flexRowAC">
          <span class="red">*</span>
          <van-field
            v-model="form.point.address"
            class="location"
            autosize
            :readonly="!isLocalAuth"
            clearable
            :placeholder="isLocalAuth ? $t('请输入反馈位置') : $t('请选择区域')"
          />
        </div>
        <div class="e_r locationBox flexRowAC">
          <span class="red">*</span>
          <van-field
            v-model="form.describe"
            class="location"
            type="textarea"
            rows="4"
            autosize
            clearable
            :placeholder="$t('请输入反馈描述')"
          />
        </div>
        <div class="e_r locationBox">
          <div class="addBtnBox flexRowAC">
            <div class="addBtn flexRowAC">
              <van-icon name="plus" />
              {{ $t('添加为常用语') }}
            </div>
            <div
              v-for="(item,i) in listData"
              :key="i"
              class="tag flexRowAC"
              @click="form.describe=form.describe+' '+item.content"
            >
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
      <!--是否完成养护-->
      <div class="eventItem Top">
        <div class="eventItem_c flexRowAC">
          <span class="title">{{ $t('是否完成养护') }}</span>
          <div class="eventItem_c_right flexRowAC">
            <van-radio-group v-model="form.status" direction="horizontal">
              <van-radio :name="1">
                {{ $t('已完成') }}
              </van-radio>
              <van-radio :name="2">
                {{ $t('未完成') }}
              </van-radio>
            </van-radio-group>
          </div>
        </div>
      </div>
      <div class="eventItem primaryBox flexRowAC">
        <!-- 工单 -->
        <van-button type="primary" @click="submit">
          {{ $t('提交') }}
        </van-button>
      </div>
      <!--      -->
    </div>
    <!--上传图片-->
    <oort-uploader
      ref="oort_uploader"
      v-model:show="showUploader"
      :file="imgArr"
      @click="showUploader=false"
      @getImgUrl="getImg"
    />
    <!-- 事件位置 -->
    <oort-popup
      v-model="selectLocationVisible"
      style="width: 100%;height: 80%;"
      position="bottom"
      round
      :title="$t('选择位置')"
    >
      <select-point-form-map
        v-if="selectLocationVisible"
        is-around-search
        @confirm="confirmLocation"
        @cancel="selectLocationVisible=false"
      />
    </oort-popup>
  </div>
</template>

<script setup>
import NavHeaderBanner from '@/components/navHeaderBanner/index.vue'
import { useI18n } from 'vue-i18n'
import { event_back_add, event_info } from '@/api/eventManagement'
import config from '@/config'
import { useUserStore } from '@/store/modules/useraPaas'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast, showConfirmDialog } from 'vant'
import { ref } from 'vue'
import Oort_image from '@/components/image/oort_image.vue'
import OortUploader from '@/components/uploader/oort_uploader.vue'
import { myOpinionList } from '@/api/unifiedUsert/logManage'
import SelectPointFormMap from '@/components/map/selectPointFormMap.vue'
import OortPopup from '@/components/popup/oort_popup.vue'
import { startProcess, stopProcess } from '@/api/processui'
import FlowForm from '@/pages/VLStreamCloud/page/components/event/flowForm.vue'

const store = useUserStore()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
let queryTemp = ref(route.query)
// 单租户集群没有 aPaaS 的对象存储与地图服务：反馈只能提交文字（位置手工填写）
const isLocalAuth = config.authMode === 'local'
let showUploader = ref(false)// 从相册选择
const flowFormRef = ref(null) // 工单
const eventInfoData = ref('') // 工单
let imgArr = ref([]) // 图片
let listData = ref([]) // 常用意见
const selectLocationVisible = ref(false)// 区域选择
let form = reactive({
  id: undefined,
  describe: '',
  pics: [],
  point: {
    address: '',
    lat: '',
    lng: ''
  },
  status: 1, // 1:已完成 2:正在处理
  // 是否转工单 1:是 0:否(默认) 工单关联的是事件,一个事件只能关联1个工单  已关联的不允许再关联
  work_order_status: 0,
  work_order_data: undefined,
  workOrderId: 1,
  notice: true,
  noticeList: [],
  mod_status: undefined
})

// 事件位置
const confirmLocation = (result) => {
  selectLocationVisible.value = false
  if (!result) return
  form.point = result
  form.point.address = result?.address || ''
  form.point.lat = result.latitude
  form.point.lng = result.longitude
}

// 任务事件-info
const event_listFn = async(id) => {
  let data = {
    accessToken: store.token,
    id: id
  }
  let res = await event_info(data)
  if (res.code === 200) {
    eventInfoData.value = res.data
    form.id = eventInfoData.value.id
    form.status = eventInfoData.value.status
    form.work_order_status = eventInfoData.value.work_order_status
    form.work_order_data = eventInfoData.value.work_order_data
  }
}

// 常用意见
const getCommonOpinionsList = async() => {
  const params = {
    accessToken: store.token,
    is_open: 0, // 0 个人 1 公开
    page: 1,
    pagesize: 999
  }
  const res = await myOpinionList(params)
  if (res.code === 200) {
    listData.value = res.data.list
  }
}

// 选择的工单跟历史工单不一致的时候提示，同时发起新的工单，关闭旧的工单
const closeWorkorderFn = async() => {
  let data = {
    procInsId: form.work_order_data?.procInsId,
    variables: {}
  }
  let res = await stopProcess(data)
  if (res.code === 200) {
    showSuccessToast(t('关闭工单成功'))
  }
}

// 发起工单- Submit提交
const addWorkorderFn = async() => {
  form.work_order_data = flowFormRef.value.form.work_order_data
  // 1️⃣ 已存在工单逻辑
  if (form.work_order_data && form.work_order_data.processKey) {
    const oldOrder = eventInfoData.value?.work_order_data
    // 同一工单，直接返回
    if (oldOrder.processKey === flowFormRef.value?.form.processKey) {
      return oldOrder
    }
    // 不同工单，且旧工单未结束 → 提示是否关闭
    if (oldOrder.processStatus !== 'canceled' && !oldOrder.finishTime) {
      try {
        await showConfirmDialog({
          title: t('取消工单'),
          message:
            t('选择的工单跟历史工单不一致，是否继续取消')
        }).then(() => {
        })
          .catch(() => {

          })
        await closeWorkorderFn()
      } catch {
        // 用户取消
        return
      }
    }
  }
  // 2️⃣ 表单校验
  const processDefId = flowFormRef.value?.selectedOptions_1?.definitionId
  if (!processDefId) return showToast(t('请选择工单'))
  let appObj = flowFormRef.value?.appObj
  // 3️⃣ 参数构建
  const data = {
    processDefId,
    workOrderBo: {
      processKey: form.processKey,
      title: eventInfoData.value?.name,
      source: eventInfoData.value?.mod_type === 2 ? '主动安全' : '事件拍传',
      eventNumber: eventInfoData.value?.id,
      workorderId: appObj?.appId,
      workorderIdExtend: `1,${appObj?.appId}`
    },
    frontFlag: true, // 发起工单的时候传frontFlag参数为true跟表单参数同级
    /* autoGetFormFlag这个参数为true表示自动查找表单值对应项，跟表单参数同级*/
    /* 比如自定义名称这里是abc，你传variables给我就是{abc:"事件类型值"} */
    autoGetFormFlag: true,
    variables: {
      no: eventInfoData.value?.id || undefined, // 编号
      item: eventInfoData.value?.item || undefined, // 类型
      name: eventInfoData.value?.name || undefined, // 名称
      time: eventInfoData.value?.created_at || undefined, // 时间
      address: eventInfoData.value?.point?.address || undefined, // 地址
      describe: eventInfoData.value?.describe || undefined, // 描述
      image: eventInfoData.value?.pics || undefined//  图片
    }
  }
  // 4️⃣ 发起流程
  let res = await startProcess(data)
  if (res.code === 200) {
    const workOrder = res?.data?.workOrder
    form.work_order_data = workOrder
    return workOrder
  }
}

// 图片
const getImg = (file) => {
  imgArr.value = file
}

// 保存
const submit = async() => {
  const processKey = flowFormRef.value?.form.processKey
  // 没有可用的流程模型（单租户集群未部署工单流程）时不能强求选择工单，否则提交永远被拦住
  const hasFlowModels = !!flowFormRef.value?.options?.length
  if (form.work_order_status === 1 && hasFlowModels && !processKey) return showToast(t('请选择工单'))
  if (queryTemp.value.mod_type === '2' && !form.mod_status) return showToast(t('告警事件未选择'))
  if (isLocalAuth ? !form.point.address : !form.point?.lat) return showToast(t('位置为空'))
  if (!form.describe) return showToast(t('请输入事件描述'))
  // 是否转工单 1:是 0:否(默认) 工单关联的是事件,一个事件只能关联1个工单  已关联的不允许再关联
  if (form.work_order_status === 1 && hasFlowModels) {
    let val = await addWorkorderFn()
    if (!val) return
  }
  let data = {
    accessToken: store.token,
    tenant_id: store.userInfo.tenantId,
    id: queryTemp.value.event_id,
    ...form,
    pics: imgArr.value.map(tt => tt.url)
  }
  let res = await event_back_add(data)
  if (res.code === 200) {
    showSuccessToast(t('操作成功'))
    router.back()
  }
}

onMounted(() => {
  getCommonOpinionsList()
  event_listFn(queryTemp.value.event_id) // 任务事件-info
})
</script>
<style lang="scss" scoped>

.eventBuilt_page {
  height: 100%;
}

.eventBox {
  height: calc(100% - 60px);
  padding-top: 8px;
  overflow: auto;
  position: relative;

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

  .eventItem_c {
    align-items: flex-start;
  }
}

.e_r {
  flex: 1;

  .p0 {
    padding: 0;
    border-bottom: 1px solid #D8D8D8;
  }
}

.red {
  padding-top: 3px;
  color: red;
}

.titleBox {
  align-items: flex-start;

  .title {
    font-family: OPPOSans-M;
    font-size: 16px;
    color: #999999;
    letter-spacing: 0;
    line-height: 25px;
    font-weight: 500;

    :deep(.van-field__control) {
      font-size: 16px;
      color: #999999;
      padding-bottom: 10px;
    }
  }
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

.uploadBox {
  flex-direction: column;
  justify-content: center;
  width: 68px;
  height: 68px;
  background: #F7F7F7;
  border-radius: 4px;
  margin-right: 8px;
  font-family: OPPOSans-R;
  font-size: 12px;
  color: #989EB5;
  text-align: center;
  font-weight: 400;

  > img {
    margin: 0 !important;
  }
}

.addBtnBox {
  margin-top: -20px;
  align-items: flex-start;
  flex-wrap: wrap;
  //flex-direction: column;

  .addBtn {
    background: rgba(26, 83, 255, 0.12);
    border-radius: 16px;
    font-family: MicrosoftYaHei;
    font-size: 12px;
    color: #1A53FF;
    letter-spacing: 0;
    font-weight: 400;
    padding: 8px 12px;

    > .van-icon {
      font-size: 14px;
      margin-left: 6px;
    }
  }

  .tag {
    margin-top: 8px;
    margin-right: 8px;
    background: rgba(24, 144, 255, 0.12);
    border-radius: 4px;
    font-family: MicrosoftYaHei;
    font-size: 12px;
    line-height: 14px;
    color: #1890FF;
    letter-spacing: 0;
    font-weight: 400;
    padding: 6px 4px;
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

.eventItem.primaryBox {
  padding-bottom: 40px;
  justify-content: center;
  width: 90%;

  .van-button {
    width: 90%;
    background: #2F69F8;
    border-radius: 18px;
  }
}

.user_box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

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

// 图片
.coverBox {
  gap: 10px;
  position: relative;
  flex-wrap: wrap;

  .d {
    position: relative;

    .el-icon {
      display: none;
      font-size: 20px;
      cursor: pointer;
      position: absolute;
      right: 0;
      top: 0;
      color: red;
    }
  }

  .d:hover .el-icon {
    display: flex;
  }

  img.img1 {
    flex-shrink: 0;
    width: 68px;
    height: 68px;
    background-size: cover;
  }

  .del_img {
    position: absolute;
    top: 0;
    right: 0;
    color: red;
  }
}

.eventItem_c_right {
  float: right;
  flex: 1;
  justify-content: flex-end;
  font-size: 14px;
  color: #666666;
  letter-spacing: 0;
  font-weight: 400;
}
</style>
