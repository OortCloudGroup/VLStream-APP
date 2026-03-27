<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.SDK_service">
          启用SDK服务
        </el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.enhanced_SDK_service">
          启用增强型SDK服务
        </el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.TLS1_1">
          启用TLS1.1版本
        </el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.TLS1_2">
          启用TLS1.2版本
        </el-checkbox>
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
import { ref, onMounted } from 'vue'
import { getNetworkService, saveNetworkService } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  SDK_service: false,
  enhanced_SDK_service: false,
  TLS1_1: false,
  TLS1_2: false
})

const fetchNetworkService = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getNetworkService(params)
  if (res.code === 200 && res.data) {
    form.value.SDK_service = !!res.data.SDK_service
    form.value.enhanced_SDK_service = !!res.data.enhanced_SDK_service
    form.value.TLS1_1 = !!res.data.TLS1_1
    form.value.TLS1_2 = !!res.data.TLS1_2
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    SDK_service: !!form.value.SDK_service,
    enhanced_SDK_service: !!form.value.enhanced_SDK_service,
    TLS1_1: !!form.value.TLS1_1,
    TLS1_2: !!form.value.TLS1_2
  }
  const res: any = await saveNetworkService(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchNetworkService()
  }
}

onMounted(() => {
  fetchNetworkService()
})
</script>

<style lang="scss" scoped>
.systemBasic {
  padding-left: 20px;
  width: 480px;

  .sbForm {
    .el-input {
      height: 40px;
    }
  }
}

.submitBox {
  padding: 40px 0;

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
