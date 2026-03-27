<template>
  <div class="login-container">
    <div class="login_form">
      <div class="login_tips">
        <span>欢迎登录  <span style="font-size: 16px;color:#666666">{{ props.config.login_title }}</span></span>
      </div>
      <div class="login_body">
        <el-form
          ref="ruleFormRef"
          :model="loginForm"
          :rules="rules"
        >
          <el-form-item class="login_input_item" prop="username">
            <el-input v-model="loginForm.username" size="large" placeholder="请输入用户名">
              <template #prefix>
                <el-icon class="el-input__icon">
                  <User />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="login_input_item" prop="password">
            <el-input
              v-model="loginForm.password"
              size="large"
              placeholder="请输入密码"
              :type="passwordType"
              @keyup.enter="submitForm(ruleFormRef)"
            >
              <template #prefix>
                <el-icon class="el-input__icon">
                  <Key />
                </el-icon>
              </template>
              <template #suffix>
                <el-icon v-if="passwordType" @click="showPwd">
                  <Hide />
                </el-icon>
                <el-icon v-else @click="showPwd">
                  <View />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item class="login_input_item">
            <el-button
              v-loading="loading"
              size="large"
              class="login_btn"
              type="primary"
              @click="submitForm(ruleFormRef)"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        <div class="botton_box">
          <div class="botton_box_login_bottom">
            {{ props.config.login_bottom }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { useRouter } from 'vue-router'
import { reactive, ref } from 'vue'
import { useUserStore } from '@/store/modules/user'
import Config from '@/config/index'
import { ElMessage } from 'element-plus'
import { User, Key, View, Hide } from '@element-plus/icons-vue'
import { login as cameraLogin } from '@/api/cameraMana'
// import { qrcoceGetKey, verifyToken } from '@/api/sso.js'
// import { qrcoceGetKey, qrcodeCheck, verifyToken } from '@/api/sso.js'
const store = useUserStore()
const setToken = store.setStoreToken
const router = useRouter()
const props: any = defineProps({
  showRegs: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object,
    default: () => {}
  },
  client: {
    type: String,
    default: 'pcweb'
  }
})
const loading = ref(false)
const loginForm = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
})

const ruleFormRef = ref('')
const submitForm = async(formEl: any) => {
  if (!formEl) return
  await formEl.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      cameraLogin({
        user_name: loginForm.username,
        password: loginForm.password
      }).then((res: any) => {
        if (res && res.code === 200) {
          const accessToken = res?.data?.accessToken || res?.data?.userInfo?.accessToken
          if (accessToken) {
            setToken(accessToken)
            Config.headers.AccessToken = accessToken
          }
          store.userInfo = { userName: loginForm.username }
          sessionStorage.setItem('cameraManaLoginInfo', JSON.stringify(res))
          ElMessage.success('登录成功')
          router.push({ path: '/index' })
        } else {
          ElMessage.error(res?.message || res?.msg || '登录失败')
        }
      }).catch(() => {
        loginForm.password = ''
      }).finally(() => {
        loading.value = false
      })
    } else {
      return false
    }
  })
}
// 显示隐藏 密码
let passwordType = ref<any>('password')
const showPwd = () => {
  if (passwordType.value === 'password') {
    passwordType.value = 'text'
  } else {
    passwordType.value = 'password'
  }
}

</script>

<style lang="scss" scoped>
.el-icon {
  cursor: pointer;
}

:deep(.login_body) {
  .el-input {
    .el-input__wrapper {
      padding: 2px;
    }

    .el-input__inner {
      padding: 0 40px;
    }

    .el-input__prefix {
      position: absolute;
      left: 18px;
    }

    .el-input__suffix {
      position: absolute;
      right: 18px;
    }
  }
}

.botton_box {
  width: 100%;
  @extend .flexRow;
  @extend .flexCenter;

  &_agree {
    @extend .flexRow;
    justify-content: center
  }

  &_login_bottom {
    font-size: 12px;
    color: $font-color-b9;
    text-align: center;
    margin-top: 8px
  }
}

.loginGightpic {
  position: absolute;
  right: 0px;
  top: 0px;
  width: 127px;
  cursor: pointer;
}

.login-container {
  margin-top: -40px;
  width: 444px;
  min-height: 444px;
  padding: 32px 64px 16px;
  position: relative;
  background-color: hsla(0, 0%, 100%, .9)
}

.login_form {
  display: flex;
  flex-direction: column;
  position: relative;
}

/*二维码相关*/
.qr_code_div {
  width: 360px;
  height: 360px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  &_img {
    flex: 1;
    margin-top: 34px;
  }

  &_span {
    height: 32px;
    font-size: 14px;
    color: #333333;
  }
}

.qr_code_mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0px;
  left: 0px;
  background-color: #444141cc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  img {
    width: 55px;
    height: 55px;
    margin: 12px;
  }

  span {
    font-size: 16px;
    color: #fff;
  }
}

.login_tips {
  margin: 20px;
  span {
    font-weight: bold;
    font-size: 36px;
    color: #333333;
  }
}

.login_btn {
  width: 100%;
}

.login_input_item {
  margin: 40px 0;
}

:deep(.login_input_yzm .el-form-item__content) {
  display: flex;
  flex-direction: row;
}

</style>
