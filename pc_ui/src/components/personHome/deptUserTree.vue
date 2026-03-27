/**
Created by  lanjian   on 2021/10/15  18:29
Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
*/
<template>
  <div class="dept_page w-full h-full flex flex-row">
    <div class="w50 h-full overflow-y-auto">
      <div class="w-full h-8 flex flex-row justify-start items-center">
        <el-input
          v-model="keyWord"
          class="w-2/5 ml-1"
          placeholder="请输入关键字"
          suffix-icon="Search"
          @input="searchDebounce"
          @keydown.enter="searchDebounce"
        />
      </div>
      <el-tree
        ref="tree"
        style="height: calc(100% - 20px - 36px); margin: 10px;overflow: auto"
        :data="treeData"
        :load="getDeptTreeUI"
        :default-expanded-keys="['', '99']"
        lazy
        node-key="oort_dcode"
        :props="defaultProps"
        @node-click="deptClick"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <!--                   <span v-tip.left.bottom.transition="node.label">{{node.label}}</span>-->
            <template v-if="data.oort_uuid">
              <img
                v-if="data.oort_photo"
                style="width: 16px;height: 16px;margin: 0 4px;border-radius: 50%"
                :src="data.oort_photo"
              />
              <img v-else style="width: 16px;margin: 0 4px" src="@/assets/img/tx.png" />
            </template>
            <template v-else>
              <img
                v-if="data.oort_dept_photo"
                style="width: 16px;height: 16px;margin: 0 4px;border-radius: 50%"
                :src="data.oort_dept_photo"
              />
              <img v-else style="width: 16px;margin: 0 4px" src="@/assets/img/dept_default.png" />
            </template>
            <!--                   <span v-tip.left.bottom.transition="node.label">{{node.label}}</span>-->
            <el-tooltip :open-delay="500" class="item" effect="light" :content="node.label" placement="top">
              <span :class="{'delete_text':data.oort_status === 9, 'activeDept': data.oort_dcode === currentDeptCode}">{{
                node.label
              }}</span>
            </el-tooltip>
          </span>
        </template>
      </el-tree>
    </div>
    <div class="w50 h-full flex flex-col justify-between items-center personDiv">
      <div v-if="tableData.length > 0" class="w-full h-8 flex flex-row justify-start" style="margin-left: 16px">
        <el-checkbox
          v-if="!isSingle"
          v-model="checkedAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
      </div>
      <div class="person_list">
        <el-checkbox-group
          v-model="checkList"
          class="w-full h-full flex flex-wrap justify-between content-start"
          @change="handleCheckedPersonsChange"
        >
          <el-checkbox
            v-for="(item,index) in tableData"
            :key="index"
            :disabled="item.disabled"
            class="hoverIt w-full h-14 ml-4 hover:bg-oortBlue hover:bg-opacity-10 pl-1 pt-1 item_hover"
            :value="item"
            style="display: flex;align-items: center"
          >
            <div v-if="item.oort_uuid" class="w-full h-full  flex flex-row items-center">
              <i-d2-head-pic :id="item.oort_uuid" class="w-12 h-12 rounded-full" />
              <div class="flex flex-col ml-4">
                <span class="text-color333 fontsize14">{{ item.oort_name }}</span>
                <span class="text-color999 fontsize12">{{ item.oort_depname }}</span>
                <span class="text-color999 fontsize12">{{ item.oort_zhiji }}</span>
              </div>
            </div>
            <div v-else class="w-full h-full  flex flex-row items-center">
              <img v-if="item.oort_dept_photo" class="w-12 h-12 rounded-full" :src="item.oort_dept_photo" />
              <img v-else class="w-12 h-12 rounded-full" src="@/assets/img/dept_default.png" />
              <div class="flex flex-col ml-4">
                <span class="text-color333 fontsize14">{{ item.oort_dname }}</span>
              </div>
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<script>
import { getdeptuser, usedSet } from '@/api/unifiedUsert/sso'
import ID2HeadPic from '@/components/ID2HeadPic.vue'
import { debounce } from 'lodash-es'
import { useUserStore } from '@/store/modules/user'

