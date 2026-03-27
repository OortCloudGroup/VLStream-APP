<template>
  <div class="asdPage flexRowAC">
    <div class="asd_hea_sel flexRowAC">
      <div
        v-if="props.mode!==2"
        :class="{'bgColorAct' : active === 1,'borColor': active === 1 }"
        class="asd_hea_sel_item flexRowAC"
        @click="active=1"
      >
        <img v-if="active===1" class="wh5Img" src="@/assets/img/personCenter/zuijin_active.png" />
        <img v-else class="wh5Img" src="@/assets/img/personCenter/zuijin.png" />
        使用
      </div>
      <div
        :class="{'bgColorAct' : active === 2,'borColor': active === 2 }"
        class="asd_hea_sel_item flexRowAC"
        @click="active=2"
      >
        <img
          v-if="active===2"
          class="wh5Img"
          src="@/assets/img/personCenter/zuzhijiagou_active.png"
        />
        <img v-else class="wh5Img" src="@/assets/img/personCenter/zuzhijiagou.png" />
        组织架构
      </div>
      <div
        v-if="props.mode!==2"
        :class="{'bgColorAct' : active === 3,'borColor': active === 3 }"
        class="asd_hea_sel_item flexRowAC"
        @click="active=3"
      >
        <img v-if="active===3" class="wh5Img" src="@/assets/img/personCenter/wodeicon_active.png" />
        <img v-else class="wh5Img" src="@/assets/img/personCenter/wodeicon.png" />
        我的常用
      </div>
      <div
        v-if="props.mode!==2"
        :class="{'bgColorAct' : active === 4,'borColor': active === 4 }"
        class="asd_hea_sel_item flexRowAC"
        @click="active=4"
      >
        <img v-if="active===4" class="wh5Img" src="@/assets/img/personCenter/tags-active.png" />
        <img v-else class="wh5Img" src="@/assets/img/personCenter/tags.png" />
        标签
      </div>
      <div
        v-if="props.mode!==2"
        :class="{'bgColorAct' : active === 5,'borColor': active === 5 }"
        class="asd_hea_sel_item flexRowAC"
        @click="active=5"
      >
        <img v-if="active===5" class="wh5Img" src="@/assets/img/personCenter/search_active.png" />
        <img v-else class="wh5Img" src="@/assets/img/personCenter/search.png" />
        搜索
      </div>
    </div>
    <!--选择 -->
    <div class="asd_data_sel">
      <recently-use-person
        v-if="active === 1 && props.mode !==2"
        :is-single="isSingle"
        :user-list="choosePersonList"
        :disalbed-user-list="disalbedUserList"
        @addPerson="addRecentPerson"
      />
      <dept-user-tree
        v-if="active === 2"
        :mode="props.mode"
        :is-single="isSingle"
        :dept-list="chooseDeptList"
        :user-list="choosePersonList"
        :disalbed-dept-list="disalbedDeptList"
        :disalbed-user-list="disalbedUserList"
        @addPerson="addDeptPerson"
      />
      <my-always-use
        v-if="active === 3 && props.mode !==2"
        :is-single="isSingle"
        :user-list="choosePersonList"
        :disalbed-user-list="disalbedUserList"
        @addPerson="addAlwaysPerson"
      />
      <my-tag
        v-if="active === 4 && props.mode !==2"
        :is-single="isSingle"
        :disalbed-user-list="disalbedUserList"
        :user-list="choosePersonList"
        @addPerson="addTagPerson"
      />
      <search-person
        v-if="active === 5 && props.mode !==2"
        :is-single="isSingle"
        :disalbed-user-list="disalbedUserList"
        :user-list="choosePersonList"
        @addPerson="addSearchPerson"
      />
    </div>
    <!--选择的人员 -->
    <div
      class="asd_content_sel flexRowAC"
      :class="{'open_select': openSelect , 'close_select': !openSelect && startSelect }"
    >
      <div
        class="asd_content_sel_up flexRowAC"
        @click="openSelect=!openSelect;startSelect=true"
      >
        <img
          v-if="openSelect"
          class="su_img"
          src="@/assets/img/personCenter/pullup.png"
        />
        <img v-else class="su_img" src="@/assets/img/personCenter/pulldown.png" />
      </div>
      <div class="selPerChLeBox flexRowAC items_container">
        <div
          v-for="(item,index) in choosePersonList"
          :key="index"
          class="carddd_person flexRowAC"
        >
          <i-d2-head-pic :id="item.oort_uuid" class="carddd_personImg" />
          <span class="selText"> {{ item['oort_name'] }} </span>
          <el-icon class="sel_img_del" @click="removeUser(index)">
            <circleCloseFilled />
          </el-icon>
        </div>
        <div
          v-for="(item,index) in chooseDeptList"
          :key="index+item.oort_dcode"
          class="carddd_person flexRowAC"
        >
          <img
            v-if="item['oort_dept_photo']"
            class="carddd_personImg"
            :src="item['oort_dept_photo']"
          />
          <img v-else class="carddd_personImg" src="@/assets/img/dept_default.png" />
          <span class="selText"> {{ item['oort_dname'] }} </span>
          <el-icon class="sel_img_del" @click="removeDept(index)">
            <circleCloseFilled />
          </el-icon>
        </div>
        <div
          v-if="choosePersonList.length ===0 && chooseDeptList.length ===0"
          class="selPerChLe flexRowAC"
        >
          <span style="font-size: 16px;color: #999">暂未选择</span>
        </div>
      </div>
    </div>
    <!--设置我的地址本-->
    <div class="saveBox flexRowAC">
      <div class="saveTi flexRowAC">
        <img
          class="saveTiImg"
          src="@/assets/img/personCenter/setting.png"
        />
        设置我的地址本
      </div>
      <div class="bt_group">
        <el-button class="common_btn" @click="emits('close')">
          取消
        </el-button>
        <el-button type="primary" class="common_btn" @click="confirmChoose(true)">
          确定
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ID2HeadPic from '@/components/ID2HeadPic.vue'

