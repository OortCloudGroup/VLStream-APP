<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2024-11-15 11:45:51
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="flexRowAC certPage">
    <el-menu
      class="sidebar-el-menu"
      :class="{subMenuLeft: !storeC.collapse}"
      :default-active="onRoutes"
      :collapse="storeC.collapse"
      router
    >
      <template v-for="item in routesPath">
        <!--  item.children   -->
        <template v-if="item.children && item.children.length > 0">
          <el-sub-menu :key="item.path" :index="item.path">
            <template #title>
              <oort-svg-icon class="elmenuIconImg" :name="item.meta.icon" width="24" height="24" />
              <span v-if="!storeC.collapse">{{ item.meta?.title }}</span>
            </template>
            <div v-for="(subItem,i) in item.children" :key="i">
              <!-- 这里的逻辑是加上，判断是否是管理员，如果不是管理员，就隐藏菜单 -->
              <template v-if="subItem.meta.showMenu && ( !subItem.meta.isAdminAuth || store.userInfo.user_name === 'admin')">
                <el-sub-menu
                  v-if="subItem.children && subItem.children.length > 0"
                  :key="subItem.path"
                  :index="subItem.path"
                >
                  <template #title>
                    <span class="subMenuTitle">
                      {{ subItem.meta?.title }}
                    </span>
                  </template>
                  <el-menu-item v-for="(threeItem, ind) in subItem.children" :key="ind" :index="threeItem.path">
                    {{ threeItem.meta?.title }}
                  </el-menu-item>
                </el-sub-menu>
                <el-menu-item v-else :index="subItem.path">
                  <div v-if="subItem.meta.icon" class="flexRowAC">
                    <oort-svg-icon class="elmenuIconImg" :name="subItem.meta.icon" width="24" height="24" />
                  </div>
                  <div v-else>
                    &nbsp;
                  </div>
                  {{ subItem.meta?.title }}
                </el-menu-item>
              </template>
            </div>
          </el-sub-menu>
        </template>
        <!--   item     -->
        <template v-else>
          <template v-if="item.meta.showMenu">
            <el-menu-item :key="item.path" :index="item.path">
              <oort-svg-icon class="elmenuIconImg" :name="item.meta.icon" width="24" height="24" />
              <template #title>
                <span>{{ item.meta?.title }}</span>
              </template>
            </el-menu-item>
          </template>
        </template>
      </template>
    </el-menu>
    <div class="subMenu_content" :class="{act:storeC.collapse}">
      <router-view class="route_view" />
      <Bottom />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMenuItem } from 'element-plus'
import { useCounter } from '@/store/counter'
import { useUserStore } from '@/store/modules/user'
import Bottom from '@/components/bottom.vue'

const store:any = useUserStore()
const route = useRoute()
const storeC = useCounter()
let routesPath = ref<any>([])

// 默认菜单
// const onRoutes = ref('')
let lastRoute = '' // 上一个激活的可见菜单， 解决跳转详情的
const onRoutes = computed(() => {
  if (route.meta.showMenu) {
    lastRoute = route.path
    return route.path
  } else {
    return lastRoute
  }
})

const initMenu = () => {
  let temPath = ''
  if (route.matched.length > 3) {
    // 找到那个重定向的路由，
    let rm:any = route.matched
    for (let i = rm.length - 1; i >= 0; i--) {
      if (rm[i].redirect) {
        temPath = '/' + rm[i].name
        break
      }
    }
  }
  const localRouter = store.getLocalRouter()
  if (localRouter?.length) {
    localRouter.forEach((item) => {
      if (item.path === temPath) {
        routesPath.value = item.children || []
      }
    })
  } else {
    routesPath.value = route.matched.find(item => item.path === temPath)?.children
  }
  // console.log('当前路由', route.matched)
  // console.log('当前左侧菜单：---', routesPath)
  // 跳转到第一个
  // 先判断当前路径的是否在路由表中，如果在，就跳转路径记录的（历史）, 没有则判断第一个在不在路由表中
  // if (router.hasRoute(route.path.substring(1))) {
  //   console.log('存在路由表中', route.path)
  // } else {
  //   console.log('不存在路由表中', route.path)
  //   // router.push(tempPathArr[0].path)
  // }
}

// 记录上一次的父节点
const lastParentPath = ref('')
const curParentPath = ref('')
// 右边栏 子级路由 3层路由嵌套
watch(() => route.path, () => {
  let temPath = ''
  if (route.matched.length > 3) {
    // 找到那个重定向的路由，
    let rm:any = route.matched
    for (let i = rm.length - 1; i >= 0; i--) {
      if (rm[i].redirect) {
        temPath = '/' + rm[i].name
        break
      }
    }
  }
  curParentPath.value = temPath
  if (lastParentPath.value !== curParentPath.value) {
    lastParentPath.value = curParentPath.value
    initMenu()
  }
}, { immediate: true })

</script>
<style lang="scss" scoped>
.certPage {
  align-items: flex-start;
  height: 100%;
  gap: 20px;

  .sidebar-el-menu.el-menu {
    padding-top: 20px;
    height: calc(100% - 20px);
    overflow: auto;
    &.subMenuLeft {
      width: 260px;
      flex-shrink: 0;
    }
  }

  .subMenu_content {
    height: calc(100% - 20px);
    border-radius: 10px 10px 0px 0px;
    background-color: #fff;
    margin-top: 20px;
    width: calc(100% - 280px);
    overflow: auto;
  }

  .route_view {
    min-height: calc(100vh - 64px);
  }

  .subMenu_content.act {
    flex: 1;
  }
}

:deep(.el-menu) {
  border-right: none;
}

.certPage {
  height: 100%;
  overflow: auto;

  :deep(.el-menu) {
    height: calc(100% - 64px);
    border-left: none;
    background-color: var(--common-bg-color);
    color: rgba(0, 0, 0, 0.65);

    .el-menu-item {
      gap: 10px;
      color: rgba(0, 0, 0, 0.65);
      border-left: 4px solid transparent;

      .elmenuIconImg {
        fill: rgba(0, 0, 0, 0.65) !important;
      }

      &.is-active {
        @extend .ullihover;
        border-left: 4px solid  var(--el-color-primary);

        .elmenuIconImg {
          fill: var(--el-color-primary) !important;
        }

        .el-icon {
          color: var(--el-color-primary);
        }

      }
    }

    > li:hover, .el-sub-menu:hover {
      @extend .ullihover;
    }

    .el-sub-menu {
      .elmenuIconImg {
        fill: rgba(0, 0, 0, 0.65) !important;
      }
    }

    .el-sub-menu.is-active {
      .el-sub-menu__title {
        color: var(--el-color-primary);
      }

      .el-sub-menu__title > .elmenuIconImg {
        fill: var(--el-color-primary) !important;
      }
    }

    .el-sub-menu__title {
      gap: 10px;
      color: rgba(0, 0, 0, 0.65);

      &:hover {
        @extend .ullihover;
      }
    }
  }
}

.ullihover {
  background-color: var(--el-menu-hover-bg-color);
  color: var(--el-color-primary);
}
.elmenuIconImg{
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background-size: cover;
}
.subMenuTitle{
  margin-left: 16px;
}
</style>