const store = useUserStore()
export default {
  name: 'DeptUserTree',
  components: { ID2HeadPic },
  props: {
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
    // 选择模式 1, 部门和人都可以选， 2 只选  3 只选人
    mode: {
      type: Number,
      default: 1
    },
    // 是否单选
    isSingle: {
      type: Boolean,
      default: false
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
  },
  data() {
    return {
      keyWord: '',
      checkedAll: false,
      checkList: [],
      isIndeterminate: false,
      defaultProps: {
        children: 'children',
        label: 'oort_dname',
        isLeaf: (data) => {
          return (data.hadchild === 0)
        }
      },
      treeData: null,
      tableData: [],
      currentDeptCode: '',
      currentDeptName: '所有',
      searchDebounce: null,
      tempChooseList: [], // 当前已经选择的，但当前box框没有的
      tempDeptChooseList: [] // 当前已经选择的，但当前box框没有的
    }
  },
  watch: {
    userList() {
      this.initTempArr()
    }
  },
  created() {
    this.initTempArr()
    this.searchDebounce = debounce(this.getSearchDept, 800)
  },
  methods: {
    initTempArr() {
      this.tempChooseList = JSON.parse(JSON.stringify(this.userList))
      this.tempDeptChooseList = JSON.parse(JSON.stringify(this.deptList))
    },
    getSearchDept() {
      // 调用部门
      const params = {}
      params.accessToken = store.userInfo.accessToken
      params.page = 1
      params.pagesize = 99
      if (this.keyWord) {
        params.keyword = this.keyWord
      } else {
        params.keyword = ''
        this.treeData = [{ oort_dname: '全部', oort_dcode: '' }]
        return
      }
      params.showUser = 1
      getdeptuser(params).then(res => {
        /* this.getSearchUser()*/
        if (res.code === 200) {
          this.treeData = res.data.dept || []
          this.tableData = res.data.user || []
          // 默认选择的回填
          this.resetCheckList(this.tableData)
        }
      })
    },
    getDeptTreeUI(node, resolve) {
      // this.currentNode = node
      // this.currentResolve = resolve
      const params = {}
      params.accessToken = store.userInfo.accessToken
      if (node.level === 0) {
        resolve([{
          oort_dname: '全部',
          oort_dcode: ''
        }])
        return
      } else {
        params.oort_depcode = node.data.oort_dcode
      }
      getdeptuser(params).then(res => {
        if (res.code === 200) {
          resolve(res.data.dept)
        }
      })
    },
    deptClick(data) {
      this.currentDeptName = data.oort_dname
      this.currentDeptCode = data.oort_dcode
      // 获取当前部门子部门和用户
      this.getDefaultList()
    },
    getDefaultList() {
      const params = {}
      params.accessToken = store.userInfo.accessToken
      params.oort_depcode = this.currentDeptCode + ''
      params.showUser = 1
      getdeptuser(params).then(res => {
        // 判断模式 1 ，部门和人都可以选， 2，只可以选部门  3，只可以选人
        if (this.mode === 1) {
          this.tableData = [...(res.data.dept || []), ...(res.data.user || [])]
        }
        if (this.mode === 2) {
          this.tableData = [...(res.data.dept || [])]
        }
        if (this.mode === 3) {
          this.tableData = [...(res.data.user || [])]
        }
        this.checkList = []
        // 默认选择的回填
        this.resetCheckList(this.tableData)
        // 设置全选按钮的状态
        if (this.checkList.length === this.tableData.length) {
          this.checkedAll = true
        }
        if (this.checkList.length === 0) {
          this.checkedAll = false
        }
        if (this.checkList.length !== 0 && this.tableData.length !== 0 && this.checkList.length !== this.tableData.length) {
          this.checkedAll = false
          this.isIndeterminate = true
        }
      })
    },
    // 默认选择的回填
    resetCheckList(arr) {
      // 用户
      this.userList.forEach(itt => {
        arr.forEach(idd => {
          if (itt.oort_uuid && itt.oort_uuid === idd.oort_uuid) {
            // 是否checklist 有个
            let index = this.checkList.findIndex(itd => {
              return idd.oort_uuid === itd.oort_uuid
            })
            index === -1 && this.checkList.push(idd)
          }
        })
      })
      // 部门
      this.deptList.forEach(itt => {
        arr.forEach(idd => {
          if (itt.oort_dcode && itt.oort_dcode === idd.oort_dcode) {
            // 是否checklist 有个
            let index = this.checkList.findIndex(itd => {
              return idd.oort_dcode === itd.oort_dcode
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
      // 禁止选择的部门
      let tempDe = this.disalbedDeptList || []
      tempDe.forEach(itt => {
        this.tableData.forEach(idd => {
          if (itt.oort_dcode === idd.oort_dcode) {
            idd.disabled = true
          }
        })
      })
      // // 计算出那些是在当前tab选的
      // this.checkList.forEach(itm => {
      //   if (itm.oort_dcode) {
      //     let index = this.tempDeptChooseList.findIndex(itd => { return itm.oort_dcode === itd.oort_dcode })
      //     index !== -1 && this.tempDeptChooseList.splice(index, 1)
      //   } else {
      //     let index = this.tempChooseList.findIndex(itd => { return itm.oort_uuid === itd.oort_uuid })
      //     index !== -1 && this.tempChooseList.splice(index, 1)
      //   }
      // })
    },
    handleCheckAllChange(val) {
      this.isIndeterminate = false
      this.checkList = val ? this.tableData : []
      this.isIndeterminate = false
      // 将用户和部门区分开来
      if (val) {
        this.emitData2Parent(this.tableData)
      } else {
        this.emitData2Parent()
      }
    },
    handleCheckedPersonsChange(value) {
      let checkedCount = value.length
      this.checkedAll = checkedCount === this.tableData.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.tableData.length
      // this.$emit('addPerson', value)
      if (this.isSingle) {
        if (checkedCount === 0) {
          this.tempChooseList = []
          this.tempDeptChooseList = []
          // 将用户和部门区分开来
          this.emitData2Parent([])
        } else {
          this.tempChooseList = []
          this.tempDeptChooseList = []
          this.emitData2Parent([value[checkedCount - 1]])
          this.checkList = [value[checkedCount - 1]]
        }
      } else {
        this.emitData2Parent(value)
      }
      if (value.length > 0 && value[value.length - 1].oort_uuid) {
        this.usedSetPerson(value[value.length - 1])
      }
    },
    usedSetPerson(data) {
      const params = {
        accessToken: store.userInfo.accessToken,
        uuid: data.oort_uuid
      }
      usedSet(params)
    },
    // 将用户和部门区分开来
    emitData2Parent(value) {
      if (value) {
        let dept = []
        let user = []

        // 先把所有的去除，在根据选中的添加进来
        // 第一步
        this.tableData.forEach(itm => {
          if (itm.oort_dcode) {
            let index = this.tempDeptChooseList.findIndex(itd => {
              return itm.oort_dcode === itd.oort_dcode
            })
            index !== -1 && this.tempDeptChooseList.splice(index, 1)
          } else {
            let index = this.tempChooseList.findIndex(itd => {
              return itm.oort_uuid === itd.oort_uuid
            })
            index !== -1 && this.tempChooseList.splice(index, 1)
          }
        })
        // 第二步
        value.forEach(item => {
          if (item.oort_uuid) {
            let index = this.tempChooseList.findIndex(itd => {
              return item.oort_uuid === itd.oort_uuid
            })
            index === -1 && user.push(item)
          } else {
            let index = this.tempDeptChooseList.findIndex(itd => {
              return item.oort_dcode === itd.oort_dcode
            })
            index === -1 && dept.push(item)
          }
        })

        this.$emit('addPerson', {
          user: [...user, ...this.tempChooseList],
          dept: [...dept, ...this.tempDeptChooseList]
        })
      } else {
        this.tableData.forEach(item => {
          if (item.oort_dcode) {
            let index = this.tempDeptChooseList.findIndex(itd => {
              return item.oort_dcode === itd.oort_dcode
            })
            index !== -1 && this.tempDeptChooseList.splice(index, 1)
          } else {
            let index = this.tempChooseList.findIndex(itd => {
              return item.oort_uuid === itd.oort_uuid
            })
            index !== -1 && this.tempChooseList.splice(index, 1)
          }
        })
        this.$emit('addPerson', { user: this.tempChooseList, dept: this.tempDeptChooseList })
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.custom-tree-node {
  display: flex;
  align-items: center;
}

.personDiv {
  border-left: 0.5px solid #99999950;
}

.person_list {
  width: 100%;
  margin: 0 auto;
  height: calc(100% - 20px);
  overflow: auto;
}

.activeDept {
  color: var(--oort-primary);
  font-weight: bold;
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

  .flex-col {
    flex-direction: column;
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
  .rounded-full{
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

.hoverIt{
  &:hover {
    background-color: var(--el-color-primary);
  }
}

</style>
