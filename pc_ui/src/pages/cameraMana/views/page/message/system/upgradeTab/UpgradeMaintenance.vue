<template>
  <div class="page">
    <el-form ref="sbForm" class="sbForm" label-position="left">
      <el-form-item label="重启">
        <div class="row-actions">
          <button class="pill-btn pill-orange" type="button" @click="handleReboot">
            <img class="btn-icon" src="@/assets/img/camera/cqsb.png" alt="" />
            <span>重启设备</span>
          </button>
        </div>
      </el-form-item>

      <el-form-item label="恢复默认值">
        <div class="row-actions row-actions-group">
          <button class="pill-btn pill-orange" type="button" style="border-right: none;" @click="handleSimpleRestore">
            <img class="btn-icon" src="@/assets/img/camera/jdhf.png" alt="" />
            <span>简单恢复</span>
          </button>
          <button class="pill-btn pill-orange" type="button" style="border-left: none;" @click="handleFullyRecovery">
            <img class="btn-icon" src="@/assets/img/camera/jdhf.png" alt="" />
            <span>完全恢复</span>
          </button>
        </div>
      </el-form-item>

      <el-form-item label="参数采集">
        <div class="row-actions row-actions-group">
          <button class="pill-btn pill-blue" type="button" style="border-right: none;" @click="handleImportParams">
            <img class="btn-icon" src="@/assets/img/camera/drcs.png" alt="" />
            <span>导入参数</span>
          </button>
          <button class="pill-btn pill-blue" type="button" style="border-left: none;" @click="handleExportParams">
            <img class="btn-icon" src="@/assets/img/camera/dccs.png" alt="" />
            <span>导出参数</span>
          </button>
        </div>
      </el-form-item>

      <el-form-item label="固件升级">
        <div class="fw-row">
          <div class="upload-box" role="button" tabindex="0">
            <img class="upload-plus-img" src="@/assets/img/camera/scsp.png" alt="" />
            <div class="upload-text">
              上传文件
            </div>
          </div>
          <button class="pill-btn pill-blue pill-upgrade" type="button" @click="handleFirmwareUpgrade">
            <img class="btn-icon" src="@/assets/img/camera/sj.png" alt="" />
            <span>升级</span>
          </button>
          <div class="fw-tip">
            <span class="tip-icon">?</span>
            <span>升级过程需要1-10分钟，请不要关闭电源，完成升级后将自动重启</span>
          </div>
        </div>
      </el-form-item>
    </el-form>

    <div class="submitBox flexRowAC">
      <div class="submit">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { rebootDevice, fullyRecovery, exportParams, importParams, firmwareUpgrade } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const handleReboot = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await rebootDevice(params)
  if (res.code === 200) {
    ElMessage.success('重启设备成功')
  }
}

const handleSimpleRestore = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await rebootDevice(params)
  if (res.code === 200) {
    ElMessage.success('简单恢复成功')
  }
}

const handleFullyRecovery = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await fullyRecovery(params)
  if (res.code === 200) {
    ElMessage.success('完全恢复成功')
  }
}

const handleImportParams = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await importParams(params)
  if (res.code === 200) {
    ElMessage.success('导入参数成功')
  }
}

const handleExportParams = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await exportParams(params)
  if (res) {
    ElMessage.success('导出参数成功')
  }
}

const handleFirmwareUpgrade = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res = await firmwareUpgrade(params)
  if (res.code === 200) {
    ElMessage.success('升级成功')
  }
}
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
}

.sbForm {
  width: 600px;
  :deep(.el-form-item__label) {
    width: 120px;
    padding-right: 28px;
    color: #333333;
  }

  :deep(.el-form-item) {
    margin-bottom: 24px;
  }
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.row-actions-group {
  gap: 0;
}

.row-actions-group .pill-btn:first-child {
  border-radius: 22px 0 0 22px;
}

.row-actions-group .pill-btn:last-child {
  border-radius: 0 22px 22px 0;
  border-left: 1px solid rgba(255, 255, 255, 0.5);
}

.pill-btn {
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.pill-orange {
  background: rgba(255,108,26,0.08);
  color: #FF6C1A;
  border: 1px solid #FF6C1A;
}

.pill-blue {
  background: rgba(26,83,255,0.08);
  color: #1A53FF;
  border: 1px solid #2278FF;
}

.fw-row {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  column-gap: 18px;
  row-gap: 12px;
  align-items: start;
}

.upload-box {
  height: 92px;
  border: 2px dashed rgba(26, 83, 255, 0.55);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #1a53ff;
  background: #fff;
  cursor: pointer;
}

.upload-plus-img {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
}

.upload-text {
  font-size: 18px;
  font-weight: 500;
}

.pill-upgrade {
  height: 44px;
  align-self: center;
}

.fw-tip {
  grid-column: 1 / span 2;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #FF6C1A;
}

.tip-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(255, 122, 47, 0.8);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
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

