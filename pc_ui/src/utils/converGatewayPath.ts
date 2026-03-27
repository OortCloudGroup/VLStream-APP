/**
 Created by  lanjian   on 2024/3/30 21:06
 Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
 */
import Config from '@/config'

export function converGatewayPath(url) {
  let newFirstLayerPath = '/' + Config.gateWay
  let newUrl = url.replace(/^https?:\/\/[^\/]+\/[^\/]+/, (match) => {
    return match.replace(/\/[^\/]+$/, newFirstLayerPath)
  })
  return newUrl
}
