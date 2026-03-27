import { ref } from 'vue'
import store from '@/store/index'
import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/cache/cookies'
import { loginSSO, verifyToken, logout } from '@/api/login/indexWare'
import { type ILoginFormData, IVerifyTokenData } from '@/api/login/types/login'
import JSEncrypt from 'jsencrypt'

export const useUserStoreW = defineStore('user', () => {
  const token = ref<string>(getToken() || '')
  const userInfo = ref<any>()
  /** 登录 */
  const login = (loginData: ILoginFormData) => {
    return new Promise((resolve, reject) => {
      // 使用 公钥加密
      const publicKey =
        'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDEVHt+AcdsR2TxPukbST93XMsp\n' +
        'TNjYIpZ9VAY+Sv9HowcBNZbEopCsJeseTimDF8EHajFWjur+tzFqAEhRiZ5Tqmcy\n' +
        '5Gj/pHc5NAILqDpaOBQc/h6SwvMH7kzrrHaPGenhVfmwOZ+hgoHMPSH1g/mEJHFd\n' +
        '7+eDl787th4xZll70QIDAQAB'
      const encrypt = new JSEncrypt()
      encrypt.setPublicKey(publicKey)
      const json = {
        user: loginData.username,
        pass: loginData.password,
        timestamp: Math.floor(new Date().getTime() / 1000)
        // client: 'pc'
      }
      const tjson = encrypt.encrypt(JSON.stringify(json)) as string
      loginSSO({ userInfo: tjson })
        .then((res) => {
          setToken(res.data['accessToken'])
          token.value = res.data['accessToken']
          userInfo.value = res.data
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
          if (res.code === 200) {
            setToken(res.data.accessToken)
            token.value = res.data.accessToken
            userInfo.value = { ...userInfo.value, ...res.data }
          }
          resolve(res)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  const loginOut = (token: string) => {
    return new Promise((resolve, reject) => {
      const postJson: IVerifyTokenData = { accessToken: token }
      logout(postJson)
        .then((response) => {
          removeStoreToken()
          resolve(response)
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

  const localRouter = ref([])
  const setLocalRouter = (data) => {
    localRouter.value = data
  }
  const getLocalRouter = () => {
    return localRouter.value
  }

  // 存储urlObj过来的传参
  const urlObj = ref(null)
  const setURLObj = (data) => {
    urlObj.value = data
  }

  return { getStoreToken, removeStoreToken, login, token, userInfo, loginOut, versionToken, urlObj, setURLObj, setLocalRouter, getLocalRouter }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStoreW(store)
}
