<template>
  <div>
    <el-form label-position="top" class="sbForm" :model="form">
      <el-form-item label="设备信息">
        <el-input v-model="form.name" placeholder="请输入" />
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
import { getAboutDevice, saveAboutDevice } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  name: ''
})

const fetchBasicInfo = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getAboutDevice(params)
  if (res.code === 200 && res.data) {
    form.value.name = res.data.device_info || ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    device_info: form.value.name
  }
  const res: any = await saveAboutDevice(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchBasicInfo()
  }
}

onMounted(() => {
  fetchBasicInfo()
})
</script>

<style lang="scss" scoped>
.sbForm {
  .el-input {
    height: 40px !important;
  }

  .el-select {
    width: 100%;
  }
}

.submitBox {
  padding: 40px 20px;
  .submit {
    height: 48px;
    width: 170px;
    text-align: center;
    line-height: 48px;
    background: var(--el-color-primary);
    border-radius: 2px;
    font-size: 16px;
    color: #FFFFFF;
    cursor: pointer;
  }
}
</style>
