import { defineStore } from 'pinia'

export const useCounter = defineStore('counter', {
  state: () => {
    return {
      collapse: false, // 侧边栏折叠
      channel_list: [] // 渠道类型列表
    }
  },
  getters: {},
  actions: {}
})
