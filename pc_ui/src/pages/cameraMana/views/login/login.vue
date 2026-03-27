<template>
  <div v-if="isInitConfig" class="page_container">
    <common-login-header :config="uiConfig.cameraMana" />
    <div class="login_bg">
      <!--      <div class="login_text" />-->
      <div class="login_text">
        <span style="font-size: 12px;color: #FFFFFF;margin-bottom: 8px" />
        <span style="font-size: 18px;color: #FFFFFF;margin-bottom: 8px" />
        <span style="font-size: 24px;color: #FFFFFF;margin-bottom: 8px">{{ uiConfig.cameraMana.loginPageFlag1 }}</span>
        <div class="login_text_flag2">
          <span style="font-size: 14px;color: #FFFFFF;margin-bottom: 8px">{{
            uiConfig.cameraMana.loginPageFlag2
          }}</span>
        </div>
      </div>
      <common-login-form :config="uiConfig.cameraMana" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import uiConfig from '@/config/UIConfig.ts'
import CommonLoginHeader from '@/components/commonLoginHeader.vue'
import CommonLoginForm from '@/components/commonLoginForm.vue'
import initConfig from '@/utils/initConfig'

const isInitConfig = ref(false)
initConfig().then(() => {
  isInitConfig.value = true
})
</script>

<style lang="scss" scoped>
.page_container {
  background-color: var(--el-color-primary);
  background-image: url("@/assets/img/login/admin_bg.png");
  background-size: cover;
}

.login_bg {
  @extend .flexRow;
  @extend .flexCenter;
  width: 81%;
  height: calc(100vh - 68px - 20px);
}

.login_text {
  flex: 1;
  @extend .flexRow;
  @extend .flexCenter;
  flex-direction: column;

  .login_text_flag2 {
    width: 70%;
    margin-top: 8px;
    text-align: center;
  }
}

</style>
