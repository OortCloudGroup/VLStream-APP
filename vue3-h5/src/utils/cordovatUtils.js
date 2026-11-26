import Config from '@/config'
export const getAccessToken = () => {
  return window.androidFunUtils.getToken()
}
export const getGateWay = () => {
  return window.androidFunUtils.getGateway()
}

export const getAppInfo = async() => {
  return new Promise((resolve) => {
    if (Config.appId) {
      if (window.global.is_cordova) {
      // 使用安卓接口获取应用信息
        window.androidFunUtils.getAppInfo().then(res => {
          try {
            res = JSON.parse(res)
            // 保存包名
            Config.appInfo = res
            Config.apppackage = res.apppackage
            Config.appId = res.app_id
            Config.secretKey = res.app_secret
            resolve(true)
          } catch (e) {
            resolve(false)
          }
        }, () => {
          resolve(false)
        // alert('获取应用信息失败_回调')
        })
      } else {
        resolve(false)
      }
    } else {
      resolve(false)
    }
  })
}

import { useUserStoreHook } from '@/store/modules/useraPaas'
import { idbysecretdetail } from '@/api/admin_platform'
/**
 * 从平台取应用信息（包名等）。失败（如新用户租户未开通本应用，平台返回 not found）
 * 时返回 null 而不是抛错，调用方据此降级，不能因此挡住登录。
 */
export const getAppInfoFromHttp = async(params = {}) => {
  const appid = params.appid || Config.appId
  const appsecret = params.appsecret || Config.secretKey
  const store = useUserStoreHook()
  try {
    const res = await idbysecretdetail({
      accessToken: store.token,
      app_id: appid,
      app_secret: appsecret,
      uuid: store.userInfo.userId
    })
    if (res && res.code === 200 && res.data) {
      Config.appInfo = res.data
      Config.apppackage = res.data.apppackage
      return res
    }
  } catch (e) {
    // 网络或网关错误同样降级
  }
  return null
}
