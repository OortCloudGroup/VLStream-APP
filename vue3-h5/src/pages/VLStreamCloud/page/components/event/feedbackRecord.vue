<template>
  <div class="feedbackRecord-page">
    <nav-header-banner :title="$t('反馈记录')" />
    <div class="content">
      <van-tabs v-model="activeTab">
        <van-tab v-for="(tab, a) in tabs" :key="a" :title="$t(tab.title)" :name="tab.title">
          <template v-if="tab.mod_type===1">
            <div class="eventBuiltBox flexRowAC">
              <div>
                <div class="t1">
                  {{ $t('添加事件处置记录') }}
                </div>
                <div class="t2">
                  {{ $t('事件闭环，问题整改') }}
                </div>
              </div>
              <div class="btn flexRowAC" @click="eventBuiltFn">
                {{ $t('添加反馈') }}
                <van-icon name="plus" />
              </div>
            </div>
            <feedback-record-list />
          </template>
          <feedback-record-work v-if="tab.mod_type===2" />
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavHeaderBanner from '@/components/navHeaderBanner/index.vue'
import FeedbackRecordList from '@/pages/VLStreamCloud/page/components/event/feedbackRecordList.vue'
import FeedbackRecordWork from '@/pages/VLStreamCloud/page/components/event/feedbackRecordWork.vue'

const router = useRouter()
const route = useRoute()
const activeTab = ref('反馈记录')

const tabs = ref([{
  title: '反馈记录',
  mod_type: 1
},
{
  title: '工单记录',
  mod_type: 2
}
])

// 马上新建
const eventBuiltFn = () => {
  router.push({
    path: '/feedbackRecordAdd',
    query: { event_id: route.query.event_id, mod_type: route.query.mod_type }
  })
}

</script>

<style scoped lang="scss">
.header-banner {
  background-color: #ffff !important;
  color: #000 !important;
}

.feedbackRecord-page {
  background-color: #F6F5F8;
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;

  .content {
    height: calc(100vh - 54px); /* 减去nav-header-banner的高度 */
    width: 100%;
  }
}

.card-item {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  width: 86%;
  margin: 0 auto;
  margin-top: 22px;

  &:not(:first-child) {
    margin-top: 15px;
  }

  .card-but {
    font-family: MicrosoftYaHei;
    font-size: 12px;
    color: #2F69F8;
    letter-spacing: 0;
    font-weight: 400;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .card-hui {
    padding: 12px;
    background-color: #F6F5F8;
    border-radius: 8px;
    margin-top: 8px;

    .label {
      font-family: 'SourceHanSansSC-Regular', sans-serif;
      font-size: 13px;
      color: #B1B9C5;
      font-weight: 400;
      margin-left: 3px;
    }

    .value {
      font-family: 'SourceHanSansSC-Regular', sans-serif;
      font-size: 13px;
      color: #3D3D3D;
      font-weight: 500;
      margin-left: 14px;
    }

    .biaoti {
      font-family: SourceHanSansSC-Medium;
      font-size: 14px;
      color: #3D3D3D;
      font-weight: 500;
    }

    .neirong {
      font-family: SourceHanSansSC-Regular;
      font-size: 14px;
      color: #666666;
      font-weight: 400;
      margin-top: 8px;
      line-height: 16px;
      white-space: normal;
    }
  }

  .anniu {
    display: flex;
    justify-content: space-around;
    margin-top: 24px;

    div {
      border: 1px solid rgba(1, 93, 252, 1);
      border-radius: 24px;
      font-family: OPPOSans-M;
      font-size: 14px;
      color: #015DFC;
      text-align: center;
      font-weight: 500;
      padding: 15px 32px 15px 32px;
      width: 100%;
    }
  }

  .anniu3 {
    display: flex;
    justify-content: space-around;
    margin-top: 24px;

    div {
      border: 1px solid rgba(1, 93, 252, 1);
      border-radius: 24px;
      font-family: OPPOSans-M;
      font-size: 14px;
      color: #015DFC;
      text-align: center;
      font-weight: 500;
      padding: 15px 1.5px 15px 1.5px;
    }
  }
}

.status-tag {
  background-color: #fdf3d2;
  color: #EC6C14;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.status-tag {
  background-color: #fdf3d2;
  color: #EC6C14;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-tag1 {
  background-color: #ebfff2;
  color: #14EC41;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-tag2 {
  background-color: #fff6ed;
  color: #EC2E14;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.status-tag3 {
  background-color: #edf3ff;
  color: #2DB5FF;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-content {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #f0f0f0;
  padding-top: 10px;
  margin-top: 10px;
  line-height: 11px;

  .label {
    font-family: 'SourceHanSansSC-Regular', sans-serif;
    font-size: 13px;
    color: #B1B9C5;
    font-weight: 400;
    margin-left: 3px;
    line-height: 21px;

  }

  .value {
    font-family: 'SourceHanSansSC-Regular', sans-serif;
    font-size: 13px;
    color: #3D3D3D;
    font-weight: 500;
    margin-left: 14px;
    line-height: 21px;
  }

}

.info-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;

  img {

    width: 20px;
    height: 20px;
  }
}

:deep(.van-tabs__nav--line) {
  background-color: #F6F5F8 !important;
}

.top-navigation {
  height: 80px;
  background-color: white;
  font-size: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.kk-navigation {
  display: flex;
  width: 60%;
  justify-content: space-between;
  margin-left: 16px;

}

.search-bar img {
  width: 24px;
  height: 24px;
}

.action-buttons {
  display: flex;
  justify-content: space-around;
  padding: 20px;
}

.table-container {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.8%;
}

.table-header {
  background-color: #f0f0f0;
  display: flex;
  font-size: 12px;
}

.table-header.view.table-cell {
  height: 40px;
  line-height: 40px;
  border-bottom: 1px solid #ccc;
  text-align: center;
  color: #333;
}

.table-body {
  background-color: #fff;
}

.table-row {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.table-cell {
  flex: 1;
  height: 48px;
  line-height: 48px;
  border-bottom: 1px solid #ccc;
  text-align: center;
  color: #333;
}

.no-expand {
  transform: rotate(180deg);
}

:deep(.van-tabs__content) {
  margin-top: 16px;
  background-color: #fff;
  height: calc(100vh - 110px);
  overflow: hidden;
}

:deep(.leaflet-popup-content) {
  // margin: 12px !important;
  width: 76vw !important;
}

:deep(.van-list) {
  min-height: 500px;
}

.eventBuiltBox {
  height: 30px;
  padding: 16px;
  margin: 16px 16px 0;
  background: #E7EDFF;
  border-radius: 8px;
  justify-content: space-between;

  .t1 {
    font-family: MicrosoftYaHeiSemibold;
    font-size: 15.84px;
    color: #3F70FF;
    letter-spacing: 0;
    font-weight: 600;
  }

  .t2 {
    font-family: MicrosoftYaHei;
    font-size: 12px;
    color: #3F70FF;
    letter-spacing: 0;
    font-weight: 400;
  }

  .btn{
    background-image: linear-gradient(0deg, #20B83E 0%, #50FF73 100%);
    box-shadow: 0px 4px 6px 0px rgba(32,184,62,0.3);
    border-radius: 15px;
    padding: 6px 10px;
    font-family: MicrosoftYaHei;
    font-size: 12px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;

    >.van-icon{
      font-size: 14px;
      margin-left: 6px;
    }
  }
}
</style>
