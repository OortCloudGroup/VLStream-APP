<!-- eslint-disable vue/no-v-model-argument -->
<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2024-11-15 11:45:51
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="right_info">
    <el-icon v-if="errorStore.errorMsgList.length > 0" color="red" size="20" class="error_msg_tip" @click="showErrorMsg">
      <WarnTriangleFilled />
    </el-icon>
    <img v-if="isFullscreen" class="right_info_nine" style="margin: 0;" src="../assets/img/fullscreen_close.png" @click="toggle" />
    <img v-else class="right_info_nine" style="margin: 0;" src="../assets/img/fullscreen_open.png" @click="toggle" />
    <span class="right_info_tips">欢迎您</span>
    <div class="right_info_imgOut">
      <div class="flexRowAC">
        <oort-img
          v-if="!!store.userInfo && store.userInfo.oort_photo"
          alt=""
          class="right_info_img"
          style="border-radius: 100%"
          :src="store.userInfo.oort_photo"
        />
        <img v-else alt="" class="right_info_img" src="../assets/img/login/icon_user.png" />
      </div>
    </div>
    <div class="right_name_div">
      <span class="right_info_tips">{{ store?.userInfo?.oort_name || '未登录' }} {{ store?.userInfo?.isAdmin ?"(超级管理员)":'' }}  </span>
      <!--            <div v-if="supplier" class="right_info_tips" style="font-size: 12px">-->
      <!--              {{ (!!supplierInfo && supplierInfo.unit) ?supplierInfo.unit: '' }}-->
      <!--            </div>-->
    </div>

    <el-popover v-model:visible="popoverVis" placement="bottom" :width="clacPXToVW(380)" trigger="hover" popper-class="popover_panel">
      <template #reference>
        <img class="right_info_nine" src="../assets/img/nightpointpng.png" />
      </template>
      <commonRightPoPover v-if="popoverVis" :predefine-colors="predefineColors" @moreOpr="moreOpr" />
    </el-popover>

    <el-popover v-model:visible="popoverVisMore" placement="bottom" :width="clacPXToVW(260)" trigger="hover" popper-class="popover_panel_more">
      <template #reference>
        <img class="right_info_nine" src="../assets/img/nightpointpng_more.png" />
      </template>
      <commonRightPopoverMore v-if="popoverVisMore" :predefine-colors="predefineColors" @moreOpr="moreOpr" />
    </el-popover>

    <!-- <el-icon size="16px" color="var(--el-color-primary)">
      <CaretBottom />
    </el-icon> -->
    <!-- <div class="info_panel">
      <div class="info_panel_item">
        <div class="info_btn" @click="resetPassword">
          <span>重置密码</span>
        </div>
        <div class="info_btn" @click="themDialogVisible=true">
          <span>切换主题</span>
        </div>
        <div v-if="props.logout" class="info_btn" @click="logoutClick">
          <span>退出登录</span>
        </div>
      </div>
      <div class="dept_panel">
        <span>{{ userInfo.oort_depname || '' }}</span>
        <span>{{ (userInfo && userInfo.oort_jobname) ? '| ' + userInfo.oort_jobname : '' }}</span>
      </div>
    </div> -->
    <!-- <el-dialog
      v-model="themDialogVisible"
      title="切换主题色"
      width="30%"
      :append-to-body="true"
    >
      <div class="color_form">
        <div class="color_form_item">
          <span>选择主题颜色</span>
          <el-color-picker
            v-model="themeColor"
            :predefine="predefineColors"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleChangeTheme">确 定</el-button>
        </span>
      </template>
    </el-dialog> -->
    <el-dialog
      v-model="resetPSDialogVis"
      title="重置密码"
      width="45%"
      :append-to-body="true"
    >
      <el-form v-if="resetPSDialogVis" ref="resetForm" label-position="top" :model="form" :rules="rules">
        <el-form-item label="密码" prop="oldPassword">
          <el-input v-model="form.oldPassword" placeholder="请输入密码" type="password" />
        </el-form-item>
        <el-form-item label="新密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="password2">
          <el-input v-model="form.password2" type="password" placeholder="请输入确认密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resetPSDialogVis = false">取 消</el-button>
          <el-button type="primary" @click="handleResetPS(resetForm)">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <el-drawer
      v-model="errorListVis"
      size="45%"
      :with-header="false"
      append-to-body
      direction="rtl"
    >
      <more-error-msg-panel v-if="errorListVis" />
    </el-drawer>
  </div>
</template>

