<template>
  <div class="systemBasic">
    <el-form ref="sbForm" class="sbForm" label-position="top" :model="form">
      <el-form-item label="网卡类型">
        <el-select v-model="form.networkCardType" placeholder="请选择" class="full-select">
          <el-option label="自适应" value="adaptive" />
        </el-select>
      </el-form-item>
      <el-form-item label="IP地址">
        <el-checkbox v-model="form.autoObtain">
          自动获取
        </el-checkbox>
      </el-form-item>
      <el-form-item label="IPv4子网掩码">
        <el-input v-model="form.ipv4SubnetMask" placeholder="请输入" />
      </el-form-item>
      <div class="cs">
        <el-form-item label="设备IPv4地址">
          <el-input v-model="form.deviceIPv4Address" placeholder="请输入" />
        </el-form-item>
        <button class="test-button" type="button">
          <oort-svg-icon width="16" height="16" name="cs2" />
          <span>测试</span>
        </button>
      </div>
      <el-form-item label="IPv4默认网关">
        <el-input v-model="form.ipv4DefaultGateway" placeholder="请输入" />
      </el-form-item>
      <div class="cs2">
        <el-form-item label="IPv6模式">
          <el-select v-model="form.ipv6Mode" placeholder="请选择" class="full-select">
            <el-option label="路由公告" value="router_advertisement" />
          </el-select>
        </el-form-item>
        <button class="test-button" type="button">
          <oort-svg-icon width="16" height="16" name="view_router" />
          <span>查看路由公告</span>
        </button>
      </div>
      <el-form-item label="IPv6子网掩码">
        <el-input v-model="form.ipv6SubnetMask" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="设备IPv6地址">
        <el-input v-model="form.deviceIPv6Address" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="物理地址">
        <el-input v-model="form.physicalAddress" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="MTU">
        <el-input v-model="form.mtu" placeholder="请输入" />
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="form.enableMulticastSearch">
          启用多播搜索
        </el-checkbox>
      </el-form-item>
      <div class="sectionTitle">
        <span class="line" />
        <span>DNS服务器配置</span>
      </div>
      <el-form-item label="首选DNS服务器">
        <el-input v-model="form.preferredDNSServer" placeholder="请输入" />
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
import { onMounted, reactive } from 'vue'
import { getTcpIp, saveTcpIp } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'

const store: any = useUserStore()
const form = reactive({
  networkCardType: 'adaptive',
  autoObtain: false,
  ipv4SubnetMask: '',
  deviceIPv4Address: '',
  ipv4DefaultGateway: '',
  ipv6Mode: 'router_advertisement',
  ipv6SubnetMask: '',
  deviceIPv6Address: '',
  physicalAddress: '',
  mtu: '',
  enableMulticastSearch: false,
  preferredDNSServer: '',
  alternateDNSServer: ''
})

const mapEniTypeFromApi = (val: any) => {
  // 接口返回: "自适应"；页面下拉 value: "adaptive"
  if (val === '自适应') return 'adaptive'
  return val || 'adaptive'
}
const mapEniTypeToApi = (val: any) => {
  if (val === 'adaptive') return '自适应'
  return val || '自适应'
}
const mapIpv6ModeFromApi = (val: any) => {
  // 接口返回: "路由公告"；页面下拉 value: "router_advertisement"
  if (val === '路由公告') return 'router_advertisement'
  return val || 'router_advertisement'
}
const mapIpv6ModeToApi = (val: any) => {
  if (val === 'router_advertisement') return '路由公告'
  return val || '路由公告'
}

const fetchTcpIp = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getTcpIp(params)
  if (res.code === 200 && res.data) {
    form.autoObtain = !!res.data.ip_automatic_acquisition
    form.networkCardType = mapEniTypeFromApi(res.data.eni_type)
    form.ipv4SubnetMask = res.data.ipv4_subnet_mask || ''
    form.deviceIPv4Address = res.data.ipv4_addr || ''
    form.ipv4DefaultGateway = res.data.ipv4_default_gateway || ''
    form.ipv6Mode = mapIpv6ModeFromApi(res.data.ipv6_mode)
    form.ipv6SubnetMask = res.data.ipv6_subnet_mask || ''
    form.deviceIPv6Address = res.data.ipv6_addr || ''
    form.physicalAddress = res.data.physical_addr || ''
    form.mtu = res.data.mtu || ''
    form.enableMulticastSearch = !!res.data.multicast_search
    form.preferredDNSServer = res.data.dns_ip || ''
    // 接口示例里返回 dns_mtu，这里映射到第二个输入框（保存时按你的要求传 alternate_dns）
    form.alternateDNSServer = res.data.dns_mtu || ''
  }
}

const handleSave = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken,
    ip_automatic_acquisition: !!form.autoObtain,
    eni_type: mapEniTypeToApi(form.networkCardType),
    ipv4_subnet_mask: form.ipv4SubnetMask,
    ipv4_addr: form.deviceIPv4Address,
    ipv4_default_gateway: form.ipv4DefaultGateway,
    ipv6_mode: mapIpv6ModeToApi(form.ipv6Mode),
    ipv6_subnet_mask: form.ipv6SubnetMask,
    ipv6_addr: form.deviceIPv6Address,
    physical_addr: form.physicalAddress,
    mtu: form.mtu,
    multicast_search: !!form.enableMulticastSearch,
    dns_ip: form.preferredDNSServer,
    alternate_dns: form.alternateDNSServer
  }
  const res: any = await saveTcpIp(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchTcpIp()
  }
}

onMounted(() => {
  fetchTcpIp()
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

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.cs {
  width: 120.5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cs2{
  width: 132.5%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.test-button {
  background: var(--el-color-primary-hb);
  border: 1px solid var(--el-color-primary);
  border-radius: 20px;
  padding: 10px 16px;
  margin-top: 10px;
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

.asterisk-left{
  flex: 1;
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
