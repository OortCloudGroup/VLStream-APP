<template>
  <div class="systemBasic">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="音/视频DSCP">
        <el-input v-model="form.audio_video_DSCP" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="报警DSCP">
        <el-input v-model="form.alarm_DSCP" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="管理DSCP">
        <el-input v-model="form.manage_DSCP" placeholder="请输入" />
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
import { getQos, saveQos } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  audio_video_DSCP: '',
  alarm_DSCP: '',
  manage_DSCP: ''
})

const fetchQos = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getQos(params)
  if (res.code === 200 && res.data) {
    form.value.audio_video_DSCP = res.data.audio_video_DSCP
    form.value.alarm_DSCP = res.data.alarm_DSCP
    form.value.manage_DSCP = res.data.manage_DSCP
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    audio_video_DSCP: form.value.audio_video_DSCP,
    alarm_DSCP: form.value.alarm_DSCP,
    manage_DSCP: form.value.manage_DSCP
  }
  const res: any = await saveQos(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchQos()
  }
}

onMounted(() => {
  fetchQos()
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
