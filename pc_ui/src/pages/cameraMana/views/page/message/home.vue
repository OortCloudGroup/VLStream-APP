<template>
  <div class="home_page">
    <div class="home_content flexRowAC">
      <div class="ho_left">
        <div class="ho_left_con">
          <OPlayer :src="videoInfo.src" :type="videoInfo.type" />
        </div>
        <div class="ho_left_ope flexRowAC">
          <div class="ho_b_op flexRowAC">
            <img v-if="ho1Act" src="@/assets/img/camera/btn/ho1.png" alt="" @click="ho1Act=false" />
            <img v-else src="@/assets/img/camera/btn/ho1_.png" alt="" @click="ho1Act=true" />
            <img src="@/assets/img/camera/btn/ho2.png" alt="" />
            <img src="@/assets/img/camera/btn/ho3.png" alt="" />
            <img src="@/assets/img/camera/btn/ho4.png" alt="" />
          </div>
          <div class="ho_b_op flexRowAC">
            <el-popover
              v-model:visible="aspectRatioVisible"
              placement="bottom"
              :width="260"
              trigger="click"
              popper-class="aspect_ratio_popover"
            >
              <template #reference>
                <div class="ho_b_op_item flexRowAC">
                  <img src="@/assets/img/camera/btn/hor1.png" alt="" />
                  <span class="dropdown_arrow" />
                </div>
              </template>
              <div class="aspect_ratio_menu flexRowAC">
                <div class="aspect_ratio_item" :class="{ active: aspectRatio === '4:3' }" @click="selectAspectRatio('4:3')">
                  4:3
                </div>
                <div class="aspect_ratio_item" :class="{ active: aspectRatio === '16:9' }" @click="selectAspectRatio('16:9')">
                  16:9
                </div>
                <div class="aspect_ratio_item" :class="{ active: aspectRatio === '原始' }" @click="selectAspectRatio('原始')">
                  原始
                </div>
                <div :class="{ active: aspectRatio === 'fit' }" @click="selectAspectRatio('fit')">
                  <img src="@/assets/img/camera/btn/hor1.png" alt="" />
                </div>
              </div>
            </el-popover>
            <el-popover
              v-model:visible="filterVisible"
              placement="bottom"
              :width="180"
              trigger="click"
              popper-class="filter_popover"
            >
              <template #reference>
                <div class="ho_b_op_item flexRowAC">
                  <img src="@/assets/img/camera/btn/hor2.png" alt="" />
                  <span class="dropdown_arrow" />
                </div>
              </template>
              <div class="filter_menu flexRowAC">
                <div class="filter_item">
                  <img src="@/assets/img/camera/btn/ml1.png" alt="" />
                </div>
                <div class="filter_item">
                  <img src="@/assets/img/camera/btn/ml2.png" alt="" />
                </div>
                <div class="filter_item">
                  <img src="@/assets/img/camera/btn/ml3.png" alt="" />
                </div>
              </div>
            </el-popover>
            <div class="ho_b_op_item flexRowAC">
              <img src="@/assets/img/camera/btn/hor3.png" alt="" />
              <span class="dropdown_arrow" />
            </div>
          </div>
        </div>
      </div>
      <div class="ho_right">
        <div class="move_top_f">
          PTZ
        </div>
        <div class="move_top">
          <div class="move_top_direction">
            <img class="direction_arrow direction_up" src="@/assets/img/camera/jt.png" alt="上" />
            <img class="direction_arrow direction_left" src="@/assets/img/camera/jt.png" alt="左" />
            <img class="direction_arrow direction_center" src="@/assets/img/camera/jz.png" alt="重置" />
            <img class="direction_arrow direction_right" src="@/assets/img/camera/jt.png" alt="右" />
            <img class="direction_arrow direction_down" src="@/assets/img/camera/jt.png" alt="下" />
          </div>
        </div>
        <div class="move_top_f">
          光学变倍控制
        </div>
        <div class="move_top_btn flexRowAC">
          <img class="move_top_btn_img" src="@/assets/img/camera/btn/hrb1.png" alt="" />
          <div class="move_top_b_f">
            变倍
          </div>
          <img class="move_top_btn_img" src="@/assets/img/camera/btn/hrb2.png" alt="" />
        </div>
        <div class="ho_op_one flexRowAC">
          <div class="ho_op_one_1 flexRowAC">
            <img src="@/assets/img/camera/btn/hrf1.png" alt="" />
            <img src="@/assets/img/camera/btn/hrf4.png" alt="" />
          </div>
          <div class="ho_op_one_1 flexRowAC">
            <img src="@/assets/img/camera/btn/hrf2.png" alt="" />
            <img src="@/assets/img/camera/btn/hrf5.png" alt="" />
          </div>
          <div class="ho_op_one_1 flexRowAC">
            <img src="@/assets/img/camera/btn/hrf3.png" alt="" />
            <img src="@/assets/img/camera/btn/hrf6.png" alt="" />
          </div>
        </div>
        <div class="ho_op_two flexRowAC">
          <img src="@/assets/img/camera/btn/hrm1.png" alt="" />
          <img src="@/assets/img/camera/btn/hrm2.png" alt="" />
          <img src="@/assets/img/camera/btn/hrm3.png" alt="" />
          <img src="@/assets/img/camera/btn/hrm4.png" alt="" />
          <img src="@/assets/img/camera/btn/hrm5.png" alt="" />
          <img src="@/assets/img/camera/btn/hrm6.png" alt="" />
          <img src="@/assets/img/camera/btn/hrm7.png" alt="" />
          <img src="@/assets/img/camera/btn/hrm8.png" alt="" />
        </div>
        <div class="ho_op_font">
          <div class="ho_op_font_t flexRowAC">
            <div class="ho_op_font_ti act">
              预置点
            </div>
            <div class="ho_op_font_ti">
              巡航
            </div>
          </div>
          <div class="ho_op_c act">
            <span>预置点1</span>
            <img class="ho_op_c_setting" src="@/assets/img/camera/btn/setting.png" alt="设置" />
          </div>
          <div class="ho_op_c">
            预置点1
          </div>
          <div class="ho_op_c">
            预置点1
          </div>
          <div class="ho_op_c">
            预置点1
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

