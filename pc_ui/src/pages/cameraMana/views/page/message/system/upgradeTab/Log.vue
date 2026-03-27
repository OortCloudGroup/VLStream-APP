<template>
  <div class="logPage">
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

    <div class="submitBox flexRowAC">
      <div class="submit">
        保 存
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import TableSelf from '@/components/TableSelf.vue'
import { clacPXToVW } from '@/utils/index'
import { getLog } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'

const store: any = useUserStore()

type LogRow = {
  id: string
  time: string
  mainType: string
  subType: string
  channelNo: string | number
  user: string
  remoteHost: string
}

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

const tableData = ref<LogRow[]>([])

const fetchLog = async() => {
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

  const res: any = await getLog(params)
  if (res.code === 200 && res.data?.logs) {
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
      remoteHost: item.远程主机地址 || ''
    }))
  }
}

function searchResetFn(val: any, reset: boolean) {
  if (reset) page.value = 1
  formSearch.keyword = val.keyword || ''
  formSearch.main_type = val.main_type || ''
  formSearch.sub_type = val.sub_type || ''
  fetchLog()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  page.value = 1
  fetchLog()
}

const handleCurrentChange = (val: number) => {
  page.value = val
  fetchLog()
}

const tableRowClassName = () => ''

onMounted(() => {
  fetchLog()
})
</script>

<style lang="scss" scoped>
.logPage {
  width: 100%;
}

.searchHeight_out {
  gap: 12px;
}

.paginationBox {
  justify-content: flex-end;
  padding: 18px 0 0;
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

/* 表头样式（与截图接近） */
:deep(.header_cell) {
  color: #333;
  background-color: #fafafa;
}
</style>

