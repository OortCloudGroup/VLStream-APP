<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.enable">
          启用支持智能后检索
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
import { reactive, onMounted } from 'vue'
import { getCodeStreamInformationSuperposition, saveCodeStreamInformationSuperposition } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  enable: false
})

const fetchCodeStreamInformationSuperposition = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getCodeStreamInformationSuperposition(params)
  if (res.code === 200 && res.data) {
    form.enable = !!res.data.support_only_later_retrieval
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    support_only_later_retrieval: form.enable
  }
  const res: any = await saveCodeStreamInformationSuperposition(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchCodeStreamInformationSuperposition()
  }
}

onMounted(() => {
  fetchCodeStreamInformationSuperposition()
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
