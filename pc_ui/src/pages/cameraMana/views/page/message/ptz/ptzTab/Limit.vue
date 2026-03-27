<template>
  <div class="basicInfo">
    <div class="limit_enable_row">
      <el-checkbox v-model="form.enable">
        启用限位
      </el-checkbox>
    </div>
    <!-- 上方：视频预览、PTZ控制和预置点 -->
    <div class="basic_top">
      <RoiTop v-model:roi-points="roiPoints" />
    </div>

    <!-- 下方：表单配置 -->
    <div class="basic_bottom">
      <el-form class="sbForm" label-position="top" :model="form">
        <el-form-item label="限位模式">
          <el-select v-model="form.limitMode" class="limit_mode_select" placeholder="请选择">
            <el-option v-for="item in limitModeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="限位状态">
          <el-input v-model="form.limitStatus" placeholder="未限位" disabled />
        </el-form-item>
      </el-form>

      <div class="button-groupBox">
        <button-group
          :button-list="[
            {svg: 'setting', name: '设置', clickFn: handleSet},
            {svg: 'del', name: '清除', clickFn: handleClear},
          ]"
        />
      </div>
    </div>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import ButtonGroup from '@/components/buttonGroup.vue'
import RoiTop from '@/pages/cameraMana/views/page/message/components/RoiTop.vue'
import { ElMessage } from 'element-plus'
import { getLimit, saveLimit, limitOperation } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

const limitModeOptions = [
  { label: '键控限位', value: 'key' },
  { label: '软限位', value: 'soft' },
  { label: '硬限位', value: 'hard' }
]

const limitModeFromApi: Record<string, string> = {
  '键位模式': 'key',
  '键控限位': 'key',
  '软限位': 'soft',
  '硬限位': 'hard'
}

const limitModeToApi: Record<string, string> = {
  key: '键位模式',
  soft: '软限位',
  hard: '硬限位'
}

const form = reactive({
  enable: true,
  limitMode: 'key',
  limitStatus: ''
})

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

const handleSet = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'setting'
  }
  const res: any = await limitOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const handleClear = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'clear'
  }
  const res: any = await limitOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const fetchLimit = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getLimit(params)
  if (res.code === 200 && res.data) {
    form.enable = !!res.data.limit
    form.limitMode = limitModeFromApi[res.data.limit_mode] || form.limitMode
    form.limitStatus = res.data.limit_state || ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    limit: form.enable,
    limit_mode: limitModeToApi[form.limitMode] || '键位模式',
    limit_state: form.limitStatus
  }
  const res: any = await saveLimit(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchLimit()
  }
}

onMounted(() => {
  fetchLimit()
})
</script>

<style lang="scss" scoped>
.basicInfo {
  width: 100%;
  padding: 0 20px 20px 20px;
}

.limit_enable_row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  :deep(.el-checkbox) {
    height: 24px;
  }

  :deep(.el-checkbox__label) {
    font-size: 14px;
    color: #000;
    font-weight: normal;
  }
}

// 上方区域，仅作为 RoiTop 容器
.basic_top {
  margin-bottom: 20px;
}

// 下方表单配置
.basic_bottom {
  width: 560px;
  background-color: #fff;

  .sbForm {
    .el-input {
      height: 40px;
    }
  }

  :deep(.el-form-item__label) {
    font-size: 16px;
    color: #333;
    padding-bottom: 10px;
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background: #fff;
    box-shadow: 0 0 0 1px #EDEDED inset;
  }

  :deep(.el-input.is-disabled .el-input__inner) {
    -webkit-text-fill-color: #B3B3B3;
    color: #B3B3B3;
  }
}

.limit_mode_select {
  width: 100%;

  :deep(.el-select__wrapper) {
    height: 40px !important;
    border-radius: 6px;
  }

  :deep(.el-select__selected-item) {
    font-size: 16px;
    color: #333;
  }
}

.button-groupBox {
  display: flex;
  align-items: center;
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
