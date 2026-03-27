/**
 Created by  lanjian   on 2024/5/8  15:46
 Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
 */
import Config from '@/config/index'
import AppConfig from '@/config/AppConfig'
import { getToken } from '@/utils/cache/cookies'

export default function(appName) {
  const initHeader = function() {
    Config.headers = AppConfig[appName]
    Config.headers.AccessToken = getToken()
  }

  return {
    initHeader
  }
}

