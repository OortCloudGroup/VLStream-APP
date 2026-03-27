<template>
  <div class="sidebar" :class="{sidebarW:!collapse}">
    <div class="sidebarT flexRowAC">
      <div v-if="!collapse" class="flexRowAC">
        <oort-svg-icon width="220" height="36" name="logo" />
      </div>
      <oort-svg-icon v-else width="36" height="36" name="logo_short" />
    </div>
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="collapse"
      unique-opened
      router
    >
      <template v-for="item in routesPath">
        <!--  item.children   -->
        <template v-if="item.children">
          <template v-if="item.menuShow!=='hidden'">
            <el-sub-menu :key="item.path" :index="item.path">
              <template #title>
                <oort-svg-icon
                  width="24"
                  height="24"
                  :name="item.meta?.icon"
                  :color="isMenuActive(item) ? 'var(--el-color-primary)' : '#718096'"
                />
                <span>{{ item.meta?.title }}</span>
              </template>
              <div v-for="(subItem,i) in item.children" :key="i">
                <template v-if="subItem.menuShow!=='hidden'">
                  <el-sub-menu
                    v-if="subItem.children"
                    :key="subItem.path"
                    :index="subItem.path"
                  >
                    <template #title>
                      {{ subItem.meta?.title }}
                    </template>
                    <el-menu-item
                      v-for="(threeItem, j) in subItem.children"
                      :key="j"
                      :index="threeItem.path"
                    >
                      {{ threeItem.meta?.title }}
                    </el-menu-item>
                  </el-sub-menu>
                  <el-menu-item v-else :index="subItem.path">
                    {{ subItem.meta?.title }}
                  </el-menu-item>
                </template>
              </div>
            </el-sub-menu>
          </template>
        </template>
        <!--   item     -->
        <template v-else>
          <template v-if="item.menuShow!=='hidden'">
            <el-menu-item :key="item.path" :index="item.path">
              <oort-svg-icon
                width="24"
                height="24"
                :name="item.meta?.icon"
                :color="isMenuActive(item) ? 'var(--el-color-primary)' : '#718096'"
              />
              <template #title>
                <span>{{ item.meta?.title }}</span>
              </template>
            </el-menu-item>
          </template>
        </template>
      </template>
    </el-menu>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCounter } from '@/store/counter'
import { ElMenuItem } from 'element-plus'
import OortSvgIcon from '@/components/oortSvgIcon/index.vue'
import { messageRoute } from '@/pages/cameraMana/router/message'

const route = useRoute()
const onRoutes = computed(() => {
  return route.path
})
const storeC: any = useCounter()
const collapse = computed(() => storeC.collapse)

// 左侧菜单数据
const routesPath = ref<any>(messageRoute)

// 当前菜单是否处于激活状态（用于高亮左侧 icon 颜色）
const isMenuActive = (item: any) => {
  const current = onRoutes.value

  // 一级菜单（带 children）
  if (item.children && item.children.length) {
    return item.children.some((sub: any) => {
      if (sub.children && sub.children.length) {
        return sub.children.some((three: any) => three.path === current)
      }
      return sub.path === current
    })
  }

  // 普通菜单
  return item.path === current
}

// 统一支付 and 服务商 路由切换
</script>
<style lang="scss" scoped>
.elmenuIconImg {
  width: 20px;
  height: 20px;
  background-size: cover;
  margin-right: 8px;
}

.sidebarT {
  justify-content: center;
  height: 64px;
  font-size: 20px;
  color: #333333;
  font-weight: bold;
  background-color: transparent;
}

.sidebarImg {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-size: cover;
}
.sidebarImg.hei{
  width: auto;
  height: 32px;
}

.sidebar-el-menu:not(.el-menu--collapse), .sidebarW {
  width: 250px;
  flex-shrink: 0;
}

.sidebar {
  height: 100%;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  background-color: transparent;
  &::-webkit-scrollbar {
    display: none;
  }

  :deep(.el-menu) {
    height: calc(100% - 64px);
    border-right: 0px;
    background-color: transparent;
    color: rgba(0, 0, 0, 0.65);

    .el-menu-item {
      color: rgba(0, 0, 0, 0.65);
      border-left: 3px solid transparent;

      &.is-active {
        @extend .ullihover;
        border-left: 3px solid var(--el-color-primary);

        .el-icon {
          color: var(--el-color-primary);
        }

        .el-sub-menu__title > span {
          color: var(--el-color-primary);
        }

        // 选择 显示
        .elmenuIconImg:first-child {
          display: none;
        }

        .elmenuIconImg:nth-child(2) {
          display: flex;
        }
      }
    }

    // 不选择 显示
    .elmenuIconImg:first-child {
      display: flex;
    }

    .elmenuIconImg:nth-child(2) {
      display: none;
    }

    .el-sub-menu.is-active {
      // 选择 显示
      .elmenuIconImg:first-child {
        display: none;
      }

      .elmenuIconImg:nth-child(2) {
        display: flex;
      }

      .el-sub-menu__title {
        color: var(--el-color-primary);
      }
    }

    .el-sub-menu__title {
      color: rgba(0, 0, 0, 0.65);
    }
  }
}

.ullihover {
  background-color: var(--el-color-primary-hb);
  color: var(--el-color-primary);
}
</style>
