<template>
  <div class="task-container">
    <nav-header-banner title="事件详情" />
    <div v-if="taskData" class="task-content">
      <div v-if="taskData">
        <!-- 基本信息 -->
        <div class="task-item">
          <div class="task-info">
            <!-- info-start-->
            <div class="task-desc">
              <div class="info-lable flexRowAC">
                <img src="@/assets/img/eventMana/theme1.png" alt="" />
                事件类型：
              </div>
              <div class="info-content">
                <span v-if="taskData.mod_status===1">真实告警</span>
                <span v-if="taskData.mod_status===2">维保</span>
                <span v-if="taskData.mod_status===3">误报</span>
              </div>
            </div>
            <div class="task-desc">
              <div class="info-lable flexRowAC">
                <img src="@/assets/img/eventMana/event_location.png" alt="" />
                事件位置：
              </div>
              <div class="info-content">
                {{ taskData.point?.address }}
              </div>
              <img
                v-if="taskData.point?.address"
                class="event_arrow"
                src="@/assets/img/eventMana/event_arrow.png"
                alt=""
              />
            </div>
            <div class="task-desc">
              <div class="info-lable flexRowAC">
                <img src="@/assets/img/eventMana/service_name1.png" alt="" />
                设备名称：
              </div>
              <div class="info-content">
                {{ taskData.device_name }}
                <span class="device_tag">{{ taskData.device_tag }}</span>
              </div>
            </div>
            <div class="task-desc">
              <div class="info-lable flexRowAC">
                <img src="@/assets/img/eventMana/service_id1.png" alt="" />
                设备ID：
              </div>
              <div class="info-content">
                {{ taskData.describe }}
              </div>
            </div>
            <div class="task-desc2">
              <div class="info-lable flexRowAC">
                <img src="@/assets/img/eventMana/photo1.png" alt="" />
                抓拍照片：
              </div>
              <div class="info-content">
                <div v-if="taskData.pics" class="image-grid">
                  <div
                    v-for="(img, index) in taskData.pics"
                    :key="index"
                    class="image-item"
                    @click="previewImageHandler(img)"
                  >
                    <oort_image :src="img" alt="事件图片" />
                  </div>
                </div>
              </div>
            </div>
            <div class="task-desc2">
              <div class="info-lable flexRowAC">
                <img src="@/assets/img/eventMana/video.png" alt="" />
                录制视频：
              </div>
              <div class="info-content">
                <div v-if="taskData.video" class="image-grid">
                  <div
                    v-for="(img, index) in taskData.video"
                    :key="index"
                    class="image-item"
                    @click="previewImageHandler(img)"
                  >
                    <oort_image :src="img" alt="事件图片" />
                  </div>
                </div>
              </div>
            </div>
            <div class="task-desc">
              <div class="info-lable flexRowAC">
                <img src="@/assets/img/eventMana/event_time1.png" alt="" />
                事件时间：
              </div>
              <div class="info-content">
                {{ taskData.created_at }}
              </div>
            </div>
            <!-- info-end-->
          </div>
          <!-- 图标状态-->
          <div class="task-status">
            <img v-if="taskData.status === 2" src="@/assets/img/eventMana/e_dqr.png" />
            <img v-else src="@/assets/img/eventMana/e_yqr.png" />
          </div>
        </div>
        <!-- 待完成：状态显示） -->
        <div v-if="taskData.statusText === '待完成'">
          <div class="task-title-container">
            <div class="blue-line" />
            <div class="task-title">
              反馈信息
            </div>
          </div>
          <div class="task-item">
            <div class="task-info">
              <div class="task-desc2">
                <div class="info-lable">
                  添加图片/视频
                </div>
                <div class="info-content">
                  <div class="image-grid">
                    <div
                      v-for="(img, index) in eventImages"
                      :key="index"
                      class="image-item"
                      @click="previewImageHandler(img)"
                    >
                      <img :src="img" alt="完成图片" />
                    </div>
                    <div class="imageVideo" @click="showUploader = true">
                      <img src="@/assets/img/commandDispatch/camera2.png" alt="视频" />
                      照片/视频
                    </div>
                  </div>
                </div>
              </div>
              <div class="info-content">
                <div class="info-lable">
                  描述：
                </div>
                <div class="info-content">
                  <textarea
                    v-model="feedbackDescription"
                    placeholder="请输入描述信息..."
                    class="feedback-textarea"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 待完成、已完成-反馈记录-->
        <div class="submit-btn-container">
          <van-button type="primary" @click="feedbackRecordFn(taskData.id,taskData.mod_type)">
            反馈记录
          </van-button>
          <!--          <van-button v-if="taskData.status === 2" type="primary" @click="handleSubmit">-->
          <!--            确认事件-->
          <!--          </van-button>-->
          <!--          <van-button v-if="taskData.status === 1" type="primary" @click="feedbackRecordFn">-->
          <!--            反馈记录-->
          <!--          </van-button>-->
        </div>
      </div>
      <div v-else class="no-data">
        <div class="no-data-text">
          暂无数据
        </div>
      </div>
    </div>
    <!-- 图片预览遮罩 -->
    <div v-if="showImagePreview" class="image-preview-overlay" @click="closeImagePreview">
      <div class="image-preview-container" @click.stop>
        <img :src="previewImage" alt="预览图片" class="preview-image" />
        <button class="close-preview-btn" @click="closeImagePreview">
          ×
        </button>
      </div>
    </div>
    <!-- 使用oort_uploader组件 -->
    <oort-uploader
      ref="oort_uploader"
      v-model:show="showUploader"
      :file="fileList"
      class="uploader-high-z-index"
      @click="showUploader=false"
      @getImgUrl="getImg"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavHeaderBanner from '@/components/navHeaderBanner/index.vue'
