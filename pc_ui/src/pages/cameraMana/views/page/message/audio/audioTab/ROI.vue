<template>
  <div class="roi_page">
    <!-- 上方：视频预览、PTZ控制和预置点 -->
    <RoiTop
      v-model:roi-points="roiPoints"
      @roi-complete="handleRoiComplete"
      @roi-clear="handleRoiClear"
    />

    <!-- 下方：配置表单 -->
    <div class="roi_bottom">
      <div class="roi_config">
        <el-form class="sbForm" label-position="top" :model="form">
          <!-- 码流类型 -->
          <div class="sectionTitle" style="margin-top: 0;">
            <span class="line" />
            <span>码流类型</span>
          </div>
          <el-form-item label="码流类型">
            <el-select v-model="form.streamType" placeholder="请选择" class="full-select">
              <el-option label="主码流 (定时)" value="main_timed" />
              <el-option label="主码流" value="main" />
              <el-option label="子码流" value="sub" />
              <el-option label="第三码流" value="third" />
            </el-select>
          </el-form-item>

          <!-- 固定区域 -->
          <div class="sectionTitle">
            <span class="line" />
            <span>固定区域</span>
          </div>
          <el-form-item>
            <el-checkbox v-model="form.enable">
              启用
            </el-checkbox>
          </el-form-item>
          <el-form-item label="区域编号">
            <el-select v-model="form.regionNumber" placeholder="请选择" class="full-select">
              <el-option label="1" value="1" />
              <el-option label="2" value="2" />
              <el-option label="3" value="3" />
              <el-option label="4" value="4" />
              <el-option label="5" value="5" />
            </el-select>
          </el-form-item>
          <el-form-item label="提升等级">
            <el-select v-model="form.enhancementLevel" placeholder="请选择" class="full-select">
              <el-option label="1" value="1" />
              <el-option label="2" value="2" />
              <el-option label="3" value="3" />
              <el-option label="4" value="4" />
              <el-option label="5" value="5" />
            </el-select>
          </el-form-item>
          <el-form-item label="区域名称">
            <el-input v-model="form.regionName" placeholder="请输入" />
          </el-form-item>
        </el-form>

        <div class="submitBox flexRowAC">
          <div class="submit" @click="saveRoiBtn">
            保 存
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount, ref } from 'vue'
import { getRoi, saveRoi } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import RoiTop from '@/pages/cameraMana/views/page/message/components/RoiTop.vue'

const store: any = useUserStore()

const form = reactive({
  streamType: '',
  enable: false,
  regionNumber: '',
  enhancementLevel: '',
  regionName: ''
})

const roiPoints = ref<any>(null)

// 将接口返回的数据映射到表单
const mapFromApi = (data: any) => {
  const mapCodeStreamType = (val: string) => {
    if (!val) return ''
    // 新接口直接返回英文值时，直接使用
    if (['main_timed', 'main', 'sub', 'third'].includes(val)) return val
    // 兼容旧接口返回中文的情况
    if (val.includes('定时')) return 'main_timed'
    if (val === '主码流' || val === '主码流(非定时)') return 'main'
    if (val === '子码流') return 'sub'
    if (val === '第三码流') return 'third'
    return ''
  }

  return {
    streamType: mapCodeStreamType(data.code_stream_type || ''),
    enable: !!data.fixed_region,
    regionNumber: data.area_number || '',
    enhancementLevel: data.level_up !== undefined ? String(data.level_up) : '',
    regionName: data.zone_name || ''
  }
}

// 将表单数据映射为接口需要的格式
const mapToApi = () => {
  return {
    code_stream_type: form.streamType,
    fixed_region: form.enable,
    area_number: form.regionNumber,
    level_up: Number(form.enhancementLevel) || 0,
    zone_name: form.regionName,
    normalized: true,
    shape_type: 'rect',
    points: roiPoints.value || []
  }
}

const fetchRoi = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getRoi(params)
  if (res.code === 200 && res.data) {
    const mapped = mapFromApi(res.data)
    Object.assign(form, mapped)
    if (Array.isArray(res.data.points) && res.data.points.length === 2) {
      const p1 = res.data.points[0]
      const p2 = res.data.points[1]
      if (Array.isArray(p1) && Array.isArray(p2) && p1.length === 2 && p2.length === 2) {
        // 后端已返回归一化坐标，直接回显
        roiPoints.value = [
          [Number(p1[0]), Number(p1[1])],
          [Number(p2[0]), Number(p2[1])]
        ]
      }
    }
  }
}

const saveRoiBtn = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    ...mapToApi()
  }
  const res: any = await saveRoi(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchRoi()
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    ...mapToApi()
  }
  const res: any = await saveRoi(params)
  if (res.code === 200) {
    await fetchRoi()
  }
}

// 清除 ROI 后，同步保存空区域配置
const handleRoiClear = async() => {
  await handleSave()
}

// 画框完成后，自动保存 ROI 配置
const handleRoiComplete = async() => {
  await handleSave()
}

onMounted(() => {
  fetchRoi()
})

onBeforeUnmount(() => {
})
</script>

<style lang="scss" scoped>
.roi_page {
  width: 100%;
  padding: 20px;
}

.roi_config {
  max-width: 480px;
}

.sbForm {
  .el-input {
    height: 40px;
  }
}

.sectionTitle {
  margin: 24px 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: var(--el-color-primary);

  .line {
    width: 3px;
    height: 18px;
    background: var(--el-color-primary);
  }

  &:first-child {
    margin-top: 0;
  }
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
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