<script lang='ts' setup>
import { reactive, ref, watchEffect, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import config from '@/config'
import { setThemeColors } from '@/utils/setTheme'
import MoreErrorMsgPanel from '@/components/moreErrorMsgPanel.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { validatePass } from '@/utils/validateFunc'
import { useErrorMsgStore } from '@/store/modules/useErrorMsg'
import useGoWhere from '@/hooks/useGoWhere'
import { clacPXToVW } from '@/utils/index'

defineProps({
  'logout': {
    default: true
  },
  'supplier': {
    default: false
  },
  'isDeskTop': {
    default: false
  }
})
const store: any = useUserStore()
const errorStore = useErrorMsgStore()
const myCenter = ref(false)
const myCloudDisk = ref(false)
const myCollect = ref(false)
let userInfo = reactive({
  oort_name: '',
  oort_photo: '',
  oort_depname: '',
  oort_jobname: ''
})
watchEffect(() => {
  if (!store.userInfo) return false
  userInfo.oort_name = store.userInfo.user_name
  userInfo.oort_photo = store.userInfo.photo
  userInfo.oort_depname = store.userInfo.user_name_fpy
  userInfo.oort_jobname = store.userInfo.user_name_py
  if (config.common && config.common.rightInfoItems) {
    let arrC = config.common.rightInfoItems
    myCenter.value = arrC.findIndex((item:any) => { return item.labelKey === 'myCenter' && item.isShow === true }) !== -1
    myCloudDisk.value = arrC.findIndex((item:any) => { return item.labelKey === 'myCloudDisk' && item.isShow === true }) !== -1
    myCollect.value = arrC.findIndex((item:any) => { return item.labelKey === 'myCollect' && item.isShow === true }) !== -1
  }
})

const popoverVis = ref(false)
const popoverVisMore = ref(false)
const tenantVis = ref(false)
const moreOpr = (action) => {
  switch (action) {
    case 'changeTheme':
      handleChangeTheme()
      break
    case 'logout':
      logoutClick()
      break
    case 'resetPS':
      resetPassword()
      break
    case 'changeTenant':
      tenantVis.value = true
      break
    default:
      break
  }
}
const predefineColors = ref(['#F05A1F', '#2856A5', '#C3030F', '#000000', '#6E00FE', '#DBA101'])
const themeColor = ref('#F05A1F')
// 存储-切换主题
const handleChangeTheme = () => {
  setThemeColors(themeColor.value)
  window.localStorage.setItem('theme', themeColor.value)
}
// 退出登录
const logoutClick = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    store.loginOut(store.token).then(() => {
      useGoWhere().goWhere()
    })
  })
}

const resetForm = ref(null)
const form = reactive({
  oldPassword: '',
  password: '',
  password2: ''
})
const resetPassword = () => {
  form.oldPassword = ''
  form.password = ''
  form.password2 = ''
  resetPSDialogVis.value = true
}

const validatePass2 = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = reactive({
  oldPassword: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入重置密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ],
  password2: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass2, trigger: 'blur' }
  ]
})

const resetPSDialogVis = ref(false)
const handleResetPS = async(formEl) => {
  if (!formEl) return
  await formEl.validate(async(valid) => {
    if (valid) {
      let res = await store.resetPS(form)
      if (res.code === 200) {
        ElMessage.success('重置成功')
        resetPSDialogVis.value = false
      }
    } else {
      return false
    }
  })
}

const errorListVis = ref(false)
const showErrorMsg = () => {
  errorListVis.value = true
}

import { useFullscreen } from '@vueuse/core'
const { isFullscreen, toggle } = useFullscreen()

onMounted(() => {
  let theme = window.localStorage.getItem('theme')
  if (theme) {
    themeColor.value = theme
  }
  handleChangeTheme()
})

</script>

<style>

  .popover_panel {
    background-color: #EDF3F9!important;
    border-radius: 10px!important;
  }

  .popover_panel .el-popper__arrow:before {
    background-color: #EDF3F9!important;
  }

  .popover_panel_more {
    background-color: #fff!important;
    border-radius: 10px!important;
    padding: 0!important;
  }
  .popover_panel_more .el-popper__arrow:before {
    background-color: #fff!important;

  }
</style>

<style lang="scss" scoped>

.right_name_div {
  /*width: 220px;*/
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;
}

.info_panel::after {
  content: "";
  position: absolute;
  top: -24px;
  right: 16px;
  width: 0;
  border-width: 12px;
  border-style: solid;
  border-color: transparent transparent #fff transparent; /* transparent 设置边框颜色透明 */
}

.right_info {
  position: relative;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  min-width: 180px;
  color: #fff;

  &_tips {
    margin: 0 8px;
    font-size: 16px;
    color: #fff;
    min-width: 48px;
  }

  &_img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  &_imgOut {
    margin: 0 16px;
  }
}

.right_info_nine {
  width: 30px;
  height: 30px;
  margin: 0 12px;
  cursor: pointer;
  border-radius: 0;
  transition: border-radius 0.5s ease; /* 添加过渡效果 */
}

.right_info_nine:hover {
  border-radius: 4px;
  background-color: #00000015;
}

.caret_icon {
  cursor: pointer;
}

.right_info:hover {
  .info_panel {
    display: flex;
  }
}

.info_panel:hover {
  display: flex;
}

.info_panel {
  z-index: 99;
  position: absolute;
  top: 60px;
  right: -8px;
  padding: 10px;
  width: 180px;
  min-height: 110px;
  display: none;
  flex-direction: column;
  background: #FFFFFF;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
  border-radius: 2px;
}

.info_panel_item {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  border-bottom: 0.5px solid #d2d2d2;
}

.info_btn:hover {
  font-weight: bold;
}

.info_btn {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48%;
  height: 32px;

  span {
    padding: 4px;
    font-size: 14px;
    color: $main-color;
  }
}

.dept_panel {
  width: 100%;
  min-height: 32px;

  span {
    margin-left: 8px;
    font-size: 12px;
    color: #333333;
  }
}

.error_msg_tip {
  margin: 0 16px;
  cursor: pointer;
}

.bell{
  cursor: pointer;
  .el-icon{
    font-size: 18px;
  }
}

.right_info_nine {
    width: 30px;
    height: 30px;
    margin: 0 12px;
    cursor: pointer;
    border-radius: 0;
    border-radius: 2px;
    transition: border-radius 0.5s ease; /* 添加过渡效果 */
  }

  .right_info_nine:hover {
    border-radius: 4px;
    background-color: #00000015;
  }

.caret_icon {
  cursor: pointer;
}

.right_info:hover {
  .info_panel {
    display: flex;
  }
}

</style>
