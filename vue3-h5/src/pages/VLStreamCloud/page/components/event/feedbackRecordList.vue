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

<style lang="scss" scoped>
@use '@/styles/vl-mixins' as *;

.feedbackRecordList-page.feedbackRecordList-page {
  width: 100%;
  height: auto;
  padding: 0;
  background: transparent;

  .fkInfoBox {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }

  :deep(.van-list) {
    width: 100%;
  }

  @include vl-timeline;
  @include vl-empty;

  .info-content_out {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: 0 0 10px;
    padding: 0;
  }

  .info-content {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--vl-ink);
  }

  .info-content-avatar {
    width: 28px;
    height: 28px;
    margin: 0;
    border-radius: 50%;
    overflow: hidden;
  }

  .time {
    flex-shrink: 0;
    margin: 0;
    font-size: 12px;
    color: var(--vl-text-3);
    font-variant-numeric: tabular-nums;
  }

  .info-lable {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 0;
    padding: 0 0 8px;
    font-size: 13px;
    line-height: 20px;
    color: var(--vl-ink);
    word-break: break-all;

    &:last-child {
      padding-bottom: 0;
    }

    > img {
      width: 16px;
      height: 16px;
      margin: 2px 0 0;
      opacity: 0.55;
      flex-shrink: 0;
    }
  }

  .infoPhotoBox {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 0;
  }

  .infoPhoto {
    width: auto;
    height: auto;
    aspect-ratio: 1;
    margin: 0;
    border-radius: var(--vl-radius-sm);
    overflow: hidden;
    background: var(--vl-surface-2);

    :deep(img) {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }
}
</style>
