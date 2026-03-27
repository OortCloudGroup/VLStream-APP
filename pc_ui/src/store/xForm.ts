import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useXFormStore = defineStore('xForm', () => {
  const pageProp = ref<any>(JSON.parse(window.localStorage.getItem('pageProp')) || { style: { width: 210, height: 297 }})
  const currentTable = ref<any>([])

  const SET_PAGE_PROP = (value) => {
    window.localStorage.setItem('pageProp', JSON.stringify(value))
    pageProp.value = value
  }

  const SET_CURRENT_TABLE = (value) => {
    currentTable.value = value
  }

  return { pageProp, SET_PAGE_PROP, currentTable, SET_CURRENT_TABLE }
})
