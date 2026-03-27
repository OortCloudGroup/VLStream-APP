<template>
  <div class="systemBasic">
    <el-form ref="sbForm" class="sbForm" label-position="top" :model="form">
      <!-- SNMP v1/v2 -->
      <div class="sectionTitle">
        <span class="line" />
        <span>SNMP v1/v2</span>
      </div>
      <el-form-item>
        <div class="checkbox-group">
          <el-checkbox v-model="form.SNMP_v1">
            启动SNMPv1
          </el-checkbox>
          <el-checkbox v-model="form.SNMP_v2">
            启动SNMPv2c
          </el-checkbox>
        </div>
      </el-form-item>
      <el-form-item label="读共同体名称">
        <el-input v-model="form.read_the_name_of_the_community" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="写共同体名称">
        <el-input v-model="form.write_the_name_of_the_community" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="Trap地址">
        <el-input v-model="form.trap_addr" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="Trap端口">
        <el-input v-model="form.trap_port" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="Trap团体名">
        <el-input v-model="form.trap_group_name" placeholder="请输入" />
      </el-form-item>

      <!-- SNMP v3 -->
      <div class="sectionTitle">
        <span class="line" />
        <span>SNMP v3</span>
      </div>
      <el-form-item>
        <el-checkbox v-model="form.SNMP_v3">
          启动SNMPv3
        </el-checkbox>
      </el-form-item>
      <el-form-item label="读安全名称">
        <el-input v-model="form.read_the_security_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="安全级别">
        <el-select v-model="form.security_level1" placeholder="请选择" class="full-select">
          <el-option label="no anth" value="no anth" />
          <el-option label="authNoPriv" value="authNoPriv" />
          <el-option label="authPriv" value="authPriv" />
        </el-select>
      </el-form-item>
      <el-form-item label="认证算法">
        <el-radio-group v-model="form.authentication_algorithm1">
          <el-radio label="MD5">
            MD5
          </el-radio>
          <el-radio label="SHA">
            SHA
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="认证密码">
        <el-input v-model="form.authentication_password1" type="password" placeholder="请输入" show-password />
      </el-form-item>
      <el-form-item label="私钥算法">
        <el-radio-group v-model="form.private_key_algorithm1">
          <el-radio label="DES">
            DES
          </el-radio>
          <el-radio label="AES">
            AES
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="私钥密码">
        <el-input v-model="form.private_key_password1" type="password" placeholder="请输入" show-password />
      </el-form-item>
      <el-form-item label="写安全名称">
        <el-input v-model="form.write_the_security_name" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="安全级别">
        <el-select v-model="form.security_level2" placeholder="请选择" class="full-select">
          <el-option label="no anth" value="no anth" />
          <el-option label="authNoPriv" value="authNoPriv" />
          <el-option label="authPriv" value="authPriv" />
        </el-select>
      </el-form-item>
      <el-form-item label="认证算法">
        <el-radio-group v-model="form.authentication_algorithm2">
          <el-radio label="MD5">
            MD5
          </el-radio>
          <el-radio label="SHA">
            SHA
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="认证密码">
        <el-input v-model="form.authentication_password2" type="password" placeholder="请输入" show-password />
      </el-form-item>
      <el-form-item label="私钥算法">
        <el-radio-group v-model="form.private_key_algorithm2">
          <el-radio label="DES">
            DES
          </el-radio>
          <el-radio label="AES">
            AES
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="私钥密码">
        <el-input v-model="form.private_key_password2" type="password" placeholder="请输入" show-password />
      </el-form-item>

      <!-- SNMP 其他配置 -->
      <div class="sectionTitle">
        <span class="line" />
        <span>SNMP 其他配置</span>
      </div>
      <el-form-item label="SNMP端口">
        <el-input v-model="form.SNMP_port" placeholder="请输入" />
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
import { reactive, onMounted } from 'vue'
import { getSnmp, saveSnmp } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()
const form = reactive({
  SNMP_v1: false,
  SNMP_v2: false,
  read_the_name_of_the_community: '',
  write_the_name_of_the_community: '',
  trap_addr: '',
  trap_port: '',
  trap_group_name: '',
  SNMP_v3: false,
  read_the_security_name: '',
  security_level1: '',
  authentication_algorithm1: '',
  authentication_password1: '',
  private_key_algorithm1: '',
  private_key_password1: '',
  write_the_security_name: '',
  security_level2: '',
  authentication_algorithm2: '',
  authentication_password2: '',
  private_key_algorithm2: '',
  private_key_password2: '',
  SNMP_port: ''
})

const fetchSnmp = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getSnmp(params)
  if (res.code === 200 && res.data) {
    form.SNMP_v1 = !!res.data.SNMP_v1
    form.SNMP_v2 = !!res.data.SNMP_v2
    form.read_the_name_of_the_community = res.data.read_the_name_of_the_community || ''
    form.write_the_name_of_the_community = res.data.write_the_name_of_the_community || ''
    form.trap_addr = res.data.trap_addr || ''
    form.trap_port = res.data.trap_port || ''
    form.trap_group_name = res.data.trap_group_name || ''
    form.SNMP_v3 = !!res.data.SNMP_v3
    form.read_the_security_name = res.data.read_the_security_name || ''
    form.security_level1 = res.data.security_level1 || ''
    form.authentication_algorithm1 = res.data.authentication_algorithm1 || ''
    form.authentication_password1 = res.data.authentication_password1 || ''
    form.private_key_algorithm1 = res.data.private_key_algorithm1 || ''
    form.private_key_password1 = res.data.private_key_password1 || ''
    form.write_the_security_name = res.data.write_the_security_name || ''
    form.security_level2 = res.data.security_level2 || ''
    form.authentication_algorithm2 = res.data.authentication_algorithm2 || ''
    form.authentication_password2 = res.data.authentication_password2 || ''
    form.private_key_algorithm2 = res.data.private_key_algorithm2 || ''
    form.private_key_password2 = res.data.private_key_password2 || ''
    form.SNMP_port = res.data.SNMP_port || ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    SNMP_v1: form.SNMP_v1,
    SNMP_v2: form.SNMP_v2,
    read_the_name_of_the_community: form.read_the_name_of_the_community,
    write_the_name_of_the_community: form.write_the_name_of_the_community,
    trap_addr: form.trap_addr,
    trap_port: form.trap_port,
    trap_group_name: form.trap_group_name,
    SNMP_v3: form.SNMP_v3,
    read_the_security_name: form.read_the_security_name,
    security_level1: form.security_level1,
    authentication_algorithm1: form.authentication_algorithm1,
    authentication_password1: form.authentication_password1,
    private_key_algorithm1: form.private_key_algorithm1,
    private_key_password1: form.private_key_password1,
    write_the_security_name: form.write_the_security_name,
    security_level2: form.security_level2,
    authentication_algorithm2: form.authentication_algorithm2,
    authentication_password2: form.authentication_password2,
    private_key_algorithm2: form.private_key_algorithm2,
    private_key_password2: form.private_key_password2,
    SNMP_port: form.SNMP_port
  }
  const res: any = await saveSnmp(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchSnmp()
  }
}

onMounted(() => {
  fetchSnmp()
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

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 24px;
}

:deep(.el-radio-group) {
  display: flex;
  align-items: center;
  gap: 24px;
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
