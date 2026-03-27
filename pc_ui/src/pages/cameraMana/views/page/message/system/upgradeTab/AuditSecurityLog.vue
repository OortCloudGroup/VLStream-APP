<template>
  <div class="auditPage">
    <!-- 表格 + 搜索（同 Log.vue） -->
    <div class="depNameBox_out flexRowAC" style="justify-content: flex-end">
      <div class="searchHeight_out flexRowAC">
        <search-height-box keyword="keyword" placeholder="搜索" :data="searchData" @handle="searchResetFn" />
        <export-excel-pdf />
      </div>
    </div>

    <TableSelf
      class="new_table"
      header-cell-class-name="header_cell"
      stripe
      :data="tableData"
      :row-class-name="tableRowClassName"
      current-row-key="id"
    >
      <el-table-column label="序号" :width="clacPXToVW(70)">
        <template #default="scope">
          {{ scope.$index + (page - 1) * pageSize + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="time" label="时间" />
      <el-table-column prop="mainType" label="主类型" />
      <el-table-column prop="subType" label="次类型" />
      <el-table-column prop="channelNo" label="通道号" />
      <el-table-column prop="user" label="本地/远程用户" />
      <el-table-column prop="remoteHost" label="远程主机地址" />
      <el-table-column prop="detail" label="详情" />
      <el-table-column fixed="right" align="right" label="操作" />
    </TableSelf>

    <div class="paginationBox flexRowAC">
      <el-pagination
        background
        :page-sizes="[6, 10, 20, 50]"
        :page-size="pageSize"
        layout="total, prev, pager, next, sizes"
        :total="count"
        class="justifyAlign"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 高级配置 -->
    <div class="adv">
      <div class="advHeader flexRowAC">
        <div class="advTitle">
          <span class="line" />
          <span>高级配置</span>
        </div>
        <div class="advLine" />
      </div>

      <el-form class="advForm" label-position="left" :model="form">
        <el-form-item>
          <el-checkbox v-model="form.auditLogEnabled">
            启用日志上传服务器
          </el-checkbox>
        </el-form-item>

        <el-form-item label="日志服务器地址">
          <el-input v-model="form.auditServerHost" placeholder="请输入" class="advInput" />
        </el-form-item>

        <el-form-item label="日志服务器端口">
          <div class="portRow">
            <el-input v-model="form.auditServerPort" placeholder="请输入" class="advInput" />
            <button class="pill-btn pill-blue" type="button">
              <img class="btn-icon" src="@/assets/img/camera/cs.png" alt="" />
              <span>测试</span>
            </button>
          </div>
        </el-form-item>

        <el-form-item label="创建证书请求">
          <button class="pill-btn pill-blue" type="button" @click="handleCreateCertificateRequest">
            <img class="btn-icon" src="@/assets/img/camera/cj.png" alt="" />
            <span>创建</span>
          </button>
        </el-form-item>

        <el-form-item label="证书请求下载">
          <button class="pill-btn pill-blue" type="button" @click="handleDownloadCertificateRequest">
            <img class="btn-icon" src="@/assets/img/camera/xz.png" alt="" />
            <span>下载</span>
          </button>
        </el-form-item>

        <el-form-item label="证书请求删除">
          <button class="pill-btn pill-red" type="button" @click="handleDeleteCertificateRequest">
            <el-icon class="pill-icon">
              <Delete />
            </el-icon>
            <span>删除</span>
          </button>
        </el-form-item>

        <el-form-item label="安装生成的证书">
          <div class="uploadInstallRow">
            <div class="uploadBox" role="button" tabindex="0">
              <img class="uploadPlusImg" src="@/assets/img/camera/scsp.png" alt="" />
              <div class="uploadText">
                上传证书
              </div>
            </div>
            <button class="pill-btn pill-blue pill-install" type="button" @click="handleInstallGeneratedCertificate">
              <img class="btn-icon" src="@/assets/img/camera/az.png" alt="" />
              <span>安装</span>
            </button>
          </div>
        </el-form-item>

        <el-form-item label="安装CA证书">
          <div class="uploadInstallRow">
            <div class="uploadBox" role="button" tabindex="0">
              <img class="uploadPlusImg" src="@/assets/img/camera/scsp.png" alt="" />
              <div class="uploadText">
                上传证书
              </div>
            </div>
            <button class="pill-btn pill-blue pill-install" type="button" @click="handleInstallCaCertificate">
              <img class="btn-icon" src="@/assets/img/camera/az.png" alt="" />
              <span>安装</span>
            </button>
          </div>
        </el-form-item>
      </el-form>

      <div class="submitBox flexRowAC">
        <div class="submit" @click="handleSave">
          保 存
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import TableSelf from '@/components/TableSelf.vue'
import { clacPXToVW } from '@/utils/index'
import { Delete } from '@element-plus/icons-vue'
import { getSecurityLog, saveSecurityLog, createCertificateRequest, downloadCertificateRequest, deleteCertificateRequest, installCaCertificate, installGeneratedCertificate } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

type Row = {
  id: string
  time: string
  mainType: string
  subType: string
  channelNo: string | number
  user: string
  remoteHost: string
  detail: string
}

const form = ref({
  auditLogEnabled: false,
  auditServerHost: '',
  auditServerPort: ''
})

const formSearch = reactive({
  keyword: '',
  main_type: '',
  sub_type: ''
})

const searchData = ref<any[]>([
  {
    label: '主类型',
    value: 'main_type',
    type: 'text',
    default: ''
  },
  {
    label: '次类型',
    value: 'sub_type',
    type: 'text',
    default: ''
  }
])

const page = ref(1)
const pageSize = ref(6)
const count = ref(0)

const tableData = ref<Row[]>([])

const fetchSecurityLog = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    page: page.value,
    limit: pageSize.value
  }

  // 添加搜索参数
  if (formSearch.keyword) {
    params.keyword = formSearch.keyword
  }
  if (formSearch.main_type) {
    params.main_type = formSearch.main_type
  }
  if (formSearch.sub_type) {
    params.sub_type = formSearch.sub_type
  }

  const res: any = await getSecurityLog(params)
  if (res.code === 200 && res.data) {
    // 映射高级配置字段
    if (res.data.config) {
      form.value = {
        auditLogEnabled: res.data.config.log_upload_server || false,
        auditServerHost: res.data.config.log_server_address || '',
        auditServerPort: res.data.config.log_server_port || ''
      }
    }

    // 映射日志数据
    if (res.data.logs) {
      const logsData = res.data.logs
      count.value = logsData.total || 0

      // 映射中文字段名到组件字段名
      tableData.value = (logsData.data || []).map((item: any, index: number) => ({
        id: String(item.序号 || index),
        time: item.时间 || '',
        mainType: item.主类型 || '',
        subType: item.次类型 || '',
        channelNo: item.通道号 || '',
        user: item['本地/远程用户'] || '',
        remoteHost: item.远程主机地址 || '',
        detail: item.详情 || ''
      }))
    }
  }
}

