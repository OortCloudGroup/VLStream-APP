/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:03:58
 * @Last Modified by: 兰舰
 * @Last Modified time: 2024-11-20 15:01:399
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { ref } from 'vue'
import store from '@/store/index'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  const platformConfig = ref({})

  const setPlatformConfig = (data: any) => {
    platformConfig.value = data
  }

  const getPlatformConfig = () => {
    return platformConfig.value
  }

  return {
    setPlatformConfig,
    getPlatformConfig
  }
})

/** 在 setup 外使用 */
export function useConfigStoreHook() {
  return useConfigStore(store)
}
