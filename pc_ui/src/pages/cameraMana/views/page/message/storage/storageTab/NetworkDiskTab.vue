<template>
  <div class="systemBasic">
    <TableSelf
      class="network_table"
      header-cell-class-name="header_cell"
      stripe
      :data="tableData"
      row-key="id"
      :expand-row-keys="expandRowKeys"
      @row-click="handleRowClick"
    >
      <el-table-column type="expand" :width="0">
        <template #default="{ row }">
          <el-form v-if="row.id === currentRowId" class="sbForm" label-position="top" :model="detailForm">
            <div class="mountRow">
              <el-form-item label="挂载方式">
                <el-select v-model="detailForm.mountType" placeholder="请选择" class="full-select">
                  <el-option label="JPEG" value="jpeg" />
                </el-select>
              </el-form-item>
              <el-form-item label="用户名">
                <el-input v-model="detailForm.username" placeholder="请输入" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="detailForm.password" placeholder="请输入" type="password" />
              </el-form-item>
              <button class="test-button" type="button" @click.stop="handleTest">
                <oort-svg-icon width="16" height="16" name="cs2" />
                <span>测试</span>
              </button>
            </div>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column prop="channel" label="磁盘号" />
      <el-table-column prop="server_ip" label="服务器地址" />
      <el-table-column prop="remote_path" label="路径文件" />
      <el-table-column prop="type" label="类型" />
      <el-table-column fixed="right" align="right" label="操作">
        <template #default="scope">
          <div class="delete-btn" @click.stop="handleDelete(scope.row)">
            <oort-svg-icon width="16" height="16" name="delete" />
            <span>删除</span>
          </div>
        </template>
      </el-table-column>
    </TableSelf>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="onSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import TableSelf from '@/components/TableSelf.vue'
import OortSvgIcon from '@/components/oortSvgIcon/index.vue'
import { ElMessage } from 'element-plus'
import { getNetStorageManage, saveNetStorageManage } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

type Row = {
  id: number
  channel: number
  server_ip: string
  remote_path: string
  type: string
}

type ApiNas = {
  id?: number
  channel: number
  server_ip: string
  remote_path: string
  type: string
}

const tableData = ref<Row[]>([])

// 默认不展开任何行
const currentRowId = ref<number | null>(null)
const expandRowKeys = ref<(number | string)[]>([])

const detailForm = reactive({
  mountType: 'jpeg',
  username: '',
  password: ''
})

const syncDetailForm = (row: Row | null) => {
  if (!row) return
  // TODO: 根据行数据初始化表单字段（目前示例使用默认值）
}

const handleRowClick = (row: Row) => {
  if (currentRowId.value === row.id) {
    // 再次点击同一行则收起
    currentRowId.value = null
    expandRowKeys.value = []
  } else {
    currentRowId.value = row.id
    expandRowKeys.value = [row.id]
    syncDetailForm(row)
  }
}

const handleDelete = (row: Row) => {
  tableData.value = tableData.value.filter(item => item.id !== row.id)
  // 收起展开
  if (currentRowId.value === row.id) {
    currentRowId.value = null
    expandRowKeys.value = []
  }
}

const handleTest = () => {
  // TODO: 测试挂载连接
  void detailForm
}

const fetchNetStorageManage = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getNetStorageManage(params)
  if (res?.code === 200 && Array.isArray(res.data?.nas_list)) {
    tableData.value = res.data.nas_list.map((item: ApiNas, idx: number) => ({
      id: Number(item.id) || idx + 1,
      channel: item.channel,
      server_ip: item.server_ip,
      remote_path: item.remote_path,
      type: item.type
    }))
    currentRowId.value = null
    expandRowKeys.value = []
  }
}

const onSave = async() => {
  const params: any = {
    accessToken: store.userInfo?.accessToken,
    nas_list: tableData.value.map(item => ({
      channel: item.channel,
      server_ip: item.server_ip,
      remote_path: item.remote_path,
      type: item.type
    }))
  }
  const res: any = await saveNetStorageManage(params)
  if (res?.code === 200) {
    ElMessage.success('保存成功')
    await fetchNetStorageManage()
  }
}

onMounted(() => {
  fetchNetStorageManage()
})
</script>

<style lang="scss" scoped>
.systemBasic {
  padding-left: 20px;
  width: 100%;
}

.network_table {
  width: 880px;
}

.sbForm {
  width: 880px;
  margin-top: 24px;

  .el-input {
    height: 40px;
  }

  .full-select {
    width: 100%;

    :deep(.el-input__wrapper) {
      height: 40px !important;
    }
  }
}

.mountRow {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding: 0 10px;
}

.test-button {
  align-self: center;
  margin-top: 14px;
  background: var(--el-color-primary-hb);
  border: 1px solid var(--el-color-primary);
  border-radius: 20px;
  padding: 10px 16px;
  margin-bottom: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;

  span {
    font-size: 14px;
    color: var(--el-color-primary);
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
    font-weight: 400;
    cursor: pointer;
  }
}

// 隐藏展开列默认箭头
:deep(.network_table .el-table__expand-icon) {
  display: none !important;
}

:deep(.network_table .el-table__expand-column) {
  width: 0 !important;
  padding: 0 !important;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: var(--el-color-primary);
}

.asterisk-left{
  flex: 1;
}
</style>
