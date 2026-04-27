<template>
  <div class="list appRecPage">
    <div
      v-for="(item, inde) in historyProcNodeList"
      :key="item.activityId + inde"
      class="items items_info"
      :class="{ no_finishD: !item.endTime }"
    >
      <div class="child">
        <div class="fl">
          <div class="pic pb">
            <img
              v-if="!item.endTime"
              src="@/assets/img/process-flow/audit.png"
              mode="widthFix"
              class="p e"
            />
            <img
              v-else
              src="@/assets/img/process-flow/node.png"
              mode="widthFix"
              class="p"
            />
          </div>
          <!--审批记录 人员-->
          <div class="grow items_grow flexRowAC">
            <div class="name">
              {{ item.activityName }}
              <template v-if="!item.activityName">
                <!--结束-->
                <div v-if="item.activityType === 'endEvent'" class="nodeDesc">
                  {{ item.assigneeName ? '结束' : '系统' }}
                </div>
                <div v-else-if="item.activityType === 'startEvent'" class="nodeDesc">
                  开始
                </div>
                <div v-else class="nodeDesc">
                  {{ item.activityName ? '' : '系统节点' }}
                </div>
              </template>
            </div>
            <!--状态-->
            <div class="items_grow_status flexRowAC">
              <div class="items_grow_status_div">
                <div v-if="item.assigneeName" class="items_grow_s_t flexRowAC">
                  {{ item.assigneeName }}
                  <!--操作时间-->
                  <span class="node_descpit">{{ item.createTime }}</span>
                </div>
                <div v-if="item.activityType==='endEvent'" class="process">
                  结束
                </div>
                <!--候选办理-->
                <div v-if="item.candidate" class="process">
                  {{ '候选办理：' + item.candidate }}
                </div>
                <!--抄送人-->
                <div
                  v-if="item.wfCopyUser && item.wfCopyUser.length > 0"
                  class="copy_user"
                >
                  抄送人：
                  <span
                    v-for="(imt, innde) in item.wfCopyUser"
                    :key="innde"
                  >{{ imt.nickName }} ,</span>
                </div>
                <!--流程状态-->
                <div v-if="item.commentList&&item.commentList.length > 0" class="i_g_s_style">
                  <div v-for="(itd, ind) in item.commentList.slice().reverse()" :key="ind">
                    <span v-if="itd.type === '1'" class="s_s span_status_1">{{ displayStatus(itd.type) }}</span>
                    <span v-if="itd.type === '2'" class="s_s span_status_2">{{ displayStatus(itd.type) }}</span>
                    <span v-if="itd.type === '3'" class="s_s span_status_3">{{ displayStatus(itd.type) }}</span>
                    <span v-if="itd.type === '4'" class="s_s span_status_4">{{ displayStatus(itd.type) }}</span>
                    <span v-if="itd.type === '5'" class="s_s span_status_5">{{ displayStatus(itd.type) }}</span>
                    <span v-if="itd.type === '6'" class="s_s span_status_6">{{ displayStatus(itd.type) }}</span>
                    <span v-if="itd.type === '7'" class="s_s span_status_7">{{ displayStatus(itd.type) }}</span>
                    <span class="s_s_time">{{ itd.time }}</span>
                    <div class="s_s_mess">
                      {{ itd.fullMessage }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--item-end-->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps(['historyProcNodeList'])
const historyProcNodeList = ref(props.historyProcNodeList || []) // 流转记录

// 按钮类型
function displayStatus(val) {
  switch (val) {
    case '1':
      return '通过'
    case '2':
      return '退回'
    case '3':
      return '驳回'
    case '4':
      return '委派'
    case '5':
      return '转办'
    case '6':
      return '终止'
    case '7':
      return '撤回'
  }
}
</script>

<style lang="scss" scoped>
.list {
  overflow: hidden;
  margin-top: 16px;

  .items {
    width: 100%;
    position: relative;

    .dadd {
      width: 300px;
      display: block;
      margin-top: 4px;
      font-size: 14px;
      color: #999999;
      margin-left: calc(100% - 300px);
    }

    .hf {
      width: 300px;
      padding: 10px;
      border-radius: 4px;
      display: block;
      margin-top: 10px;
      background-color: #f6f6f6;
      font-size: 14px;
      color: #333333;
      line-height: 16px;
      margin-left: calc(100% - 300px);
    }

    &:last-child::after {
      display: none;
    }

    &::after {
      content: "";
      width: 1px;
      height: calc(100% - 40px);
      background-color: #84a4ff;
      position: absolute;
      left: 20px;
      top: 40px;
    }

    &.shz {
      .child {
        .fl {
          .grow .tip {
            color: #ff774e;
          }
        }
      }
    }

    &.ybh {
      .child {
        .fl {
          .grow .tip {
            color: #ff3a30;
          }
        }
      }
    }

    .child {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .time {
        display: block;
        font-size: 14px;
        color: #999999;
      }

      .fl {
        display: flex;
        width: 100%;

        .pic {
          width: 40px;
          height: 40px;
          position: relative;
          border-radius: 4px;
          flex: none;

          .i {
            width: 18px;
            position: absolute;
            right: -6rpx;
            bottom: -6rpx;
          }

          .p {
            width: 100%;
          }

          .p.e {
            padding-top: 4px;
          }
        }

        .pic.pb {
        }

        .grow {
          width: 100%;
          align-items: flex-start;
          flex-direction: column;
          overflow: hidden;
          margin-left: 8px;

          .name {
            display: block;
            font-size: 16px;
            line-height: 16px;
            color: #000000;

            .nodeDesc {
              margin-left: 4px;
              font-size: 14px;
              color: #999 !important;
            }
          }

          .tip {
            display: block;
            font-size: 14px;
            color: #0dba1e;
          }
        }
      }
    }
  }
}

.items_info {
  padding-bottom: 20px;
}

.s_s_mess {
  padding: 5px 0;
  font-size: 10px;
}

.s_s_time {
  float: right;
  color: #909399;
  padding-top: 1px;
  font-size: 11px;
}

.items_grow_status, .items_grow_status_div, .items_grow_s_t {
  width: 100%;
  justify-content: space-between;
}

.node_descpit {
  font-size: 11px;
  color: #999;
}

.s_s {
  line-height: 16px;
  margin-right: 4px;
  font-size: 12px;
  border-radius: 2px;
}

.span_status_1 {
  color: #4876ff;
  //background: #d0f5e0;
  border-color: #d0f5e0;
}

.span_status_2 {
  color: #ff960b;
  //background: #f2eae3;
  border-color: #d0f5e0;
}

.span_status_3 {
  color: #ff0000;
  //background: #efdbdb;
  border-color: #efdbdb;
}

.span_status_4 {
  color: #0004f9;
  //background: #d0daf5;
  border-color: #d0daf5;
}

.span_status_5 {
  color: #bf00f6;
  //background: #e6cfed;
  border-color: #e6cfed;
}

.span_status_6 {
  color: red;
  //background: #ffe0e0;
  border-color: #ffe0e0;
}

.span_status_7 {
  color: #f507ee;
  //background: #e6cfed;
  border-color: #e6cfed;
}
</style>
