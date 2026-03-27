<template>
  <div class="right_info">
    <span class="right_info_tips">欢迎您</span>
    <!-- <img
      v-if="!!userInfo && userInfo.oort_photo"
      alt=""
      class="right_info_img"
      style="border-radius: 100%"
      :src="userInfo.oort_photo"
    /> -->
    <img alt="" class="right_info_img" src="@/assets/img/login/icon_user.png" />
    <div class="right_name_div">
      <span class="right_info_tips">{{ userName || '未登录' }}</span>
    </div>
    <el-icon size="16px" color="white">
      <CaretBottom />
    </el-icon>
    <el-popover v-model:visible="popoverVisMore" placement="bottom" :width="clacPXToVW(260)" trigger="hover" popper-class="popover_panel_more">
      <template #reference>
        <img class="right_info_nine" src="@/assets/img/camera/nightpointpng_more.png" />
      </template>
      <div class="pover_more">
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
                :style="{ backgroundColor: themeColor === item ? '#ffffff00' : item, borderColor: item }"
                class="theme_predefine_item"
                :class="{ 'theme_predefine_item_active': themeColor === item }"
                @click="changeThemeColor(item)"
              >
                <div v-if="themeColor === item" :style="{ backgroundColor: item }" />
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
        <div v-if="logout" class="pover_more_item" @click="logoutClick">
          <div class="pover_more_item_title">
            <div>
              <img src="@/assets/img/popover_logout.png" />
              <span style="color: #FF3C3C">退出登录</span>
            </div>
            <el-icon><ArrowRightBold /></el-icon>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script lang='ts' setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import { useRouter } from 'vue-router'
import { CaretBottom, ArrowRightBold } from '@element-plus/icons-vue'
import initConfig from '@/utils/initConfig'
import { logout as cameraLogout } from '@/api/cameraMana'
import { setThemeColors } from '@/utils/setTheme'
import { clacPXToVW } from '@/utils'
initConfig()
defineProps({
  logout: {
    type: Boolean,
    default: true
  },
  supplier: {
    type: Boolean,
    default: false
  },
  isDeskTop: {
    type: Boolean,
    default: false
  }
})
const store: any = useUserStore()
const userName = ref(store.userInfo?.userName)
const router = useRouter()

const predefineColors = ref(['#F05A1F', '#2856A5', '#C3030F', '#000000', '#6E00FE', '#DBA101'])
const themeColor = ref('#F05A1F')
const openThemePanel = ref(false)
const popoverVisMore = ref(false)

// 将颜色转换为 HEX 格式
const convertToHex = (color) => {
  if (!color) return null

  // 如果已经是 HEX 格式，直接返回
  if (color.startsWith('#')) {
    return color
  }

  // 如果是 RGB/RGBA 格式，转换为 HEX
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    if (match && match.length >= 3) {
      const r = parseInt(match[0]).toString(16).padStart(2, '0')
      const g = parseInt(match[1]).toString(16).padStart(2, '0')
      const b = parseInt(match[2]).toString(16).padStart(2, '0')
      return `#${r}${g}${b}`.toUpperCase()
    }
  }

  // 如果格式不支持，返回默认值
  return '#F05A1F'
}

const changeTheme = () => {
  openThemePanel.value = !openThemePanel.value
}

const changeThemeColor = (color) => {
  if (color) {
    const hexColor = convertToHex(color)
    themeColor.value = hexColor
    setThemeColors(hexColor)
    window.localStorage.setItem('theme', hexColor)
  }
}

const logoutClick = () => {
  cameraLogout({ }).finally(() => {
    store.removeStoreToken()
    router.push('/login')
  })
}

onMounted(() => {
  const theme = window.localStorage.getItem('theme')
  if (theme) {
    const hexColor = convertToHex(theme)
    themeColor.value = hexColor
    setThemeColors(hexColor)
  }
})
</script>

<style lang="scss" scoped>

.right_name_div {
  /*width: 220px;*/
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
}

.right_info {
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  margin-right: 20px;

  &_tips {
    margin: 0 8px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.65);
    min-width: 48px;
  }

  &_img {
    margin: 0 16px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
}

.caret_icon {
  cursor: pointer;
}

.pover_more {
  width: 100%;
  border-radius: 10px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 6px 0;
}

.pover_more_item:hover {
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

    &:hover {
      border: 1px solid #464646;
    }
  }

  &_item_active {
    display: flex;
    align-items: center;
    justify-content: center;

    div {
      width: 16px !important;
      height: 16px !important;
      border-radius: 2px;
    }
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
  width: 100% !important;
  height: 100% !important;
  padding: 0px;
  border: none;
  border-radius: 4px;
}

.dept_panel {
  width: 100%;
  min-height: 32px;

  span {
    margin-left: 8px;
    font-size: 12px;
    color: #333333;
  }
}

.right_info_nine {
  width: 30px;
  height: 30px;
  cursor: pointer;
  border-radius: 0;
  transition: border-radius 0.5s ease; /* 添加过渡效果 */
}

.right_info_nine:hover {
  border-radius: 4px;
  background-color: #00000015;
}
</style>
<style>
.popover_panel_more {
  background-color: #fff!important;
  border-radius: 10px!important;
  padding: 0!important;
}
.popover_panel_more .el-popper__arrow:before {
  background-color: #fff!important;

}
</style>
