<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.enable">
          启用
        </el-checkbox>
      </el-form-item>
    </el-form>

    <!-- 标签页，与 MotionDetection 保持一致 -->
    <el-tabs v-model="activeTab" class="motion-tabs">
      <el-tab-pane label="区域设置" name="area" />
      <el-tab-pane label="布防时间" name="time" />
      <el-tab-pane label="联动方式" name="linkage" />
    </el-tabs>

    <AreaSettings v-if="activeTab === 'area'" v-model:detection-areas="form.detection_areas" />
    <DefenseTime v-if="activeTab === 'time'" v-model:protection-time="form.protection_time" />
    <LinkageMethod v-if="activeTab === 'linkage'" v-model:linkage-mode="form.linkage_mode" />

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import AreaSettings from './components/AreaSettings2.vue'
import DefenseTime from './components/DefenseTime.vue'
import LinkageMethod from './components/LinkageMethod2.vue'
import { getOcclusionAlarm, saveOcclusionAlarm } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  enable: false,
  detection_areas: {
    configuration_mode: '普通模式',
    sensitivity: 50,
    point: []
  },
  protection_time: {
    frequency: '每天',
    time_periods: []
  },
  linkage_mode: {
    regular_linkage: false,
    linkage_alarm_output: false,
    linkage_video: false,
    email_linkage: false,
    upload_center: false,
    upload_ftp_sd_card_nas: false,
    A_1: false,
    A1: false
  }
})

const activeTab = ref('area')

// 初始化获取数据
const fetchOcclusionAlarm = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  try {
    const res: any = await getOcclusionAlarm(params)
    if (res.code === 200 && res.data) {
      // 映射 occlusion_alarm 到 enable
      if (res.data.occlusion_alarm !== undefined) {
        form.enable = res.data.occlusion_alarm
      }
      // 设置其他字段
      if (res.data.detection_areas) {
        form.detection_areas = res.data.detection_areas
      }
      if (res.data.protection_time) {
        form.protection_time = res.data.protection_time
      }
      if (res.data.linkage_mode) {
        form.linkage_mode = res.data.linkage_mode
      }
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
  }
}

// 保存数据
const handleSave = async() => {
  const params: any = {
    occlusion_alarm: form.enable,
    detection_areas: {
      sensitivity: form.detection_areas.sensitivity
    },
    protection_time: form.protection_time,
    linkage_mode: form.linkage_mode,
    accessToken: store.userInfo?.accessToken
  }
  try {
    const res: any = await saveOcclusionAlarm(params)
    if (res.code === 200) {
      ElMessage.success('保存成功')
      await fetchOcclusionAlarm()
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 页面挂载后加载数据
onMounted(() => {
  fetchOcclusionAlarm()
})
</script>

<style lang="scss" scoped>
.systemBasic {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    .el-input {
      height: 40px;
    }
  }
}

// 标签页样式
:deep(.motion-tabs) {
  .el-tabs__item {
    color: #999999;
    font-size: 16px;
  }

  .el-tabs__item.is-active {
    color: var(--el-color-primary);
  }

  .el-tabs__header {
    padding-top: 0;
    margin-bottom: 20px;

    .el-tabs__nav-wrap::after {
      display: none;
    }
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
    letter-spacing: 0;
    cursor: pointer;
  }
}
</style>

