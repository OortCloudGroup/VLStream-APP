/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:02:49
 * @Last Modified by: 兰舰
 * @Last Modified time: 2025-05-08 11:16:20
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { createApp } from 'vue'
import store from '@/store'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
// 注册echarts

import 'element-plus/dist/index.css'
import '@/assets/style/index.scss'

import 'virtual:svg-icons-register'

const app = createApp(App)
app.use(store)
app.use(router)

// 凡是有图标和备注的地方都要加一个ai标志
import aiIconRemark from '@/components/aiIconRemark.vue'
app.component('AiIconRemark', aiIconRemark)

import TableSelf from '@/components/TableSelf.vue'
app.component('TableSelf', TableSelf)

import ButtonGroup from '@/components/buttonGroup.vue'
app.component('ButtonGroup', ButtonGroup)

// 高级搜索-导出
import SearchHeightBox from '@/components/SearchHeightBox.vue'
import ExportExcelPdf from '@/components/exportExcelPdf.vue'
app.component('SearchHeightBox', SearchHeightBox)
app.component('ExportExcelPdf', ExportExcelPdf)

// 注册elementplus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

//  自定义指令
import Directive from '@/directive/index'
app.use(Directive)

app.mount('#app')
