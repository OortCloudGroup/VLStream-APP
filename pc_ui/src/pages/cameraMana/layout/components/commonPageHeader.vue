<template>
  <div class="header_container flexRowAC">
    <div class="flexRowAC">
      <div v-if="props.coll" class="collapse-btn flexRowAC" @click="collapseChage">
        <oort-svg-icon v-if="!collapse" class="collapseImg" width="45" height="35" name="expand" />
        <oort-svg-icon v-else class="collapseImg collapsed" width="45" height="35" name="expand" />
      </div>
      <!--预览-->
      <div v-else class="flexRowAC">
        <div class="sidebarTBox flexRowAC">
          <div class="flexRowAC">
            <oort-svg-icon width="220" height="36" name="logo" />
          </div>
        </div>
        <div class="collapse-btn flexRowAC">
          <div class="collapseImg" />
        </div>
      </div>
      <div class="flexRowAC configBox">
        <div class="configItem" :class="{act:isAct===0}" @click="configClick(0)">
          预览
        </div>
        <div class="configItem" :class="{act:isAct===1}" @click="configClick(1)">
          配置
        </div>
      </div>
    </div>
    <common-page-header-right-info />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import CommonPageHeaderRightInfo from './commonPageHeaderRightInfo.vue'
import { computed } from 'vue'
import { useCounter } from '@/store/counter'
import { useRouter } from 'vue-router'

const storeC = useCounter()
const router = useRouter()
const emits = defineEmits(['handle'])
const props = defineProps(['coll'])
const collapse = computed(() => storeC.collapse)
let isAct = ref(1)
isAct.value = router.currentRoute.value.path === '/home' ? 0 : 1

// 侧边栏折叠
const collapseChage = () => {
  storeC.collapse = !collapse.value
}

// 预览
const configClick = (val) => {
  isAct.value = val
  if (val === 0) {
    emits('handle', false)
    router.push('home')
  }
  if (val === 1) {
    emits('handle', true)
    router.push('system')
  }
}
</script>
<style lang="scss" scoped>
.configBox {
  padding-left: 130px;
  gap: 56px;

  .configItem {
    cursor: pointer;
    font-size: 18px;
    color: #999999;
  }
  .configItem.act{
    color: var(--el-color-primary);
  }
}

.header_container {
  flex: 1;
  height: 64px;
  min-height: 64px;
  margin-left: -20px;
  justify-content: space-between;
  background-color: transparent;
  border-left: 1px solid rgba(241, 242, 244, 1);
}

.collapse-btn {
  cursor: pointer;
  margin-left: 20px;
  margin-right: 24px;
}

.collapseImg {
  background-size: cover;

  &.collapsed {
    transform: rotate(180deg);
  }
}

.routerBox {
  font-size: 16px;
  color: #333333;
  gap: 8px;

  .targetR {
    font-size: 16px;
    color: #939393;
  }
}

.sidebarTBox {
  width: 250px;
  margin-left: 20px;
  justify-content: center;
  height: 64px;
  font-size: 20px;
  color: #333333;
  font-weight: bold;
  background-color: transparent;
}

.coll_img{

}
</style>
