/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 10:54:27
 * @Last Modified by: 兰舰
 * @Last Modified time: 2024-12-02 17:27:32
* @Copyright aPaaS-front-team. All rights reserved.
*/
import config from '@/config/index'
import { useRouter } from 'vue-router'

export default function() {
  const routerHook = useRouter()
  const goWhere = function() {
    if (!!config.notforcedLogin) return
    // 是否跳转到统一的登陆页面 或者 是否在统一门户
    if (config.common && !config.common.commonLoginPage || window.location.href.includes('localhost')) {
      if (routerHook) {
        routerHook.push('/login')
      } else {
        const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}#/login`
        window.location.href = newUrl
      }
    } else {
      setTimeout(() => {
        window.location.replace(config.URL.slice(0, -1) + config.frontURLStr + '/console_manage/index.html')
      }, 800)
    }
  }
  return {
    goWhere
  }
}

