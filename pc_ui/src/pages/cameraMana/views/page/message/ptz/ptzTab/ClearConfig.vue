<template>
  <div class="clearConfig">
    <div class="cc_list">
      <el-checkbox v-model="form.select_all" class="cc_item" @change="handleSelectAllChange">
        全选
      </el-checkbox>
      <el-checkbox v-model="form.all_preset_points" class="cc_item" @change="handleItemChange">
        清除所有的预置点
      </el-checkbox>
      <el-checkbox v-model="form.all_cruising_paths" class="cc_item" @change="handleItemChange">
        清除所有的巡航路径
      </el-checkbox>
      <el-checkbox v-model="form.all_privacy_blocks" class="cc_item" @change="handleItemChange">
        清除所有的隐私块
      </el-checkbox>
      <el-checkbox v-model="form.all_limit_settings" class="cc_item" @change="handleItemChange">
        清除所有的限位设置
      </el-checkbox>
      <el-checkbox v-model="form.all_scheduled_tasks" class="cc_item" @change="handleItemChange">
        清除所有的定时任务
      </el-checkbox>
      <el-checkbox v-model="form.all_the_watches" class="cc_item" @change="handleItemChange">
        清除所有的守望
      </el-checkbox>
    </div>

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
import { getConfigureCleanup, saveConfigureCleanup } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

const form = reactive({
  select_all: false,
  all_preset_points: false,
  all_cruising_paths: false,
  all_privacy_blocks: false,
  all_limit_settings: false,
  all_scheduled_tasks: false,
  all_the_watches: false
})

const handleSelectAllChange = (val: boolean) => {
  form.all_preset_points = val
  form.all_cruising_paths = val
  form.all_privacy_blocks = val
  form.all_limit_settings = val
  form.all_scheduled_tasks = val
  form.all_the_watches = val
}

const handleItemChange = () => {
  form.select_all = !!(
    form.all_preset_points &&
    form.all_cruising_paths &&
    form.all_privacy_blocks &&
    form.all_limit_settings &&
    form.all_scheduled_tasks &&
    form.all_the_watches
  )
}

const fetchConfigureCleanup = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getConfigureCleanup(params)
  if (res.code === 200 && res.data) {
    const data = res.data
    form.select_all = !!data.select_all
    form.all_preset_points = !!data.all_preset_points
    form.all_cruising_paths = !!data.all_cruising_paths
    form.all_privacy_blocks = !!data.all_privacy_blocks
    form.all_limit_settings = !!data.all_limit_settings
    form.all_scheduled_tasks = !!data.all_scheduled_tasks
    form.all_the_watches = !!data.all_the_watches
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    select_all: form.select_all,
    all_preset_points: form.all_preset_points,
    all_cruising_paths: form.all_cruising_paths,
    all_privacy_blocks: form.all_privacy_blocks,
    all_limit_settings: form.all_limit_settings,
    all_scheduled_tasks: form.all_scheduled_tasks,
    all_the_watches: form.all_the_watches
  }
  const res: any = await saveConfigureCleanup(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchConfigureCleanup()
  }
}

onMounted(() => {
  fetchConfigureCleanup()
})
</script>

<style lang="scss" scoped>
.clearConfig {
  padding-left: 20px;
  width: 480px;
}

.cc_list {
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.cc_item {

  :deep(.el-checkbox__label) {
    font-size: 16px;
    color: #111827;
    font-weight: 400;
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