const props = defineProps({
  // 激活的tab栏目
  activeTab: {
    type: Number,
    default: 1
  },
  // 已选的人员list
  userList: {
    type: Array,
    default: null
  },
  // 已选的部门
  deptList: {
    type: Array,
    default: null
  },
  // 选择模式 1, 部门和人都可以选， 2 只选部门  3 只选人
  mode: {
    type: Number,
    default: 2
  },
  // 是否单选
  isSingle: {
    type: Boolean,
    default: null
  },
  // 禁止选择的的部门
  disalbedDeptList: {
    type: Array,
    default: null
  },
  // 禁止选择的的用户
  disalbedUserList: {
    type: Array,
    default: null
  }
})
const emits = defineEmits(['close', 'saveChoose'])
let chooseDeptList = ref<any>([]) // 选择的部门的合集
let choosePersonList = ref<any>(props.userList || []) // 选择人员的合集
let active = ref<any>(1) // 激活的tab栏目
let openSelect = ref<any>(false)
let startSelect = ref<any>(false)

// 选择最近联系人
const addRecentPerson = (data: any) => {
  choosePersonList.value = data
}

// 组织
const addDeptPerson = (data: any) => {
  choosePersonList.value = data.user
  chooseDeptList.value = data.dept
}

// 我的常用
const addAlwaysPerson = (data: any) => {
  choosePersonList.value = data
}

// 标签
const addTagPerson = (data: any) => {
  choosePersonList.value = data
}

// 搜索
const addSearchPerson = (data: any) => {
  choosePersonList.value = data
}

// 移除人员
const removeUser = (index: number) => {
  choosePersonList.value.splice(index, 1)
}

// 移除部门
const removeDept = (index: number) => {
  choosePersonList.value.splice(index, 1)
}

// 确定
const confirmChoose = (flag: any) => {
  if (flag) {
    emits('saveChoose', { user: choosePersonList.value, dept: chooseDeptList.value })
  } else {
    emits('close')
  }
}
</script>

<style lang="scss" scoped>
.asdPage {
  width: 100%;
  position: relative;
  flex-direction: column;
  align-items: flex-start;

  .asd_hea_sel {
    width: 100%;
    height: 3rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .borColor {
      border-color: var(--el-color-primary);
    }

    .bgColorAct {
      color: var(--el-color-primary);
      background-color: var(--el-menu-hover-bg-color);
    }

    .asd_hea_sel_item {
      justify-content: center;
      cursor: pointer;
      width: 11rem;
      height: 100%;
    }
  }
}

// 图标
.wh5Img {
  width: 1.25rem;
  height: 1.25rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

// 数据选择
.asd_data_sel {
  width: 100%;
  height: 20rem;
  margin-bottom: 7.2rem;
}

// 已选择
.asd_content_sel {
  width: 100%;
  height: 6.4rem;
  flex-direction: column;
  position: absolute;
  bottom: 3rem;
  background-color: #fff;
  z-index: 2;

  .asd_content_sel_up {
    justify-content: center;

    .su_img {
      height: 1rem;
      z-index: 999;
    }
  }

  // 暂未选择
  .selPerChLeBox {
    z-index: 10;
    width: 100%;
    //height: 6rem;
    flex-wrap: wrap;
    overflow-y: auto;

    .selPerChLe {
      width: 100%;
      height: 100%;
      justify-content: center;
    }

    .carddd_person {
      border: 1px solid transparent;
      position: relative;
      width: 8rem;
      height: 6rem;
      flex-direction: column;
      justify-content: center;
    }

    .sel_img_del {
      font-size: 20px;
      display: none;
      cursor: pointer;
      position: absolute;
      right: 4px;
      top: 4px;
    }

    .selText {
      color: #333;
    }

    .carddd_personImg {
      width: 2rem;
      height: 2rem;
      border-radius: 50%
    }

    .carddd_person:hover {
      background-color: #6586BE14;
      border: 1px solid var(--el-color-primary);

      .sel_img_del {
        display: flex !important;
      }
    }
  }
}

// 确定
.saveBox {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  justify-content: space-between;
  height: 2rem;
  width: 100%;

  .saveTi {
    width: 12.2rem;
  }

  .saveTiImg {
    width: 1.25rem;
    height: 1.25rem;
    margin: 0 0.25rem;
  }

  .bt_group {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    height: 4.16667vw;
    -webkit-box-pack: end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    width: 100%;
  }

  .common_btn {
    border-radius: 2px;
    width: 170px;
    height: 48px;
  }
}

.juitCenter {
  justify-content: center;
  align-items: center;
}

.open_select {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) forwards;
}

@keyframes ping {
  0% {
    height: 6rem;
  }
  75%, 100% {
    height: 15rem
  }
}

.close_select {
  animation: pong 1s cubic-bezier(0, 0, 0.2, 1) forwards;
}

@keyframes pong {
  0% {
    height: 15rem;
  }
  100% {
    height: 6rem
  }
}

.items_container {
  align-content: flex-start; // 解决换行的中间空隙
  height: calc(100% - 16px);
  border-top: 0.5px solid #00000020;
  border-bottom: 0.5px solid #00000020;
}

</style>
