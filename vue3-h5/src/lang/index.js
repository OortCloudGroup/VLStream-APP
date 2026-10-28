/**
 Created by  lanjian   on 2023/8/6  20:04
 Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
 */

import { createI18n } from 'vue-i18n'
import { Locale } from 'vant'
import vantZhCN from 'vant/lib/locale/lang/zh-CN'
import vantEnUS from 'vant/lib/locale/lang/en-US'
import EN from './en.js'
import CN from './zh.js'
import AR from './ar.js'
// 页面文案的英文映射：key 为中文原文（扁平结构，避免逐条起名）
import EN_PAGES from './en_pages.js'
// 各页面批次补充的英文映射（子代理/后续维护追加的 key）
import EN_BATCH_A from './pages/batchA.js'
import EN_BATCH_B from './pages/batchB.js'
import EN_BATCH_C from './pages/batchC.js'
import EN_BATCH_D from './pages/batchD.js'
import EN_BATCH_E from './pages/batchE.js'

const EN_PAGE_MESSAGES = {
  ...EN_PAGES,
  ...EN_BATCH_A,
  ...EN_BATCH_B,
  ...EN_BATCH_C,
  ...EN_BATCH_D,
  ...EN_BATCH_E
}

const LOCALE_KEY = 'vl_locale'

export const SUPPORT_LOCALES = [
  { value: 'cn', name: '中文' },
  { value: 'en', name: 'English' }
]

const message = {
  cn: {
    ...CN
  },
  en: {
    ...EN,
    ...EN_PAGE_MESSAGES
  },
  ar: {
    ...AR
  }
}

// vue-i18n 默认把 key 按 '.' 拆成嵌套路径，中文原文 key（常含省略号等）
// 会被错误拆分，这里先做整键匹配，再做嵌套路径兜底
const messageResolver = (obj, path) => {
  if (obj && Object.prototype.hasOwnProperty.call(obj, path)) {
    return obj[path]
  }
  const parts = String(path).split('.')
  let cur = obj
  for (const part of parts) {
    if (cur === null || typeof cur !== 'object' || !Object.prototype.hasOwnProperty.call(cur, part)) {
      return null
    }
    cur = cur[part]
  }
  return cur
}

const savedLocale = localStorage.getItem(LOCALE_KEY) || 'cn'

const i18n = createI18n({
  locale: savedLocale, // 设置语言类型
  legacy: false, // 如果要支持compositionAPI，此项必须设置为false;
  globalInjection: true, // 全局注册$t方法
  fallbackLocale: 'cn',
  missingWarn: false,
  fallbackWarn: false,
  messageResolver,
  messages: message
})

// vant 组件内置文案与 i18n 同步
Locale.use('zh-CN', vantZhCN)
Locale.use('en-US', vantEnUS)

// 同步 vant 内置组件文案（取消、加载中等）
const syncVantLocale = (locale) => {
  Locale.use(locale === 'en' ? 'en-US' : 'zh-CN')
}

syncVantLocale(savedLocale)

/**
 * 切换应用语言并持久化
 * @param {string} locale cn | en
 */
export function setAppLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem(LOCALE_KEY, locale)
  syncVantLocale(locale)
}

export function getAppLocale() {
  return i18n.global.locale.value
}

export default i18n
