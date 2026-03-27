<template>
  <div v-if="Config.common && Config.common.showBottom" class="bottom_container">
    <div class="bottom_first">
      <oort-img class="bottom_first_img" :src="Config.common.bottomLogo|| Config.common.logo || Config.common.logoWhite" />
      <a class="bottom_first_span" :href="Config.common.contactUSLink" target="_blank">联系我们</a>
      <a class="bottom_first_span" :href="Config.common.legalStatementLink" target="_blank">法律声明</a>
      <a class="bottom_first_span" :href="Config.common.privacyPolicyLink" target="_blank">隐私政策</a>
    </div>
    <div class="bottom_second">
      <span class="bottom_second_span">Copyright © 2019 - {{ new Date().getFullYear() }} {{ Config.common.copyRightCompany }}. All Rights Reserved. </span>
    </div>
    <div class="bottom_trird">
      <span class="bottom_second_span"> 相关服务主体: {{ Config.common.servicesCompany }} </span>
    </div>
    <div class="bottom_fourth">
      <span class="bottom_fourth_span"> {{ Config.common.servicesCompany }} ICP备案/许可证号：{{ Config.common.ICPNumber }}</span>
    </div>
  </div>
</template>

<script setup>
import Config from '@/config/index'

</script>

<style lang="scss" scoped>
    .bottom_container {
        width: calc(100%);
        margin: 0 auto;
        height: 190px;
        display: flex;
        flex-direction: column;
        background-color: #f0f2f5;
    }

    .bottom_first {
        width: 100%;
        height: 64px;
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        &_img {
            width: auto;
            height: 32px;
            margin-right: 16px;
        }
        &_span {
            margin-right: 16px;
            font-size: 12px;
            color: #4A5870;
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 400;
        }
        &_span:hover {
            color: var(--oort-primary);
            cursor: pointer;
            text-decoration: underline;
        }
    }

    .bottom_second {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 32px;
        &_span {
            font-size: 12px;
            color: #4A5870;
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 400;
        }
    }

    .bottom_trird {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 32px;
        &_span {
            font-size: 12px;
            color: #4A5870;
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 400;
        }
    }
    .bottom_fourth {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        height: 32px;
        &_span {
            font-size: 12px;
            color: #4A5870;
            letter-spacing: 0;
            line-height: 18px;
            font-weight: 400;
        }
    }
</style>