import { showToast } from 'vant'
import OortUploader from '@/components/uploader/oort_uploader.vue'
import event1 from '@/assets/img/commandDispatch/event1.png'
import event2 from '@/assets/img/commandDispatch/event2.png'
import { event_info } from '@/api/eventManagement'
import { useUserStore } from '@/store/modules/useraPaas'
import Oort_image from '@/components/image/oort_image.vue'

const store = useUserStore()
const route = useRoute()
const router = useRouter()
const taskData = ref(null) // 事件-详情
const feedbackDescription = ref('')
const showImagePreview = ref(false) // 控制图片预览显示
const previewImage = ref('') // 预览图片URL
const showUploader = ref(false)// 使用oort_uploader组件的相关状态
const fileList = ref([]) // 图片-list
// 模拟数据 - 使用占位符图片确保显示
const eventImages = ref([
  event1,
  event2
])

// 处理从oort_uploader组件获取的图片URL
const getImg = (files, imgUrl) => {
  if (imgUrl) {
    eventImages.value.push(imgUrl)
  }
  showToast('上传成功')
}

// 处理提交
/* const handleSubmit = () => {
} */

// 预览图片
const previewImageHandler = (imageUrl) => {
  previewImage.value = imageUrl
  showImagePreview.value = true
}

// 关闭图片预览
const closeImagePreview = () => {
  showImagePreview.value = false
  previewImage.value = ''
}

// 反馈记录
const feedbackRecordFn = (id, mod_type) => {
  router.push({
    path: '/feedbackRecord',
    query: { event_id: id, mod_type: mod_type }
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
    taskData.value = res.data
    if (taskData.value && taskData.value.uuids) {
      taskData.value.u_type1 = taskData.value.uuids.filter(tt => tt.u_type === 1) || []
      taskData.value.u_type2 = taskData.value.uuids.filter(tt => tt.u_type === 2) || []
    }
  }
}

onMounted(() => {
  // 从路由参数中获取任务数据
  if (route.query.task) {
    try {
      // 如果传递的是字符串，需要解析
      if (typeof route.query.task === 'string') {
        let data = JSON.parse(route.query.task)
        event_listFn(data?.id)
      } else {
        let data = route.query.task
        event_listFn(data?.id)
      }
    } catch (error) {
      console.error('解析任务数据失败:', error)
    }
  }
})
</script>

<style scoped>
.task-container {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
    background-color: #efefef;
}

.task-content {
    height: calc(100vh - 68px - 53px);
    padding: 15px;
    overflow-y: scroll;
}

.task-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 20px;
    margin-bottom: 15px;
    background: #F9F9F9;
    border-radius: 8px;
    position: relative;
}

