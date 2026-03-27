<template>
  <div class="rup_page flexRowAC">
    <div class="rup_inputBox flexRowAC">
      <el-input
        v-model="keyWord"
        class="rup_input"
        placeholder="请输入关键字"
        suffix-icon="Search"
        @input="searchDebounce"
        @change="searchDebounce"
      />
    </div>
    <div v-if="usedList.length > 0" class="rup_useL_selBox flexRowAC">
      <el-checkbox
        v-if="!isSingle"
        v-model="checkedAll"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
      >
        全选
      </el-checkbox>
      <span class="txColor" @click="clearContact">清空联系人</span>
    </div>
    <div class="rup_useLBox person_list">
      <el-checkbox-group
        v-if="usedList.length > 0"
        v-model="checkList"
        class="rup_useLItem flexRowAC"
        @change="handleCheckedPersonsChange"
      >
        <el-checkbox
          v-for="(item,index) in usedList"
          :key="index"
          class="rup_useLItemIt flexRowAC item_hover"
          :value="item"
          :disabled="item.disabled"
          style="display: flex;align-items: center;"
        >
          <div class="flexRowAC">
            <i-d2-head-pic :id="item.oort_uuid" />
            <div class="flexRowAC rup_useLItemItText">
              <span class="rup_useLItemItTextS">{{ item['oort_name'] }}</span>
              <span class="rup_useLItemItTextS fs12">{{ item['oort_depname'] }}</span>
              <span class="rup_useLItemItTextS fs12">{{ item['oort_postname'] }}</span>
            </div>
          </div>
        </el-checkbox>
      </el-checkbox-group>
      <div v-if="usedList.length ===0" class="selPer flexRowAC">
        暂未选择
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { debounce } from 'lodash-es'
import { usedDel, usedGet } from '@/api/unifiedUsert/sso'
import { useUserStore } from '@/store/modules/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import ID2HeadPic from '@/components/ID2HeadPic.vue'

const store: any = useUserStore()
const props = defineProps({
  // 是否单选
  isSingle: {
    type: Boolean,
    default: false
  },
  // 已选的人员list
  userList: {
    type: Array,
    default: null
  },
  // 禁止选择的的用户
  disalbedUserList: {
    type: Array,
    default: null
  }
})
const emits = defineEmits(['addPerson'])
let keyWord = ref<any>('')
let checkedAll = ref<any>(false)
let checkList = ref<any>([])
let usedList = ref<any>([])
let tempChooseList = ref<any>([]) // 当前已经选择的，但当前box框没有的
let isIndeterminate = ref<any>(false)
let searchDebounce = ref<any>(null)

// 清空联系人
const clearContact = () => {
  ElMessageBox.confirm('确认清空最近使用', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const params = {
      accessToken: store.userInfo.accessToken
    }
    usedDel(params).then((res: any) => {
      if (res.code === 200) {
        ElMessage.success('操作成功')
        usedList.value = []
      }
    })
  })
}

// 获取最近联系人
const getRecentyPerson = () => {
  let data = {
    accessToken: store.userInfo.accessToken,
    keyword: keyWord.value
  }
  usedGet(data).then((res: any) => {
    if (res.code === 200) {
      usedList.value = res.data.list || []
      // 默认选择的回填
      props.userList.forEach((itt: any) => {
        usedList.value.forEach((idd: any) => {
          if (itt.oort_uuid === idd.oort_uuid) {
            // 是否checklist 有个
            let index = checkList.value.findIndex(itd => {
              return idd.oort_uuid === itd.oort_uuid
            })
            index === -1 && checkList.value.push(idd)
          }
        })
      })
      // 禁止选择的人
      let tempD = props.disalbedUserList || []
      tempD.forEach((itt: any) => {
        usedList.value.forEach(idd => {
          if (itt.oort_uuid === idd.oort_uuid) {
            idd.disabled = true
          }
        })
      })
      // 计算出那些是在当前tab选的
      checkList.value.forEach(itm => {
        let index = tempChooseList.value.findIndex(itd => {
          return itm.oort_uuid === itd.oort_uuid
        })
        index !== -1 && tempChooseList.value.splice(index, 1)
      })
    }
  })
}

// 全选
const handleCheckAllChange = (val) => {
  isIndeterminate.value = false
  checkList.value = val ? usedList.value : []
  // 全选 把之前的加进来
  emits('addPerson', val ? [...usedList.value, ...tempChooseList.value] : tempChooseList.value)
}

// 勾选
const handleCheckedPersonsChange = (value) => {
  let checkedCount = value.length
  checkedAll.value = checkedCount === usedList.value.length
  isIndeterminate.value = checkedCount > 0 && checkedCount < usedList.value.length
  if (props.isSingle) {
    if (checkedCount === 0) {
      emits('addPerson', [])
    } else {
      emits('addPerson', [value[checkedCount - 1]])
      checkList.value = [value[checkedCount - 1]]
    }
  } else {
    emits('addPerson', [...value, ...tempChooseList.value])
  }
}
const init = () => {
  searchDebounce.value = debounce(() => getRecentyPerson(), 800)
  tempChooseList.value = JSON.parse(JSON.stringify(props.userList))
  getRecentyPerson()
}

onMounted(() => {
  init()
})

</script>

<style lang="scss" scoped>
.rup_page {
  width: 100%;
  height: 100%;
  flex-direction: column;

  .rup_inputBox {
    width: 100%;
    height: 3rem;
    margin-top: 0.5rem;
    justify-content: center;

    .rup_input {
      width: 60%;
    }
  }
}

// 全选
.rup_useL_selBox {
  height: 3rem;
  width: 100%;
  justify-content: space-between;
  padding-left: 1.25rem;
  padding-right: 1.25rem;

  .txColor {
    cursor: pointer;
    color: var(--el-color-primary);
  }
}

// 人员
.rup_useLBox {
  padding-left: 1.25rem;
  padding-right: 1.25rem;

  .rup_useLItem {
    flex-wrap: wrap;
    row-gap: 1.5rem;
    padding-left: 1.5rem;
    align-content: flex-start;
  }

  .rup_useLItemIt {
    height: 3.5rem;
    width: 40%;
    padding-left: 0.25rem;
    margin-right: 3rem;

    &:hover {
      background-color: var(--el-color-primary);
    }
  }

  .rup_useLItemItText {
    margin-left: 1rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .rup_useLItemItTextS {
    font-size: 14px;
    color: #333;
  }

  .rup_useLItemItTextS.fs12 {
    color: #999;
    font-size: 12px;
  }
}

// 暂未选择
.selPer {
  width: 100%;
  height: 100%;
  justify-content: center;
  font-size: 16px;
  color: #999;
}

.person_list {
  width: 100%;
  margin: 0 auto;
  height: calc(100% - 118px);
  overflow: auto;
}

.item_hover:hover {
  color: #fff !important;

  span {
    color: #fff !important;
  }
}
</style>
