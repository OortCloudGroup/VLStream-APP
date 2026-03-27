<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="userPage">
    <div class="useBtnBox flexRowAC">
      <div class="button-groupBox">
        <button-group
          :button-list="[
            {svg: 'refresh', name: '刷新', clickFn: handleRefresh},
          ]"
        />
      </div>
    </div>
    <TableSelf
      class="new_table"
      header-cell-class-name="header_cell"
      stripe
      :data="tableData"
      current-row-key="check_id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="序号" width="90">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="name1" label="用户名" />
      <el-table-column prop="userType" label="用户类型" />
      <el-table-column prop="ip" label="IP地址" />
      <el-table-column prop="operateTime" label="用户操作时间" />
      <el-table-column fixed="right" align="right" label="操作" />
    </TableSelf>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ButtonGroup from '@/components/buttonGroup.vue'
import TableSelf from '@/components/TableSelf.vue'
import { getUserManage } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const tableData = ref<any[]>([])
const selectedRows = ref<any[]>([])

const fetchUserManage = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getUserManage(params)
  if (res.code === 200 && res.data) {
    if (res.data.在线用户) {
      tableData.value = res.data.在线用户.map((item: any) => ({
        id: item.id,
        name1: item.user_name || '',
        userType: item.user_type || '',
        ip: item.ip || '',
        operateTime: item.user_operation_time || ''
      }))
    }
  }
}

const handleSelectionChange = (rows: any[]) => {
  selectedRows.value = rows || []
}

const handleRefresh = async() => {
  await fetchUserManage()
  ElMessage.success('刷新成功')
}

onMounted(() => {
  fetchUserManage()
})
</script>

<style lang="scss" scoped>
.userPage {
  width: 880px;
}

.useBtnBox {
  gap: 16px;
  padding-bottom: 20px;
  padding-top: 4px;
}

.button-groupBox {
  display: flex;
  align-items: center;
}
</style>

