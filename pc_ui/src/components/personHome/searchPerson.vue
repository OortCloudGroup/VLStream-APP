/**
Created by  lanjian   on 2021/10/16  10:28
Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
*/
<template>
  <div class="dept_page w-full h-full flex flex-col box-border">
    <div class="w-full h-12 flex flex-row justify-center items-center">
      <el-input
        v-model="keyWord"
        class="w33"
        placeholder="请输入关键字"
        suffix-icon="Search"
        @input="searchDebounce"
        @keydown.enter="getSearchDept"
      />
    </div>
    <div v-if="tableData.length > 0" class="w-full h-12 box-border px-5 flex flex-row justify-between items-center">
      <div>
        <el-checkbox
          v-if="!isSingle"
          v-model="checkedAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
      </div>
    </div>
    <div class="w-full person_list box-border px-5">
      <el-checkbox-group
        v-if="tableData.length > 0"
        v-model="checkList"
        class="w-full h-full flex flex-wrap gap-y-6 box-border pl-6"
        @change="handleCheckedPersonsChange"
      >
        <el-checkbox
          v-for="(item,index) in tableData"
          :key="index"
          class="w-2/5 h-14 mr-12 hover:bg-oortBlue hover:bg-opacity-10 pl-1 item_hover"
          :label="item"
          :disabled="item.disabled"
          style="display: flex;align-items: center"
        >
          <div class="w-full h-full  flex flex-row items-center">
            <i-d2-head-pic :id="item.oort_uuid" class="w-12 h-12" style="border-radius: 50%" />
            <div class="flex flex-col ml-4">
              <span class="text-color333 fontsize14">{{ item.oort_name }}</span>
              <span class="text-color999 fontsize12">{{ item.oort_depname }}</span>
              <span class="text-color999 fontsize12">{{ item.oort_postname }}</span>
            </div>
          </div>
        </el-checkbox>
      </el-checkbox-group>
      <div v-if="tableData.length ===0" class="w-full h-full flex items-center justify-center">
        <span style="font-size: 16px;color: #999">暂无数据</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getdeptuser } from '@/api/unifiedUsert/sso'
import { debounce } from 'lodash-es'
import ID2HeadPic from '@/components/ID2HeadPic.vue'
import { useUserStore } from '@/store/modules/user'

const store = useUserStore()
export default {
  name: 'SearchPerson',
  components: { ID2HeadPic },
  props: {
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
  },
  data() {
    return {
      keyWord: '',
      checkedAll: false,
      checkList: [],
      tableData: [],
      isIndeterminate: false,
      searchDebounce: null,
      tempChooseList: [] // 当前已经选择的，但当前box框没有的
    }
  },
  created() {
    this.searchDebounce = debounce(this.getSearchDept, 800)
    this.tempChooseList = JSON.parse(JSON.stringify(this.userList))
  },
  methods: {
    getSearchDept() {
      // 调用部门
      const params = {}
      params.accessToken = store.userInfo.accessToken
      params.page = 1
      params.pagesize = 99
      params.showUser = 1
      if (this.keyWord) {
        params.keyword = this.keyWord
        getdeptuser(params).then(res => {
          /* this.getSearchUser()*/
          if (res.code === 200) {
            this.tableData = res.data.user || []
            // 默认选择的回填
            this.userList.forEach(itt => {
              this.tableData.forEach(idd => {
                if (itt.oort_uuid === idd.oort_uuid) {
                  // 是否checklist 有个
                  let index = this.checkList.findIndex(itd => {
                    return idd.oort_uuid === itd.oort_uuid
                  })
                  index === -1 && this.checkList.push(idd)
                }
              })
            })
            // 禁止选择的人
            let tempD = this.disalbedUserList || []
            tempD.forEach(itt => {
              this.tableData.forEach(idd => {
                if (itt.oort_uuid === idd.oort_uuid) {
                  idd.disabled = true
                }
              })
            })
            // 计算出那些是在当前tab选的
            this.checkList.forEach(itm => {
              let index = this.tempChooseList.findIndex(itd => {
                return itm.oort_uuid === itd.oort_uuid
              })
              index !== -1 && this.tempChooseList.splice(index, 1)
            })
          }
        })
      }
    },
    handleCheckAllChange(val) {
      this.isIndeterminate = false
      this.checkList = val ? this.tableData : []
      this.isIndeterminate = false
      // 全选 把之前的加进来
      this.$emit('addPerson', val ? [...this.tableData, ...this.tempChooseList] : this.tempChooseList)
    },
    handleCheckedPersonsChange(value) {
      let checkedCount = value.length
      this.checkedAll = checkedCount === this.tableData.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.tableData.length
      if (this.isSingle) {
        if (checkedCount === 0) {
          this.$emit('addPerson', [])
        } else {
          this.$emit('addPerson', [value[checkedCount - 1]])
          this.checkList = [value[checkedCount - 1]]
        }
      } else {
        this.$emit('addPerson', [...value, ...this.tempChooseList])
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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

.dept_page {
  overflow-y-auto {
    overflow-y: auto;
  }

  .justify-start {
    justify-content: flex-start;
  }

  .items-center {
    align-items: center;
  }

  .h-8 {
    height: 2rem;
  }

  .w50 {
    width: 50%;
  }

  .w33 {
    width: 33%;
  }

  .flex-wrap {
    flex-wrap: wrap;
  }

  .h-14 {
    height: 3.5rem;
  }

  .pt-1 {
    padding-top: 0.25rem;
  }

  .ml-4 {
    margin-left: 1rem;
  }

  .pl-1 {
    padding-left: 0.25rem;
  }

  .w-12 {
    width: 3rem;
  }

  .h-12 {
    height: 3rem;
  }

  .rounded-full {
    border-radius: 50%;
  }
}

.w-full {
  width: 100%;
}

.h-full {
  height: 100%;
}

.flex {
  display: flex;
}

.flex-row {
  flex-direction: row;
}

.flex-col {
  flex-direction: column;
}

.hoverIt {
  &:hover {
    background-color: var(--el-color-primary);
  }
}

.bg-oortBlue {
  background-color: var(--el-color-primary);
}

.w-20 {
  width: 5rem;
}

.rounded-3xl {
  border-radius: 1.5rem;
}

.justify-center {
  justify-content: center;
}

.text-white {
  color: #fff;
}

.border-color999 {
  border: 1px solid #999;
}

.w-40 {
  width: 10rem;
}
</style>
