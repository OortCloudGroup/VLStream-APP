<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="secServicePage">
    <el-form label-position="top" class="sbForm" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.enable">
          开启非法登录锁定
        </el-checkbox>
      </el-form-item>
      <el-form-item label="错误尝试次数">
        <el-input-number
          v-model="form.loginErrorTimes"
          :min="1"
          :max="20"
          controls-position="right"
          class="times-input"
        />
      </el-form-item>
    </el-form>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getSafeServices, saveSafeServices } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  enable: false,
  loginErrorTimes: 1
})

const fetchSafeServices = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getSafeServices(params)
  if (res.code === 200 && res.data) {
    form.value.enable = !!res.data.illegal_login
    form.value.loginErrorTimes = Number(res.data.number_of_wrong_attempt) || 1
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    illegal_login: !!form.value.enable,
    number_of_wrong_attempt: Number(form.value.loginErrorTimes) || 1
  }
  const res: any = await saveSafeServices(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchSafeServices()
  }
}

onMounted(() => {
  fetchSafeServices()
})
</script>

<style lang="scss" scoped>
.secServicePage {
  width: 100%;
}

.sbForm {
  .el-input,
  .el-input-number {
    height: 40px;
  }

  :deep(.el-input-number) {
    width: 240px;

    .el-input__wrapper {
      height: 40px;
      box-shadow: none;
      border-color: #e5e7eb;
    }

    .el-input-number__decrease,
    .el-input-number__increase {
      background: transparent;
      border: none;
    }
  }
}

.submitBox {
  padding: 40px 0 0;

  .submit {
    height: 48px;
    width: 170px;
    text-align: center;
    line-height: 48px;
    background: var(--el-color-primary);
    border-radius: 2px;
    font-size: 16px;
    color: #FFFFFF;
    letter-spacing: 0;
    font-weight: 400;
    cursor: pointer;
  }
}
</style>

