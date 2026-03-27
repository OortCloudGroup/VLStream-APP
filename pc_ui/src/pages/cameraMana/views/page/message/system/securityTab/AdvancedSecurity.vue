<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="advSecPage">
    <el-form label-position="top" class="sbForm" :model="form">
      <div class="sectionTitle" style="margin-top: 0;">
        <span class="line" />
        <span>安全加固</span>
      </div>
      <el-form-item>
        <el-checkbox v-model="form.enableSecure">
          启用安全加固
        </el-checkbox>
      </el-form-item>

      <div class="sectionTitle">
        <span class="line" />
        <span>空间超时配置</span>
      </div>
      <el-form-item>
        <el-checkbox v-model="form.enableControlTimeout">
          启用控件超时
        </el-checkbox>
      </el-form-item>
      <el-form-item label="超时时间">
        <div class="timeoutRow">
          <el-input-number
            v-model="form.timeoutMinutes"
            :min="1"
            :max="60"
            controls-position="right"
            class="time-input"
          />
          <span class="timeoutUnit">分钟</span>
        </div>
      </el-form-item>

      <div class="sectionTitle">
        <span class="line" />
        <span>摘要算法</span>
      </div>
      <el-form-item label="Digest">
        <el-input v-model="form.digestAlgo" placeholder="请输入" />
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
import { getAdvancedSafe, saveAdvancedSafe } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  enableSecure: false,
  enableControlTimeout: false,
  timeoutMinutes: 5,
  digestAlgo: ''
})

const parseTimeoutMinutes = (value: any): number => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const match = value.match(/(\d+)/)
    if (match?.[1]) return Number(match[1]) || 5
  }
  return 5
}

const fetchAdvancedSafe = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getAdvancedSafe(params)
  if (res.code === 200 && res.data) {
    form.value.enableSecure = !!res.data.security_reinforcement
    form.value.enableControlTimeout = !!res.data.control_timed_out
    form.value.timeoutMinutes = parseTimeoutMinutes(res.data.timeout_time)
    form.value.digestAlgo = res.data.digest || ''
  }
}

const handleSave = async() => {
  const minutes = Number(form.value.timeoutMinutes) || 1
  const params = {
    accessToken: store.userInfo?.accessToken,
    security_reinforcement: !!form.value.enableSecure,
    control_timed_out: !!form.value.enableControlTimeout,
    timeout_time: `${minutes}分钟`,
    digest: form.value.digestAlgo
  }
  const res: any = await saveAdvancedSafe(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchAdvancedSafe()
  }
}

onMounted(() => {
  fetchAdvancedSafe()
})
</script>

<style lang="scss" scoped>
.advSecPage {
  width: 100%;
}

.sbForm {
  .el-input {
    height: 40px;
  }

  .el-input-number,
  .el-select {
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

.sectionTitle {
  margin: 40px 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: var(--el-color-primary);

  .line {
    width: 3px;
    height: 18px;
    background: var(--el-color-primary);
  }
}

.timeoutRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeoutUnit {
  font-size: 14px;
  color: #666;
}

.digest-select {
  width: 260px;
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
