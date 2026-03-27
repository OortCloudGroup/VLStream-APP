<template>
  <div class="emailPage">
    <el-form ref="emailFormRef" class="sbForm" label-position="top" :model="form" :rules="rules">
      <!-- 发件人信息 -->
      <el-form-item label="发件人名称">
        <el-input v-model="form.sender_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="发件人地址">
        <el-input v-model="form.sender_addr" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="SMTP服务器">
        <el-input v-model="form.SMTP_server" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="SMTP端口">
        <el-input v-model="form.SMTP_port" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="邮件加密">
        <el-select v-model="form.message_encryption" placeholder="请选择" class="full-select">
          <el-option label="不加密" value="不加密" />
        </el-select>
      </el-form-item>

      <!-- 图片附件 -->
      <el-form-item>
        <el-checkbox v-model="form.image_attachment">
          图片附件
        </el-checkbox>
      </el-form-item>
      <el-form-item label="抓取时间间隔（秒）">
        <el-input v-model="form.grab_interval" placeholder="请输入" />
      </el-form-item>

      <!-- 服务器认证 -->
      <el-form-item>
        <el-checkbox v-model="form.server_authentication">
          服务器认证
        </el-checkbox>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.user_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入" show-password />
      </el-form-item>
      <el-form-item label="密码确认" prop="password_confirmation">
        <el-input v-model="form.password_confirmation" type="password" placeholder="请输入" show-password />
      </el-form-item>
    </el-form>

    <!-- 收件人列表 -->
    <div class="sectionTitle">
      <span class="line" />
      <span>收件人</span>
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
      <el-table-column prop="recipient" label="收件人" />
      <el-table-column prop="recipient_addr" label="收件人地址" />
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
import { getEmail, saveEmail } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const store: any = useUserStore()

const emailFormRef = ref<FormInstance>()

const form = ref({
  sender_name: '',
  sender_addr: '',
  SMTP_server: '',
  SMTP_port: '',
  message_encryption: '不加密',
  image_attachment: false,
  grab_interval: '',
  server_authentication: false,
  user_name: '',
  password: '',
  password_confirmation: ''
})

const rules = ref<FormRules>({
  password_confirmation: [
    {
      validator: (_rule, value, callback) => {
        const confirm = value ?? ''
        if (confirm === '') return callback()
        if (confirm !== (form.value.password ?? '')) return callback(new Error('两次输入的密码不一致'))
        return callback()
      },
      trigger: ['blur']
    }
  ]
})

const tableData = ref<any[]>([])

const fetchEmail = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getEmail(params)
  if (res.code === 200 && res.data) {
    form.value = {
      sender_name: res.data.sender_name ?? '',
      sender_addr: res.data.sender_addr ?? '',
      SMTP_server: res.data.SMTP_server ?? '',
      SMTP_port: res.data.SMTP_port ?? '',
      message_encryption: res.data.message_encryption ?? '不加密',
      image_attachment: !!res.data.image_attachment,
      grab_interval: res.data.grab_interval ?? '',
      server_authentication: !!res.data.server_authentication,
      user_name: res.data.user_name ?? '',
      password: res.data.password ?? '',
      password_confirmation: res.data.password_confirmation ?? ''
    }
    tableData.value = Array.isArray(res.data.recipient) ? res.data.recipient : []
  }
}

const handleSave = async() => {
  const valid = await emailFormRef.value?.validate().catch(() => false)
  if (!valid) return
  const params = {
    accessToken: store.userInfo?.accessToken,
    sender_name: form.value.sender_name,
    sender_addr: form.value.sender_addr,
    SMTP_server: form.value.SMTP_server,
    SMTP_port: form.value.SMTP_port,
    message_encryption: form.value.message_encryption,
    image_attachment: !!form.value.image_attachment,
    grab_interval: form.value.grab_interval,
    server_authentication: !!form.value.server_authentication,
    user_name: form.value.user_name,
    password: form.value.password,
    password_confirmation: form.value.password_confirmation,
    recipient: tableData.value.map((r: any) => ({
      recipient: r.recipient,
      recipient_addr: r.recipient_addr
    }))
  }
  const res: any = await saveEmail(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchEmail()
  }
}

const handleTest = (row: any) => {
  // 测试收件人
  // eslint-disable-next-line no-console
  console.log('测试收件人:', row)
}

onMounted(() => {
  fetchEmail()
})
</script>

<style lang="scss" scoped>
.emailPage {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    width: 480px;

    .el-input {
      height: 40px;
    }
  }
}

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
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
