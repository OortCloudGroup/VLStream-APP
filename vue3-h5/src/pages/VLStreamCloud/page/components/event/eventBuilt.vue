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
    <nav-header-banner :title="$t('新建')" />
    <div class="eventBox">
      <div class="eventItem">
        <div class="eventItem_c flexRowAC">
          <img class="e_img" src="@/assets/img/eventMana/theme.png" alt="" />
          <div class="e_r titleBox flexRowAC">
            <span class="red">*</span>
            <van-field
              v-model="form.name"
              class="title p0"
              autosize
              clearable
              :placeholder="$t('请输入事件名称')"
            />
          </div>
        </div>
      </div>
      <!-- 事件图片-->
      <div class="eventItem">
        <div class="eventItem_c flexRowAC">
          <img src="@/assets/img/eventMana/photo1.png" alt="" />
          <span class="title">{{ $t('事件图片') }}</span>
        </div>
        <div class="e_r locationBox flexRowAC coverBox">
          <div class="uploadBox flexRowAC" @click="showUploader=true">
            <img src="@/assets/img/eventMana/photo.png" alt="" />
            {{ $t('上传图片') }}
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
        <div class="eventItem_c flexRowAC" @click=" selectLocationVisible = true">
          <img src="@/assets/img/eventMana/event_location.png" alt="" />
          <span class="title">{{ $t('事件位置') }}</span>
          <img class="arrow-icon" src="@/assets/img/ancientTrees/biaodan-icon-tiaozhuan.png" alt="跳转" />
        </div>
        <div class="e_r locationBox flexRowAC">
          <span class="red">*</span>
          <van-field
            v-model="form.point.address"
            class="location"
            autosize
            readonly
            clearable
            :placeholder="$t('请选择区域')"
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
            :placeholder="$t('请输入事件描述')"
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
      <!--执行人员-->
      <div class="eventItem Top">
        <div class="eventItem_c flexRowAC">
          <img src="@/assets/img/eventMana/event_user1.png" alt="" />
          <span class="red">*</span>
          <span class="title">{{ $t('执行人员') }}</span>
        </div>
        <div class="e_r locationBox user_box flexRowAC">
          <img class="add" src="@/assets/img/eventMana/add.png" alt="" @click="showContact=true,showType='u_type1'" />
          <template v-if="form.u_type1.length">
            <div v-for="(item,i) in form.u_type1" :key="i" class="flexRowAC user_item">
              <oort_image class="user_img" default-type="user" :src="item.photo" alt="" />
              <span>{{ item.user_name }}</span>
              <van-icon class="del_img" name="close" @click.stop="form.u_type1.splice(i,1)" />
            </div>
          </template>
        </div>
      </div>
      <!--执行人员-->
      <div class="eventItem">
        <div class="eventItem_c flexRowAC">
          <img src="@/assets/img/eventMana/cart.png" alt="" />
          <span class="title">{{ $t('车辆') }}</span>
        </div>
        <div class="e_r locationBox user_box flexRowAC">
          <img class="add" src="@/assets/img/eventMana/add.png" alt="" @click="showContact=true,showType='u_type2'" />
          <template v-if="form.u_type2.length">
            <div v-for="(item,i) in form.u_type2" :key="i" class="flexRowAC user_item">
              <oort_image class="user_img" default-type="user" :src="item.photo" alt="" />
              <span>{{ item.user_name }}</span>
              <van-icon class="del_img" name="close" @click.stop="form.u_type2.splice(i,1)" />
            </div>
          </template>
        </div>
      </div>
      <div class="eventItem primaryBox flexRowAC">
        <van-button type="primary" @click="submit">
          {{ $t('确认开始') }}
        </van-button>
      </div>
      <!--      -->
    </div>
    <!--人员选择-->
    <oort_popup v-model="showContact" position="right" style="width: 100%;height: 100%">
      <Contact :person-list="form[showType]" @editClose="contactClose" />
    </oort_popup>
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
      <select-point-form-map v-if="selectLocationVisible" is-around-search @confirm="confirmLocation" @cancel="selectLocationVisible=false" />
    </oort-popup>
  </div>
