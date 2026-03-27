<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2024-11-15 11:45:51
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="more_error">
    <div class="more_error_title">
      <span>错误记录</span>
      <span @click="clearAllErrMsg">全部清理</span>
    </div>
    <div class="more_error_table">
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>错误信息</th>
            <th>接口</th>
            <th>请求时间</th>
            <th>耗时</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item,index) in store.errorMsgList" :key="index">
            <td>{{ index+ 1 }}</td>
            <td>{{ item.msg }}</td>
            <td>{{ item.interfaceName }}</td>
            <td>{{ formatDateToFull(item.startTime) }}</td>
            <td>{{ item.endTime - item.startTime }}ms</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">

import { useErrorMsgStore } from '@/store/modules/useErrorMsg'
import { formatDateToFull } from '@/utils/index'

const store = useErrorMsgStore()

const clearAllErrMsg = () => {
  store.clearAllErrorMsg()
}

</script>

<style lang="scss" scoped>

  .more_error {
    display: flex;
    flex-direction: column;
    &_title {
      height: 32px;
      display: flex;
      align-items: center;
      margin: 0 16px;
      justify-content: space-between;
      span {
        font-size: 16px;
        color: #333;
      }
      span:nth-of-type(2) {
        cursor: pointer;
        color: var(--el-color-primary);
      }
    }
    &_table {
      margin:16px;
      table {
        border-collapse: collapse; /* 合并边框 */
        width: 100%;
      }

      thead {
        background-color: #FAFAFA;
      }
      th, td {
        border: 1px solid rgba(198,203,212,1);; /* 设置边框为1像素实线 */
        padding: 4px; /* 设置单元格内边距 */
        text-align: left; /* 居中对齐 */
      }
      td {
        max-width: 230px;
        word-wrap: break-word;
      }
    }
  }

</style>
