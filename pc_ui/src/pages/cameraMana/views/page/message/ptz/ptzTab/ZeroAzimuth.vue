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
      <div class="button-groupBox">
        <button-group
          :button-list="[
            {svg: 'setting', name: '设置', clickFn: handleSet},
            {svg: 'del', name: '清除', clickFn: handleClear},
            {svg: 'call', name: '调用', clickFn: handleCall},
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
import { getZeroAngle, saveZeroAngle, zeroAngleOperation } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

const form = reactive({
  enable: true
})

// RoiTop 组件使用的 ROI 点位
const roiPoints = ref<any>(null)

const fetchZeroAngle = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getZeroAngle(params)
  if (res.code === 200 && res.data) {
    const data = res.data
    form.enable = !!(data.enable_limit ?? data.limit ?? data.enable ?? form.enable)
  }
}

const handleSet = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'setting'
  }
  const res: any = await zeroAngleOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const handleClear = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'clear'
  }
  const res: any = await zeroAngleOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const handleCall = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    action: 'call'
  }
  const res: any = await zeroAngleOperation(params)
  if (res.code === 200) {
    ElMessage.success('操作成功')
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    enable_limit: form.enable
  }
  const res: any = await saveZeroAngle(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchZeroAngle()
  }
}

onMounted(() => {
  fetchZeroAngle()
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

// 上方区域：作为 RoiTop 容器
.basic_top {
  margin-bottom: 20px;
}

// 下方表单配置
.basic_bottom {
  width: 560px;
  background-color: #fff;
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
