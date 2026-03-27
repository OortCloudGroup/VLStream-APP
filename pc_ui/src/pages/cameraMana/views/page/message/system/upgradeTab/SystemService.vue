<template>
  <div class="page">
    <el-form label-position="top" class="sbForm" :model="form">
      <el-form-item label="硬件服务">
        <el-checkbox v-model="form.light">
          启用补光灯
        </el-checkbox>
      </el-form-item>
      <el-form-item label="软件服务-预览连接数">
        <div class="softBox flexRowAC">
          <el-input v-model="form.numberOfPreviewLinks" placeholder="请输入" />
          <el-checkbox v-model="form.threeStream">
            启用三码流
          </el-checkbox>
        </div>
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
import { getSystemService, saveSystemService } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  light: false,
  threeStream: false,
  numberOfPreviewLinks: ''
})

const fetchSystemService = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await getSystemService(params)
  if (res.code === 200 && res.data) {
    form.value = {
      light: res.data.light || false,
      threeStream: res.data.three_stream || false,
      numberOfPreviewLinks: String(res.data.number_of_preview_links || '')
    }
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    light: form.value.light,
    three_stream: form.value.threeStream,
    number_of_preview_links: Number(form.value.numberOfPreviewLinks) || 0
  }
  const res = await saveSystemService(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchSystemService()
  }
}

onMounted(() => {
  fetchSystemService()
})
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
}

.sbForm {
  width: 600px;
  .el-input {
    height: 40px;
  }
}

.softBox {
  width: 100%;
  gap: 12px;
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

