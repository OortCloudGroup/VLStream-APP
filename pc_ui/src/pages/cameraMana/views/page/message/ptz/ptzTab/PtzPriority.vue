<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="云台优先">
        <el-select v-model="form.ptzPriority" placeholder="请选择" class="ptzPrioritySelect">
          <el-option v-for="item in priorityOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="延时">
        <el-input v-model="form.delay" placeholder="请输入" class="delayInput">
          <template #append>
            秒
          </template>
        </el-input>
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
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPtzPriority, savePtzPriority } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

const form = reactive({
  ptzPriority: '',
  delay: ''
})

const priorityOptions = [
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' }
]

const fetchPtzPriority = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getPtzPriority(params)
  if (res.code === 200 && res.data) {
    const data = res.data
    form.ptzPriority = data.ptz_priority || ''
    form.delay = data.delay ? String(data.delay).replace('秒', '') : ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    ptz_priority: form.ptzPriority,
    delay: form.delay
  }
  const res: any = await savePtzPriority(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchPtzPriority()
  }
}

onMounted(() => {
  fetchPtzPriority()
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

    .ptzPrioritySelect {
      width: 100%;

      :deep(.el-select__wrapper) {
        height: 40px !important;
      }
    }

    .delayInput {
      :deep(.el-input__wrapper) {
        height: 40px !important;
      }

      :deep(.el-input-group__append) {
        width: 52px;
        justify-content: center;
        color: #6B7280;
      }
    }
  }
}

.submitBox {
  padding: 40px 20px;
  display: flex;
  justify-content: flex-start;
  align-items: center;

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
