/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:03:53
* @Last Modified by:   兰舰
* @Last Modified time: 2024-11-15 11:03:53
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { ref } from 'vue'
import store from '@/store/index'
import { defineStore } from 'pinia'

export const useErrorMsgStore = defineStore('errorMsg', () => {
  const errorMsgList = ref([])
  const addErrorMsg = (msg) => {
    errorMsgList.value.unshift(msg)
  }

  const clearAllErrorMsg = () => {
    errorMsgList.value = []
  }

  // { id: 'id', msg: ['msg1', 'msg2'] }
  const nodeError = ref([])
  const addNodeError = (msg) => {
    nodeError.value.unshift(msg)
  }
  const clearNodeError = () => {
    nodeError.value = []
  }
  const removeNodeError = (id) => {
    nodeError.value = nodeError.value.filter((item) => item.id !== id)
  }

  const getNodeErrorMsg = (id) => {
    return nodeError.value.find((item) => item.id === id)
  }

  return {
    errorMsgList,
    addErrorMsg,
    clearAllErrorMsg,
    nodeError,
    addNodeError,
    clearNodeError,
    removeNodeError,
    getNodeErrorMsg
  }
})

/** 在 setup 外使用 */
export function useErrorMsgStoreHook() {
  return useErrorMsgStore(store)
}
