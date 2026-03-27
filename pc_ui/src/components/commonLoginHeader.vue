<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2024-11-15 11:45:51
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="login_header">
    <div class="login_header_left">
      <oort-img style="height:2.19rem;width: auto" :src="props.config.logo" />
      <span style="color: var(--el-color-primary)">{{ props.config.login_logo_text }}</span>
    </div>
    <span class="change_theme_font" @click="themDialogVisible=true">切换主题色</span>
    <el-dialog
      v-model="themDialogVisible"
      title="切换主题色"
      width="30%"
      :append-to-body="true"
    >
      <div class="color_form">
        <div class="color_form_item">
          <span>选择主题颜色</span>
          <el-color-picker
            v-model="themeColor"
            :predefine="predefineColors"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <!--          <el-button @click="dialogVisible = false">取 消</el-button>-->
          <el-button type="primary" @click="handleChangeTheme">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { setThemeColors } from '@/utils/setTheme'
import oortImg from '@/components/oort_img.vue'
const props = defineProps({
  config: {
    type: Object,
    default: null
  }
})

const predefineColors = ref(['#F05A1F', '#2856A5', '#C3030F'])
const themDialogVisible = ref(false)
const themeColor = ref('#F05A1F')
// 存储-切换主题
const handleChangeTheme = () => {
  setThemeColors(themeColor.value)
  window.sessionStorage.setItem('theme', themeColor.value)
  window.localStorage.setItem('theme', themeColor.value)
  themDialogVisible.value = false
}

onMounted(() => {
  let theme = window.sessionStorage.getItem('theme') || window.localStorage.getItem('theme')
  if (theme) {
    themeColor.value = theme
  }
  handleChangeTheme()
})

</script>
<style lang="scss">
.login_header {
  padding: 16px 20px;
  @extend .flexRow;
  align-items: center;
  font-size: 18px;
  span {
    margin-left: 20px;
    color: #fff;
  }
  justify-content: space-between;
}

.login_header_left {
  @extend .flexRow;
  align-items: center;
}

.change_theme_font {
  cursor: pointer;
  font-size: 14px;
}
</style>
