<template>
  <div class="feedbackRecordList-page">
    <div class="fkInfoBox flexRowAC">
      <van-list
        v-if="allTasks.length !== 0"
        v-model="loading"
        :finished="finished"
        :finished-text="$t('没有更多了')"
        @load="onLoad"
      >
        <div
          v-for="(task, index) in allTasks"
          :key="index"
          class="info-item"
          :class="{last:index === allTasks.length-1}"
        >
          <div class="info-content_out flexRowAC">
            <div class="info-content flexRowAC">
              <i-d2-head-pic-mobile :id="task.uuid" class="info-content-avatar" round />
              <i-d2-name :id="task.uuid" round />
            </div>
            <div class="time">
              {{ task.created_at }}
            </div>
          </div>
          <div class="info-lable flexRowAC">
            <img src="@/assets/img/eventMana/event_location.png" alt="" />
            {{ task.point?.address }}
          </div>
          <div class="info-lable flexRowAC">
            <img src="@/assets/img/eventMana/event_desc.png" alt="" />
            {{ task.describe }}
          </div>
          <div v-if="task.pics&&task.pics.length" class="info-lable flexRowAC">
            <img src="@/assets/img/eventMana/photo1.png" alt="" />
            <div class="infoPhotoBox flexRowAC">
              <div
                v-for="(img, index) in task.pics"
                :key="index"
                class="infoPhoto"
                @click="previewImageHandler(index, task.pics)"
              >
                <Oort_image :src="img" alt="事件图片" />
              </div>
            </div>
          </div>
        </div>
      </van-list>
      <!-- 空态 -->
      <div v-if="allTasks.length === 0" class="no_data">
        <img src="@/assets/img/daily_activity/no_data.png" />
        <span>{{ $t('暂无数据') }}</span>
      </div>
    </div>
    <oort-image-preview v-model:show="showImagePreview" :start-position="imgIndex" :images="previewImage" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { event_back_list, myevent_back_list } from '@/api/eventManagement'
import { useUserStore } from '@/store/modules/useraPaas'
import { useRoute } from 'vue-router'
import ID2Name from '@/components/ID2Name.vue'
import ID2HeadPicMobile from '@/components/ID2HeadPic.vue'
import Oort_image from '@/components/image/oort_image.vue'
import OortImagePreview from '@/components/imagePreview/oort_image_preview.vue'

const store = useUserStore()
const route = useRoute()
const loading = ref(false)
const finished = ref(false)
const queryTemp = ref(route.query) // 路由参数
const count = ref(0)
const page = ref(1)
const pageSize = ref(10)
let allTasks = ref([])
const imgIndex = ref(0)
const previewImage = ref('') // 预览图片URL
const showImagePreview = ref(false) // 控制图片预览显示

// 刷新-page
const onLoad = () => {
  if (loading.value || finished.value) return
  loading.value = true
  event_listFn()
}

// 预览图片
const previewImageHandler = (i, imageUrl) => {
  imgIndex.value = i
  previewImage.value = imageUrl
  showImagePreview.value = true
}

// 任务事件-list
const event_listFn = async() => {
  let data = {
    accessToken: store.token,
    tenant_id: store.userInfo.tenantId,
    task_event_id: queryTemp.value.event_id,
    // status: taskStatus.value,
    page: page.value,
    // mod_type: mod_type.value,
    pageSize: pageSize.value
  }
  // if (mod_type.value === 2) data['mod_status'] = mod_status.value
  let res = queryTemp.value.my ? await myevent_back_list(data) : await event_back_list(data)
  if (res.code === 200) {
    loading.value = false
    count.value = res.data.count || 0
    if (res.data.list) {
      allTasks.value = [...allTasks.value, ...res.data.list]
      if (allTasks.value.length >= count.value || res.data.list.length === 0) {
        finished.value = true
      }
      page.value += 1
    }
  }
}

onMounted(() => {
  event_listFn()
})
</script>

<style scoped lang="scss">
.feedbackRecordList-page {
  //background-color: #fff;
  height: calc(100vh - 220px);
  padding: 20px 0;
  overflow: auto;
}

.fkInfoBox {
  width: calc(100% - 32px);
  //height: 100%;
  flex-direction: column;
  align-items: flex-start;
  //flex-width: wa;
  padding: 0 16px 20px;

  .van-list {
    width: 100%;

    // 左边样式
    .info-item {
      background-color: #fff;
      border-left: 1px dashed rgba(3, 120, 255, 1);
      padding-left: 10px;
      margin-bottom: 2px;
      position: relative;

      &.last {
        &:before {
          position: absolute;
          content: '';
          top: 8px;
          left: -7px;
          background: #FFFFFF;
          width: 8px;
          height: 100%;
        }
      }

      // 短白线
      &:first-child {
        &:before {
          position: absolute;
          content: '';
          top: 0px;
          left: -7px;
          background: #FFFFFF;
          width: 8px;
          height: 8px;
        }
      }

      // 圈
      &:after {
        position: absolute;
        content: '';
        top: 7px;
        left: -7px;
        background: #FFFFFF;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        border: 2px solid rgba(3, 120, 255, 1);
      }
    }
  }
}

.info-item {
  .info-content-avatar {
    width: 28px;
    height: 28px;
    vertical-align: middle;
    border-radius: 50%;
    margin-right: 4px;
  }

  .info-lable {
    align-items: flex-start;
    padding-bottom: 10px;
    font-family: SourceHanSansSC-Regular;
    font-size: 14px;
    line-height: 16px;
    color: #333333;
    letter-spacing: 0;
    font-weight: 400;

    > img {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }

    .infoPhotoBox {
      flex-wrap: wrap;
    }

    .infoPhoto {
      margin-bottom: 8px;
      flex-shrink: 0;
      width: 66px;
      height: 66px;
      border-radius: 4px;
      margin-right: 8px;
      background-color: #D8D8D8;

      > img {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        margin-right: 8px;
      }
    }
  }
}

.info-content_out {
  padding-bottom: 10px;
  justify-content: space-between;

  .time {
    font-family: SourceHanSansSC-Regular;
    font-size: 12px;
    color: #515A6E;
    letter-spacing: 0;
    text-align: right;
    font-weight: 400;
  }
}

.infoAni {
  flex-direction: column;
  height: 100px;
  //flex: 1;

  .qu {
    background: #FFFFFF;
    border: 2px solid rgba(3, 120, 255, 1);
  }

  .dot {
    border-left: 2px solid purple;
  }
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

</style>