.task-info {
    flex: 1;
}

.task-time {
    color: #999;
    font-size: 14px;
    padding-bottom: 15px;
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(51, 51, 51, 0.2);
    line-height: 1.4;
}

.task-title-container {
    display: flex;
    align-items: center;
    margin-left: 10px;
}

.task-title {
    font-family: SourceHanSansSC-Regular;
    font-size: 18px;
    color: #333333;
    letter-spacing: 0;
    font-weight: 500;
    line-height: 1.5;
    margin-bottom: 8px;
}

.blue-line {
    height: 20px;
    width: 5px;

    border-left: 3px solid #2F69F8;

}

.task-desc {
    margin-bottom: 12px;
    display: flex;
    font-family: MicrosoftYaHei;
    font-size: 15px !important;
    color: #1A1A1A;
    line-height: 1.6;
    font-weight: 400;
    /* align-items: flex-start; */
    position: relative;

    > .event_arrow {
        right: 0;
        top: 2px;
        width: 20px;
        height: 20px;
        position: absolute;
    }
}

.info-content {
    flex: 1;
    flex-wrap: wrap;
    font-family: SourceHanSansSC-Regular;
    font-size: 15px !important;
    color: #1A1A1A;
    letter-spacing: 0.43px;
    font-weight: 400;
    line-height: 1.6;

    .device_tag{
        font-size: 12px;
        line-height: 12px;
        color: #1A53FF;
        font-weight: 400;
        background: rgba(26,83,255,0.08);
        border-radius: 4px;
        padding: 2px 4px 4px;
        margin-right: 6px;
    }
}

.info-lable {
    /* text-align: right; */
    min-width: 80px;
    font-family: SourceHanSansSC-Regular;
    font-size: 15px !important;
    color: #666666;
    letter-spacing: 0;
    font-weight: 400;
    margin-bottom: 12px;
    line-height: 1.6;

    > img {
        width: 20px;
        height: 20px;
    }
}

.m_b_margin {
    margin: 15px 8px 0 0 !important;
}

.task-desc2 {
    display: flex;
    flex-direction: column;
    font-family: MicrosoftYaHei;
    font-size: 15px !important;
    color: #1A1A1A;
    line-height: 1.6;
    font-weight: 400;
    margin-bottom: 15px;
}

.task-images {
    display: flex;
    flex-direction: column;
    margin-bottom: 3px;
}

.info-lable2 {
    text-align: left;
    min-width: 74px;
    font-family: SourceHanSansSC-Regular;
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    font-weight: 400;
    margin-bottom: 10px;
}

.info-content-avatar {
    width: 28px;
    height: 28px;
    vertical-align: middle;
    border-radius: 50%;
    margin-right: 4px;
}

.location-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    vertical-align: middle;
}

.task-status {
    top: 20px;
    right: 10px;
    position: absolute;
}

.task-status img {
    width: 50px;
}

.image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 8px;
}

.image-item {
    width: 95px;
    height: 95px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #E8E8E8;
    cursor: pointer;
    transition: all 0.3s ease;
}

.imageVideo {
    width: 95px;
    height: 95px;
    border-radius: 8px;
    overflow: hidden;
    background-color: #E8E8E8;
    border: 1px solid #E8E8E8;
    cursor: pointer;
    font-family: AppleSystemUIFont;
    font-size: 12px;
    color: #989EB5;
    font-weight: 400;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.imageVideo img {
    width: 30px;
    margin-bottom: 5px;
}

.image-item:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-item img {
    width: 100%;
    height: 100%;
    /* object-fit: cover; */
}

.image-item {
    position: relative;
}

.delete-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 20px;
    height: 20px;
    background-color: #ff4757;
    color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 10;
}

.delete-btn:hover {
    background-color: #ff3742;
    transform: scale(1.1);
}

.upload-btn {
    width: 95px;
    height: 95px;
    border: 2px dashed #D9D9D9;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    background-color: #FAFAFA;
}

.upload-btn:hover {
    border-color: #3476FC;
    color: #3476FC;
    background-color: #F0F8FF;
}

.upload-icon {
    font-size: 24px;
    color: #D9D9D9;
    margin-bottom: 4px;
    transition: color 0.3s ease;
}

