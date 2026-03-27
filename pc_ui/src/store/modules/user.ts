import { ref } from 'vue'
import store from '@/store/index'
import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from '@/utils/cache/cookies'
import { loginSSO, verifyToken, logout } from '@/api/login'
import { type ILoginFormData, IVerifyTokenData, UserInfo } from '@/api/login/types/login'
import JSEncrypt from 'jsencrypt'
import Config from '@/config'

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<UserInfo>()
  // 选人员
  const userListStore = ref<any>({})
  const addUser = (info) => {
    // 检测是否以及存在
    userListStore.value[info.oort_uuid] = info
  }
  /** 登录 */
  const login = (loginData: ILoginFormData) => {
    return new Promise((resolve, reject) => {
      // 使用 公钥加密
      const publicKey =
        'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwQ9LMVuWA26f+pc4cyiZbZRY+XzJ6B6sC9ZHRU5x3C8g5Cu1MlpZ3v8baD8r+aZOE9t5NnmSLFqcVIlO3DY+bX03188m59zZqWmLhzdKPWJ2ibH4AjCHH0OlJFUIew3qzXOdZw4nk+nBmrRV7XeU7a/K4SYI7bKQg2hn4N9giKdSztvZcjO21ZS2/JiQQfSh7vZDWMsU9RH7MGAkaSkmcOmM4TVA5ponhinnpcf2cJBs94hJgFjC3JagnzqpD8ZPpPG37Ozjz3sG1iOVtC3SSh7Ejxxm75N0wjSpcVmzIitUqOrEiVyo8XoALsGUW24oLBW+LLUGZ/TxwRgHiFSLe5gTaTM+wZNZFK31lyJiZv1HYSRMzmN5SgSp5kh/8pRW42T8mPcSx6NrvZXN3BZKdjkOJ4/eEAY8PlgwKs3vF0DQt5TPrnJIuOo5RIhtbojofe6tFCukr2Fv3k6lPFTbqWRVyK0SVYRAk+V+VLEyj5bouX1gCDvh2evP4+/4/ZGHty04gGHlWWClcjo7iUP9EeWo1IftyuD4fPtFl8sPm/By+/vz3/meavzWEjxL28kOSpTJWIVC2UeVgjMS/0e0s5DllJI3jtAG6AhQTNYrQTtJbtc7SFY6SYptZ+LLZ8kn2pAA1bZUOUCuCnDICLiglEFpPrSPQlWJyzN3WvU4bU0CAwEAAQ=='
      const encrypt = new JSEncrypt()
      encrypt.setPublicKey(publicKey)
      const json = {
        username: loginData.username,
        password: loginData.password,
        timestamp: Math.floor(new Date().getTime() / 1000),
        client: 'pc'
      }
      const tjson = encrypt.encrypt(JSON.stringify(json)) as string
      loginSSO({ userInfo: tjson })
        .then((res) => {
          setToken(res.data.userInfo.accessToken)
          token.value = res.data.userInfo.accessToken
          userInfo.value = res.data.userInfo
          resolve(true)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const versionToken = () => {
    return new Promise((resolve, reject) => {
      if (!token.value) {
        token.value = getToken()
      }
      verifyToken({ accessToken: token.value })
        .then((res) => {
          setToken(res.data.userInfo.accessToken)
          token.value = res.data.userInfo.accessToken
          userInfo.value = { ...userInfo.value, ...res.data.userInfo }
          Config.headers.AccessToken = token.value
          resolve(res)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const setStoreToken = (data: string) => {
    setToken(data)
    token.value = data
  }

  const getStoreToken = () => {
    return token.value
  }
  const removeStoreToken = () => {
    removeToken()
    token.value = ''
    userInfo.value = undefined
    sessionStorage.clear()
  }

  // 存储urlObj过来的传参
  const urlObj = ref(null)
  const setURLObj = (data) => {
    urlObj.value = data
  }

  const loginOut = (token: string) => {
    return new Promise((resolve, reject) => {
      const postJson: IVerifyTokenData = { accessToken: token }
      logout(postJson)
        .then((response) => {
          removeToken()
          resolve(response)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const localRouter = ref([])
  const setLocalRouter = (data) => {
    localRouter.value = data
  }
  const getLocalRouter = () => {
    return localRouter.value
  }

  return { login, setStoreToken, token, userInfo, loginOut, versionToken, removeStoreToken, getStoreToken, addUser, userListStore,
    urlObj, setURLObj, setLocalRouter, getLocalRouter
  }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}