</template>

<script setup>
import NavHeaderBanner from '@/components/navHeaderBanner/index.vue'
import { useI18n } from 'vue-i18n'
import { event_add } from '@/api/eventManagement'
import { useUserStore } from '@/store/modules/useraPaas'
import { useRoute, useRouter } from 'vue-router'
import { showSuccessToast, showToast } from 'vant'
import Oort_popup from '@/components/popup/oort_popup.vue'
import Contact from '@/components/contactTree/Contact.vue'
import { ref, onMounted } from 'vue'
import Oort_image from '@/components/image/oort_image.vue'
import OortUploader from '@/components/uploader/oort_uploader.vue'
import { myOpinionList } from '@/api/unifiedUsert/logManage'
import SelectPointFormMap from '@/components/map/selectPointFormMap.vue'
import OortPopup from '@/components/popup/oort_popup.vue'

const store = useUserStore()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
let mod_type = ref(route.query.event)
let showContact = ref(false) // 人员选择
let showType = ref('u_type1') // 人员选择类型
let showUploader = ref(false)// 从相册选择
let imgArr = ref([]) // 图片
let listData = ref([]) // 常用意见
const selectLocationVisible = ref(false)// 区域选择
let form = reactive({
  // name: '设施养护事件5',
  name: '我的事件',
  describe: '',
  pics: [],
  point: {
    address: '',
    lat: '',
    lng: ''
  },
  // point: {
  //   address: '深圳市福田区松岭路57号',
  //   lat: 22.71991,
  //   lng: 114.24779
  // },
  u_type1: [],
  u_type2: [],
  mod_type: mod_type.value
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

// 图片
const getImg = (file) => {
  imgArr.value = file
}

// 人员选择
const contactClose = (data) => {
  showContact.value = false
  if (data && data.userList) {
    form[showType.value] = [...data.userList]
  }
}

// 保存
const submit = async() => {
  if (!form.name) return showToast(t('请输入事件名称'))
  if (!form.point?.lat) return showToast(t('位置为空'))
  if (!form.describe) return showToast(t('请输入事件描述'))
  if (!form.u_type1.length) return showToast(t('执行人员未选择'))
  let data = {
    accessToken: store.token,
    tenant_id: store.userInfo.tenantId,
    ...form,
    u_type1: undefined,
    u_type2: undefined,
    // pics: [
    //   'http://183.62.103.20:21410/bus/wj1/group1/default/20250422/10/37/4/img_v3_02lf_f2b586ad-921b-4996-9b95-0cd74a55e20g.png',
    //   'http://183.62.103.20:21410/bus/wj1/group1/default/20250411/10/01/4/img_v3_02l5_ac740693-a2e5-4d2c-a6fe-7c74c7c900cg.png',
    //   'http://183.62.103.20:21410/bus/wj1/group1/default/20240921/11/15/4/img_v3_02b5_7cbacd25-c7ec-4b0d-b349-1f75ce06cadg.png',
    //   'http://183.62.103.20:21410/bus/wj1/group1/default/20240924/16/05/4/u01.jpg'
    // ],
    pics: imgArr.value.map(tt => tt.url),
    uuids: [
      ...form.u_type1.map(tt => ({ u_type: 1, uuid: tt.user_id })),
      ...form.u_type2.map(tt => ({ u_type: 2, uuid: tt.user_id }))
    ]
  }
  let res = await event_add(data)
  if (res.code === 200) {
    showSuccessToast(t('操作成功'))
    router.push('/')
  }
}

onMounted(() => {
  getCommonOpinionsList()
})
</script>
<style lang="scss" scoped>

.eventBuilt_page {
  height: 100vh;
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
  flex-direction: column;

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
</style>