.upload-btn:hover .upload-icon {
    color: #3476FC;
}

.upload-text {
    font-size: 12px;
    color: #999999;
    transition: color 0.3s ease;
}

.upload-btn:hover .upload-text {
    color: #3476FC;
}

.feedback-textarea {
    width: 100%;
    box-sizing: border-box;
    min-height: 100px;
    padding: 12px 16px;
    border: 1px solid #D9D9D9;
    border-radius: 4px;
    font-family: SourceHanSansSC-Regular;
    font-size: 15px;
    resize: vertical;
    outline: none;
    transition: border-color 0.3s ease;
    line-height: 1.6;
}

.feedback-textarea:focus {
    border-color: #3476FC;
    box-shadow: 0 0 0 2px rgba(52, 118, 252, 0.2);
}

.submit-section {
    margin-top: 20px;
    text-align: center;
}

.submit-btn {
    background: #3476FC;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 14px 36px;
    font-family: SourceHanSansSC-Regular;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.submit-btn:hover {
    background: #2B5CD9;
    transform: translateY(-1px);
}

.submit-btn:active {
    transform: translateY(0);
}

.no-data {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
}

.no-data-text {
    font-family: SourceHanSansSC-Regular;
    font-size: 14px;
    color: #999999;
}

/* 图片预览样式 */
.image-preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
}

.image-preview-container {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: scaleIn 0.3s ease;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.close-preview-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    background-color: rgba(0, 0, 0, 0.6);
    color: #FFFFFF;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
}

.close-preview-btn:hover {
    background-color: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes scaleIn {
    from {
        transform: scale(0.8);
    }

    to {
        transform: scale(1);
    }
}

/* 响应式设计 */
@media (max-width: 480px) {
    .task-content {
        padding: 12px;
    }

    .task-item {
        padding: 10px 12px;
        margin-bottom: 8px;
    }

    .image-item,
    .imageVideo {
        width: 85px;
        height: 85px;
    }

    .upload-btn {
        width: 70px;
        height: 70px;
    }

    .info-lable {
        min-width: 70px;
        font-size: 13px;
    }

    .info-content {
        font-size: 13px;
    }
}

@media (max-width: 360px) {
    .image-item,
    .imageVideo {
        width: 65px;
        height: 65px;
    }

    .upload-btn {
        width: 65px;
        height: 65px;
    }

    .upload-icon {
        font-size: 20px;
    }

    .upload-text {
        font-size: 11px;
    }
}

.submit-btn-container {
    position: fixed;
    width: 100%;
    height: 53px;
    background-color: #FFFFFF;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

:deep(.van-button) {
    width: 80%;
    border-radius: 26px;
    line-height: 36px;
}

/* 上传弹窗样式 */
.upload-popup-content {
    padding: 15px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
}

.upload-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
    min-height: 40px;
}

.upload-header h3 {
    font-family: SourceHanSansSC-Regular;
    font-size: 16px;
    color: #333333;
    letter-spacing: 0;
    font-weight: 500;
    line-height: 1.2;
    margin: 0;
}

.upload-header span {
    font-family: SourceHanSansSC-Regular;
    font-size: 14px;
    color: #666666;
    letter-spacing: 0;
    font-weight: 400;
    line-height: 1.2;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.3s ease;
    margin: 0;
}

.upload-header span:hover {
    background-color: #f5f5f5;
}

.upload-options {
    display: flex;
    justify-content: space-around;
    width: 100%;
    flex: 1;
    align-items: center;
}

.option-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 20px;
    border-radius: 8px;
    min-width: 80px;
}

.option-item:hover {
    transform: translateY(-5px);
    background-color: #f8f9fa;
}

.option-item img {
    width: 60px;
    height: 60px;
    margin-bottom: 12px;
    border-radius: 8px;
}

.option-item p {
    font-family: SourceHanSansSC-Regular;
    font-size: 15px;
    color: #333333;
    letter-spacing: 0;
    font-weight: 400;
    line-height: 1.4;
    text-align: center;
    margin: 0;
}

/* 确保上传组件显示在最上层 */
.uploader-high-z-index {
    z-index: 2000 !important;
}

:deep(.uploader-high-z-index .van-overlay) {
    z-index: 2000 !important;
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
</style>