let ho1Act = ref(true)
let aspectRatioVisible = ref(false)
let filterVisible = ref(false)
let aspectRatio = ref('4:3')

const videoInfo = ref({
  src: 'http://146.56.220.167:8082/videocall/AETY-00-NJN2-WJUB-00000100',
  type: 'cameraRTC'
})

const selectAspectRatio = (ratio: string) => {
  aspectRatio.value = ratio
}
</script>
<style lang="scss" scoped>
.ho_op_one {
  gap: 10px;
  padding-top: 20px;

  .ho_op_one_1 {
    flex: 1;
    border-radius: 8px;
    background-color: #fff;
    flex-direction: column;
    gap: 17px;
    padding: 12px 0;

    > img {
      width: 48px;
      height: 48px;
    }
  }
}

// 灯光
.ho_op_two {
  width: 100%;
  margin-top: 10px;
  background-color: #fff;
  padding: 16px 22px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px 8px;
  border-radius: 8px;

  > img {
    width: 48px;
  }
}

// 预置点
.ho_op_font {
  flex: 1;
  background-color: #fff;
  margin-top: 10px;
  border-radius: 8px;

  .ho_op_font_t {
    padding: 20px 20px 10px;
    gap: 40px;
  }

  .ho_op_font_ti {
    cursor: pointer;
    font-size: 16px;
    color: #999999;
    letter-spacing: 0.46px;
    font-weight: 400;
    padding-bottom: 6px;
    position: relative;
  }

  .ho_op_font_ti.act {
    padding-bottom: 6px;
    font-family: MicrosoftYaHei-Bold;
    font-size: 16px;
    color: #1A53FF;
    letter-spacing: 0.46px;
    text-align: center;
    font-weight: 700;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 3px;
      background-color: #1A53FF;
      border-radius: 0;
    }
  }

  .ho_op_c {
    font-size: 14px;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ho_op_c.act{
    color: #1A53FF;
    letter-spacing: 0.4px;
    line-height: 22px;
    font-weight: 400;
    background: rgba(26,83,255,0.12);
  }

  .ho_op_c_setting {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}

.ho_left {
  width: 1564px;
  height: 100%;
  background-color: #dadada;
  display: flex;
  flex-direction: column;

  .ho_left_con {
    width: 1564px;
    flex: 1;
  }

  .ho_left_ope {
    justify-content: space-between;
    background-color: #fff;
  }

  .ho_b_op {
    cursor: pointer;
    padding: 20px;
    gap: 20px;
    img{
      width: 38px;
      height: 38px;
    }
  }

  .ho_b_op_item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dropdown_arrow {
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid #999999;
    margin-left: 2px;
  }
}

.home_content {
  height: 100%;
  background-color: #f7f7f7;
}

.ho_right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;

  .move_top_btn {
    width: 100%;
    height: 40px;
    justify-content: space-between;
    background: #E3EAFF;
    border-radius: 20px;
    padding: 10px 26px;
  }

  .move_top_b_f {
    font-size: 14px;
    color: #1A53FF;
    letter-spacing: 0.4px;
    font-weight: 400;
  }

  .move_top_btn_img {
    width: 24px;
    height: 24px;
  }

  .move_top {
    width: 240px;
    height: 240px;
    background: #E3EAFF;
    border-radius: 50%;
    align-self: center;
    margin-bottom: 32px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .move_top_direction {
    position: relative;
    width: 240px;
    height: 240px;
  }

  .direction_arrow {
    position: absolute;
    cursor: pointer;
    width: 48px;
    height: 27px;
  }

  .direction_up {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  .direction_down {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%) rotate(180deg);
  }

  .direction_left {
    left: 20px;
    top: 50%;
    transform: translateY(-50%) rotate(-90deg);
  }

  .direction_right {
    right: 20px;
    top: 50%;
    transform: translateY(-50%) rotate(90deg);
  }

  .direction_center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90px;
    height: 90px;
  }

  .move_top_f {
    font-size: 18px;
    color: #000000;
    letter-spacing: 0.51px;
    margin-bottom: 12px;
  }
}

