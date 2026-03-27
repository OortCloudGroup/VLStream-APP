<template>
  <div class="portMappingPage">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.upnp">
          启用UPnP
        </el-checkbox>
      </el-form-item>
      <el-form-item label="别名">
        <el-input v-model="form.alias" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="端口映射方式">
        <el-select v-model="form.port_mapping_method" placeholder="请选择" class="full-select">
          <el-option label="自动" value="自动" />
          <el-option label="手动" value="手动" />
        </el-select>
      </el-form-item>
    </el-form>

    <TableSelf
      class="new_table"
      header-cell-class-name="header_cell"
      stripe
      :data="tableData"
      current-row-key="id"
    >
      <el-table-column prop="port_type" label="端口类型" />
      <el-table-column prop="external_port" label="外部端口" />
      <el-table-column prop="external_ip_address" label="外部IP地址" />
      <el-table-column prop="internal_port" label="内部端口" />
      <el-table-column prop="state" label="状态">
        <template #default="scope">
          <span :class="['status-badge', scope.row.state === '已生效' ? 'status-effective' : 'status-ineffective']">
            {{ scope.row.state === '已生效' ? '已生效' : '未生效' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" align="right" label="操作" />
    </TableSelf>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import TableSelf from '@/components/TableSelf.vue'
import { getPortMap, savePortMap } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = reactive({
  upnp: false,
  alias: '',
  port_mapping_method: '自动'
})

const tableData = ref<any[]>([])

const fetchPortMap = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getPortMap(params)
  if (res.code === 200 && res.data) {
    form.upnp = !!res.data.upnp
    form.alias = res.data.alias || ''
    form.port_mapping_method = res.data.port_mapping_method || '自动'
    tableData.value = Array.isArray(res.data.port_map) ? res.data.port_map : []
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    upnp: form.upnp,
    alias: form.alias,
    port_mapping_method: form.port_mapping_method,
    port_map: tableData.value
  }
  const res: any = await savePortMap(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchPortMap()
  }
}

onMounted(() => {
  fetchPortMap()
})
</script>

<style lang="scss" scoped>
.portMappingPage {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    width: 480px;
    .el-input {
      height: 40px;
    }
  }
}

.new_table{
  width: 880px;
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  white-space: nowrap;
}

.status-effective {
  background: rgba(26, 83, 255, 0.1);
  color: #1A53FF;
}

.status-ineffective {
  background: rgba(153, 153, 153, 0.1);
  color: #999999;
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
