<template>
  <div class="httpListenPage">
    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item label="监听端口">
        <el-input v-model="form.listenPort" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="监听IP地址">
        <el-input v-model="form.listenIp" placeholder="请输入" />
      </el-form-item>
    </el-form>

    <!-- 监听端口列表 -->
    <div class="sectionTitle">
      <span class="line" />
      <span>监听端口列表</span>
    </div>

    <TableSelf
      class="new_table"
      header-cell-class-name="header_cell"
      stripe
      :data="tableData"
      current-row-key="id"
    >
      <el-table-column label="序号" width="90">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="port" label="端口" />
      <el-table-column prop="ipAddress" label="IP地址" />
      <el-table-column fixed="right" align="right" label="操作">
        <template #default="scope">
          <div class="test-button" @click="handleTest(scope.row)">
            <oort-svg-icon width="16" height="16" name="cs" />
            <span>测试</span>
          </div>
        </template>
      </el-table-column>
    </TableSelf>

    <div class="submitBox flexRowAC">
      <div class="submit" @click="handleSave">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TableSelf from '@/components/TableSelf.vue'
import { getHttpListen, saveHttpListen } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()

const form = ref({
  listenPort: '',
  listenIp: ''
})

const tableData = ref<any[]>([])

const fetchHttpListen = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getHttpListen(params)
  if (res.code === 200 && res.data) {
    form.value.listenPort = res.data.listen_port ?? ''
    form.value.listenIp = res.data.listen_ip ?? ''

    const list = Array.isArray(res.data.listen_list) ? res.data.listen_list : []
    tableData.value = list.map((item: any, index: number) => ({
      id: String(item.id ?? index + 1),
      port: item.port ?? '',
      ipAddress: item.ip_addr ?? ''
    }))
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    listen_port: form.value.listenPort,
    listen_ip: form.value.listenIp,
    listen_list: tableData.value.map((row: any) => ({
      port: row.port,
      ip_addr: row.ipAddress
    }))
  }
  const res: any = await saveHttpListen(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchHttpListen()
  }
}

onMounted(() => {
  fetchHttpListen()
})

const handleTest = (row: any) => {
  // 测试监听端口
  // eslint-disable-next-line no-console
  console.log('测试监听端口:', row)
}
</script>

<style lang="scss" scoped>
.httpListenPage {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    width: 480px;

    .el-input {
      height: 40px;
    }
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
}

.new_table {
  width: 880px;
}

.test-button {
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