.home_page {
  height: 100%;
  width: 100%;
  overflow: auto;
}

// tabs
:deep(.tenanat-tabs) {
  padding: 0 20px;

  .el-tabs__item {
    color: #999999;
  }

  .el-tabs__item.is-active {
    color: var(--el-color-primary);
  }
}

// tabs
:deep(.el-tabs__header) {
  padding-top: 10px;

  .el-tabs__nav-wrap::after {
    display: none;
  }

  .el-tabs__item.is-top {
    font-size: 16px;
    font-weight: 700;
  }
}

.submitBox {
  padding: 40px 20px;

  .submit {
    height: 48px;
    width: 170px;
    text-align: center;
    line-height: 48px;
    background: var(--el-color-primary);
    border-radius: 2px;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;
  }
}
</style>
<style>
.content{
  padding: 0 !important;
}

/* 宽高比菜单样式 */
:deep(.aspect_ratio_popover) {
  padding: 12px !important;
  border-radius: 6px !important;
}

.aspect_ratio_menu {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  img{
    width: 38px;
    height: 38px;
  }
}

.aspect_ratio_item {
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  color: #fff;
  border-radius: 2px;
  cursor: pointer;
  font-size: 12px;
}

/* 滤镜菜单样式 */
:deep(.filter_popover) {
  padding: 8px 12px !important;
  border-radius: 8px !important;
}

.filter_menu {
  display: flex;
  justify-content: space-between;
}

.filter_item {
  cursor: pointer;
}

.filter_item img {
  width: 38px;
  height: 38px;
}
</style>