function searchResetFn(val: any, reset: boolean) {
  if (reset) page.value = 1
  formSearch.keyword = val.keyword || ''
  formSearch.main_type = val.main_type || ''
  formSearch.sub_type = val.sub_type || ''
  fetchSecurityLog()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
  fetchSecurityLog()
}

const handleCurrentChange = (val: number) => {
  page.value = val
  fetchSecurityLog()
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    log_upload_server: form.value.auditLogEnabled,
    log_server_address: form.value.auditServerHost,
    log_server_port: form.value.auditServerPort
  }
  const res: any = await saveSecurityLog(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchSecurityLog()
  }
}

const handleCreateCertificateRequest = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await createCertificateRequest(params)
  if (res.code === 200) {
    ElMessage.success('创建成功')
  }
}

const handleDownloadCertificateRequest = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await downloadCertificateRequest(params)
  if (res.code === 200) {
    ElMessage.success('下载成功')
  }
}

const handleDeleteCertificateRequest = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await deleteCertificateRequest(params)
  if (res.code === 200) {
    ElMessage.success('删除成功')
  }
}

const handleInstallGeneratedCertificate = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await installGeneratedCertificate(params)
  if (res.code === 200) {
    ElMessage.success('安装成功')
  }
}

const handleInstallCaCertificate = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await installCaCertificate(params)
  if (res.code === 200) {
    ElMessage.success('安装成功')
  }
}

const tableRowClassName = () => ''

onMounted(() => {
  fetchSecurityLog()
})
</script>

<style lang="scss" scoped>
.auditPage {
  width: 100%;
}

.searchHeight_out {
  gap: 12px;
}

.paginationBox {
  justify-content: flex-end;
  padding: 18px 0 0;
}

:deep(.header_cell) {
  color: #333;
  background-color: #fafafa;
}

.adv {
  margin-top: 20px;
}

.advHeader {
  gap: 12px;
  align-items: center;
  padding-bottom: 14px;
}

.advTitle {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: var(--el-color-primary);
  .line{
    display: flex;
    width: 3px;
    height: 18px;
    background: var(--el-color-primary);
    margin-right: 8px;
  }
}

.advLine {
  height: 1px;
  flex: 1;
  background: #e5e7eb;
  opacity: 0.35;
}

.advForm {
  max-width: 720px;

  :deep(.el-form-item__label) {
    width: 140px;
    padding-right: 24px;
    color: #666;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}

.advInput {
  width: 420px;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.portRow {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pill-btn {
  border: none;
  height: 34px;
  padding: 0 16px;
  border-radius: 18px;
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

.pill-blue {
  background: rgba(26, 83, 255, 0.10);
  color: #1a53ff;
}

.pill-red {
  background: rgba(255, 77, 79, 0.12);
  color: #ff4d4f;
}

.uploadInstallRow {
  display: flex;
  gap: 20px;
}

.uploadBox {
  width: 320px;
  height: 78px;
  border: 2px dashed rgba(26, 83, 255, 0.55);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #1a53ff;
  background: #fff;
  cursor: pointer;
}

.uploadPlusImg {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
}

.uploadText {
  font-size: 16px;
  font-weight: 500;
}

.pill-install {
  height: 34px;
}

.submitBox {
  padding: 28px 0 0;

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

