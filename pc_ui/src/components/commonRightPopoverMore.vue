<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2025-03-26 16:06:39
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="pover_right">
    <div class="pover_more">
      <!-- <div class="pover_more_item">
        <div class="pover_more_item_title">
          <div>
            <img src="@/assets/img/popover_hy.png" />
            <span>街道行业</span>
          </div>
          <el-icon><ArrowRightBold /></el-icon>
        </div>
      </div> -->
      <div class="pover_more_item">
        <div class="pover_more_item_title" @click="privacyPolicyLink">
          <div>
            <img src="@/assets/img/popover_yinsi.png" />
            <span>隐私</span>
          </div>
          <el-icon><ArrowRightBold /></el-icon>
        </div>
      </div>
      <div class="pover_more_item">
        <div class="pover_more_item_title">
          <div>
            <img src="@/assets/img/popover_feecback.png" />
            <span>反馈</span>
          </div>
          <el-icon><ArrowRightBold /></el-icon>
        </div>
      </div>
      <div class="pover_more_item">
        <div class="pover_more_item_title" @click="changeTheme">
          <div>
            <img src="@/assets/img/popover_theme.png" />
            <span>主题</span>
          </div>
          <el-icon :class="{ 'rotate-icon': openThemePanel }">
            <ArrowRightBold />
          </el-icon>
        </div>
        <div v-if="openThemePanel" class="pover_more_item_content">
          <div class="theme_predefine">
            <div
              v-for="(item, index) in predefineColors"
              :key="index"
              :style="{ backgroundColor: themeColor === item? '#ffffff00': item,borderColor: item}"
              class="theme_predefine_item"
              :class="{ 'theme_predefine_item_active': themeColor === item }"
              @click="changeThemeColor(item)"
            >
              <div v-if=" themeColor === item" :style="{ backgroundColor: item}" />
            </div>
            <el-color-picker
              v-model="themeColor"
              class="theme_predefine_item"
              :teleported="false"
              @change="changeThemeColor(themeColor)"
            />
          </div>
        </div>
      </div>
      <!-- <div class="pover_more_item" @click="resetPS">
        <div class="pover_more_item_title">
          <div>
            <img src="@/assets/img/popover_yinsi.png" />
            <span>重置密码</span>
          </div>
          <el-icon><ArrowRightBold /></el-icon>
        </div>
      </div> -->
      <div class="pover_more_item" @click="logout">
        <div class="pover_more_item_title">
          <div>
            <img src="@/assets/img/popover_logout.png" />
            <span style="color: #FF3C3C ">退出登录</span>
          </div>
          <el-icon><ArrowRightBold /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRightBold } from '@element-plus/icons-vue'
import { ref, defineEmits, onMounted } from 'vue'

const emits = defineEmits(['moreOpr'])
// const resetPS = () => {
//   emits('moreOpr', 'resetPS')
// }

const themeColor = ref('#2856A5')
const openThemePanel = ref(false)
const changeTheme = () => {
  openThemePanel.value = !openThemePanel.value
}
const changeThemeColor = (color) => {
  if (color) {
    themeColor.value = color
    setThemeColors(color)
    window.localStorage.setItem('theme', color)
  } else {
    emits('moreOpr', 'changeTheme')
  }
}
const logout = () => {
  emits('moreOpr', 'logout')
}

import { setThemeColors } from '@/utils/setTheme'
defineProps({
  predefineColors: {
    type: Array,
    default: () => []
  }
})

import Config from '@/config'
const privacyPolicyLink = () => {
  window.open(Config.common.privacyPolicyLink, '_blank')
}

onMounted(() => {
})

</script>

<style lang="scss" scoped>

.pover_right {
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.pover_apps {
  display: flex;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 98%;
  background-color: #fff;
  border-radius: 10px;
}

.pover_apps_item:hover {
  background-color: #fff;
  border-radius: 10px;
}

.pover_apps_item {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 6px;
  justify-content: center;
  cursor: pointer;
  img {
    width: 40px;
    height: 40px;
    border-radius: 100%;
    margin: 8px 0px;
  }
  span {
    margin-top: 8px;
    font-size: 16px;
    color: #575656;
  }
}

.pover_more {
  width: 100%;
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.pover_more_item:hover{
  background-color: #EDF3F9;
}

.pover_more_item {
  display: flex;
  flex-direction: column;
  min-height: 48px;
  background-color: #fff;
  padding: 8px 12px;
  &_title {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    div {
      display: flex;
      align-items: center;
      img {
        width: 24px;
        height: 24px;
        margin-right: 8px;
      }
      span {
        font-size: 16px;
        color: #575656;
      }
    }
  }
  &_content {
    display: flex;
    border-top: 1px solid #fdfdfd;
  }

}

.more_apps {
  height: 48px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more_apps_tips {
  border-radius: 136px 136px 136px 136px;
  border: 1px solid #2278FF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding:2px 12px;
  cursor: pointer;
  span {
    color: #2278FF;
    font-size: 18px;
  }
}

.theme_predefine {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
  &_item {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #f8f8f9;
  }
  &_item_active {
    display: flex;
    align-items: center;
    justify-content: center;
    div {
      width: 16px!important;
      height: 16px!important;
      border-radius: 2px;
    }
  }
  &_item {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #f8f8f9;
  }
  &_item:hover {
    border: 1px solid #464646;
  }
}

.el-icon {
  transition: transform 0.3s ease;
  cursor: pointer;
}

.rotate-icon {
  transform: rotate(90deg);
}

:deep(.el-color-picker) {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #f8f8f9;
}

:deep(.el-color-picker__trigger) {
  width: 100%!important;
  height: 100%!important;
  padding: 0px;
  border: none;
  border-radius: 4px;
}

</style>
