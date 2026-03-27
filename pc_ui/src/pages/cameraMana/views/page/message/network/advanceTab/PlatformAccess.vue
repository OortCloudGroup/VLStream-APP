<template>
  <div class="platformPage">
    <!-- 顶部复选框 -->
    <div class="topCheckboxes">
      <el-checkbox v-model="form.protocol28181">
        GB28181
      </el-checkbox>
      <el-checkbox v-model="form.protocolOnvif">
        ONVIF
      </el-checkbox>
      <el-checkbox v-model="form.protocolISUP">
        ISUP
      </el-checkbox>
      <el-checkbox v-model="form.protocolYingshiyun">
        VLStream Cloud
      </el-checkbox>
    </div>

    <!-- 标题 -->
    <div class="sectionTitle">
      <span class="line" />
      <span>28218</span>
    </div>

    <el-form ref="sipFormRef" class="sbForm" label-position="top" :model="form" :rules="rules">
      <el-form-item label="本地SIP端口">
        <el-input v-model="form.localSipPort" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="传输协议">
        <el-select v-model="form.transportProtocol" placeholder="请选择" class="full-select">
          <el-option label="UDP" value="UDP" />
        </el-select>
      </el-form-item>

      <el-form-item label="白名单">
        <div class="whitelist-section">
          <button class="list-edit-btn" type="button" @click="handleListEdit">
            <oort-svg-icon width="16" height="16" name="table_edit" />
            <span>列表编辑</span>
          </button>
          <div class="platform-tabs">
            <div
              :class="['platform-tab', { active: activePlatform === 'platform1' }]"
              @click="activePlatform = 'platform1'"
            >
              平台1
            </div>
            <div
              :class="['platform-tab', { active: activePlatform === 'platform2' }]"
              @click="activePlatform = 'platform2'"
            >
              平台2
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="form.enable">
          启用
        </el-checkbox>
      </el-form-item>

      <el-form-item label="协议版本">
        <el-select v-model="form.protocolVersion" placeholder="请选择" class="full-select">
          <el-option label="GB/T28181-2011" value="GB/T28181-2011" />
        </el-select>
      </el-form-item>

      <el-form-item label="SIP服务器ID">
        <el-input v-model="form.sipServerId" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="SIP服务器域">
        <el-input v-model="form.sipServerDomain" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="SIP服务器地址">
        <el-input v-model="form.sipServerAddress" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="SIP服务器端口">
        <el-input v-model="form.sipServerPort" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="SIP用户名">
        <el-input v-model="form.sipUsername" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="SIP用户认证ID">
        <el-input v-model="form.sipUserAuthId" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="请输入" show-password />
      </el-form-item>

      <el-form-item label="密码确认" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" placeholder="请输入" show-password />
      </el-form-item>

      <el-form-item label="注册有效期">
        <div class="input-with-unit" style="width: 100%;">
          <el-input v-model="form.registrationValidity" placeholder="请输入" style="flex: 1;" />
          <span class="unit">秒</span>
        </div>
      </el-form-item>

      <el-form-item label="注册状态">
        <el-select v-model="form.registrationStatus" placeholder="请选择" class="full-select">
          <el-option label="在线" value="online" />
        </el-select>
      </el-form-item>

      <el-form-item label="心跳周期">
        <div class="input-with-unit" style="width: 100%;">
          <el-input v-model="form.heartbeatPeriod" placeholder="请输入" style="flex: 1;" />
          <span class="unit">秒</span>
        </div>
      </el-form-item>

      <el-form-item label="28181码流索引">
        <el-select v-model="form.stream28181Index" placeholder="请选择" class="full-select">
          <el-option label="主码流" value="主码流" />
        </el-select>
      </el-form-item>

      <el-form-item label="最大心跳超时次数">
        <el-input v-model="form.maxHeartbeatTimeout" placeholder="请输入" />
      </el-form-item>
    </el-form>

    <!-- 编码ID部分 -->
    <div class="encoding-id-section">
      <div class="encoding-id-title">
        编码ID
      </div>
      <div class="encoding-id-buttons">
        <div
          :class="['encoding-btn', { active: activeEncodingType === 'alarm' }]"
          @click="activeEncodingType = 'alarm'"
        >
          报警输入编码ID
        </div>
        <div
          :class="['encoding-btn', { active: activeEncodingType === 'video' }]"
          @click="activeEncodingType = 'video'"
        >
          视频通道编码ID
        </div>
      </div>

      <!-- 编码ID表格 -->
      <TableSelf
        v-if="activeEncodingType === 'alarm'"
        class="encoding-table"
        header-cell-class-name="header_cell"
        stripe
        :data="alarmEncodingTableData"
        current-row-key="id"
      >
        <el-table-column prop="alarmInputNumber" label="报警输入号" />
        <el-table-column label="报警输入编码ID">
          <template #default="scope">
            <el-input
              v-model="scope.row.alarmInputEncodingId"
              placeholder="请输入"
              class="table-input"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="right" label="操作" />
      </TableSelf>

      <TableSelf
        v-if="activeEncodingType === 'video'"
        class="encoding-table"
        header-cell-class-name="header_cell"
        stripe
        :data="videoEncodingTableData"
        current-row-key="id"
      >
        <el-table-column prop="videoChannelNumber" label="视频通道号" />
        <el-table-column label="视频通道编码ID">
          <template #default="scope">
            <el-input
              v-model="scope.row.videoChannelEncodingId"
              placeholder="请输入"
              class="table-input"
            />
          </template>
        </el-table-column>
        <el-table-column fixed="right" align="right" label="操作" />
      </TableSelf>
    </div>

    <!-- ISUP 部分 -->
    <div class="sectionTitle">
      <span class="line" />
      <span>ISUP</span>
    </div>

    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.isupEnable">
          启用
        </el-checkbox>
      </el-form-item>

      <el-form-item label="版本协议">
        <el-select v-model="form.isupVersionProtocol" placeholder="请选择" class="full-select">
          <el-option label="Ehome4.0" value="Ehome4.0" />
        </el-select>
      </el-form-item>

      <el-form-item label="服务器地址">
        <el-input v-model="form.isupServerAddress" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="端口">
        <el-input v-model="form.isupPort" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="设备ID">
        <el-input v-model="form.isupDeviceId" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="注册状态">
        <el-select v-model="form.isupRegistrationStatus" placeholder="请选择" class="full-select">
          <el-option label="在线" value="online" />
        </el-select>
      </el-form-item>
    </el-form>

    <!-- 萤石云部分 -->
    <div class="sectionTitle">
      <span class="line" />
      <span>萤石云</span>
    </div>

    <el-form class="sbForm" label-position="top" :model="form">
      <el-form-item>
        <el-checkbox v-model="form.yingshiyunEnable">
          启用
        </el-checkbox>
      </el-form-item>

      <el-form-item label="接入服务器IP">
        <el-input v-model="form.yingshiyunServerIp" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="注册状态">
        <el-select v-model="form.yingshiyunRegistrationStatus" placeholder="请选择" class="full-select">
          <el-option label="在线" value="online" />
        </el-select>
      </el-form-item>

      <el-form-item label="验证码">
        <el-input v-model="form.yingshiyunVerificationCode" type="password" placeholder="请输入" show-password />
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
import { reactive, ref, onMounted } from 'vue'
import TableSelf from '@/components/TableSelf.vue'
import { getPlatformAccess, savePlatformAccess } from '@/api/cameraMana/index'
import { useUserStore } from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const store: any = useUserStore()

const sipFormRef = ref<FormInstance>()

const form = reactive({
  protocol28181: false,
  protocolOnvif: false,
  protocolISUP: false,
  protocolYingshiyun: false,
  localSipPort: '',
  transportProtocol: '',
  enable: false,
  protocolVersion: '',
  sipServerId: '',
  sipServerDomain: '',
  sipServerAddress: '',
  sipServerPort: '',
  sipUsername: '',
  sipUserAuthId: '',
  password: '',
  confirmPassword: '',
  registrationValidity: '',
  registrationStatus: '',
  heartbeatPeriod: '',
  stream28181Index: '',
  maxHeartbeatTimeout: '',
  isupEnable: false,
  isupVersionProtocol: '',
  isupServerAddress: '',
  isupPort: '',
  isupDeviceId: '',
  isupRegistrationStatus: '',
  yingshiyunEnable: false,
  yingshiyunServerIp: '',
  yingshiyunRegistrationStatus: '',
  yingshiyunVerificationCode: ''
})

const rules = reactive<FormRules>({
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        const confirm = value ?? ''
        if (confirm === '') return callback()
        if (confirm !== (form.password ?? '')) return callback(new Error('两次输入的密码不一致'))
        return callback()
      },
      trigger: ['blur']
    }
  ]
})

const activePlatform = ref('platform1')
const activeEncodingType = ref('alarm')

const alarmEncodingTableData = ref<any[]>([])

const videoEncodingTableData = ref<any[]>([])

const handleListEdit = () => {
  // 处理列表编辑
  // eslint-disable-next-line no-console
  console.log('列表编辑')
}

const fetchPlatformAccess = async() => {
  const params = {
    accessToken: store.userInfo?.accessToken
  }
  const res: any = await getPlatformAccess(params)
  if (res.code === 200 && res.data) {
    const data = res.data

    // 协议
    const sectionList: string[] = Array.isArray(data.section_list) ? data.section_list : []
    form.protocol28181 = sectionList.includes('GB28181')
    form.protocolOnvif = sectionList.includes('ONVIF')
    form.protocolISUP = sectionList.includes('ISUP')
    form.protocolYingshiyun = sectionList.includes('VLStream Cloud')

    // section_28181
    form.enable = !!data.section_sip?.enabled
    form.localSipPort = data.section_28181?.local_sip_port ?? ''
    form.transportProtocol = data.section_28181?.transfer_protocol ?? 'UDP'
    const platform = data.section_28181?.platform
    activePlatform.value = platform === 'platform_2' ? 'platform2' : 'platform1'

    // section_sip
    form.protocolVersion = data.section_sip?.protocol_version ?? ''
    form.sipServerId = data.section_sip?.sip_server_id ?? ''
    form.sipServerDomain = data.section_sip?.sip_server_domain ?? ''
    form.sipServerPort = data.section_sip?.sip_client_port ?? ''
    form.sipServerAddress = data.section_sip?.sip_server_addr ?? ''
    // 页面上没有单独的 client_port / domain 字段：保持原样不覆盖
    form.sipUsername = data.section_sip?.sip_user_name ?? ''
    form.sipUserAuthId = data.section_sip?.sip_user_authentication_id ?? ''
    form.password = data.section_sip?.password ?? ''
    form.confirmPassword = data.section_sip?.password_confirmation ?? ''
    form.registrationValidity = data.section_sip?.period_of_registration ?? ''
    form.registrationStatus = data.section_sip?.registration_status ?? ''
    form.heartbeatPeriod = data.section_sip?.heartbeat_cycle ?? ''
    form.maxHeartbeatTimeout = data.section_sip?.maximum_heartbeat_timeouts ?? ''
    form.stream28181Index = data.section_sip?.codestream_index ?? '主码流'

    // section_isup
    form.isupEnable = !!data.section_isup?.enabled
    form.isupVersionProtocol = data.section_isup?.protocol_version ?? ''
    form.isupServerAddress = data.section_isup?.server_addr ?? ''
    form.isupPort = data.section_isup?.port ?? ''
    form.isupDeviceId = data.section_isup?.device_id ?? ''
    form.isupRegistrationStatus = data.section_isup?.registration_status ?? ''

    // section_cloud
    form.yingshiyunEnable = !!data.section_cloud?.enabled
    form.yingshiyunServerIp = data.section_cloud?.access_server_ip ?? ''
    form.yingshiyunRegistrationStatus = data.section_cloud?.registration_status ?? ''
    form.yingshiyunVerificationCode = data.section_cloud?.captcha ?? ''

    // encoding_id
    const alarmList = Array.isArray(data.encoding_id?.alarm_input_list) ? data.encoding_id.alarm_input_list : []
    alarmEncodingTableData.value = alarmList.map((item: any, idx: number) => ({
      id: String(idx + 1),
      alarmInputNumber: String(idx + 1),
      alarmInputEncodingId: item.alarm_input_code_id ?? ''
    }))

    const videoList = Array.isArray(data.encoding_id?.video_channel_list) ? data.encoding_id.video_channel_list : []
    videoEncodingTableData.value = videoList.map((item: any, idx: number) => ({
      id: String(idx + 1),
      videoChannelNumber: String(idx + 1),
      videoChannelEncodingId: item.video_channel_code_id ?? ''
    }))
  }
}

const handleSave = async() => {
  const valid = await sipFormRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.error('请检查密码与密码确认')
    return
  }
  const section_list: string[] = []
  if (form.protocol28181) section_list.push('GB28181')
  if (form.protocolOnvif) section_list.push('ONVIF')
  if (form.protocolISUP) section_list.push('ISUP')
  if (form.protocolYingshiyun) section_list.push('VLStream Cloud')

  const params = {
    accessToken: store.userInfo?.accessToken,
    section_list,
    section_28181: {
      local_sip_port: form.localSipPort,
      transfer_protocol: form.transportProtocol,
      platform: activePlatform.value === 'platform2' ? 'platform_2' : 'platform_1'
    },
    section_sip: {
      enabled: !!form.enable,
      protocol_version: form.protocolVersion,
      sip_server_id: form.sipServerId,
      sip_server_domain: form.sipServerDomain,
      sip_server_addr: form.sipServerAddress,
      sip_client_port: form.sipServerPort,
      sip_user_name: form.sipUsername,
      sip_user_authentication_id: form.sipUserAuthId,
      password: form.password,
      password_confirmation: form.confirmPassword,
      period_of_registration: form.registrationValidity,
      registration_status: form.registrationStatus,
      heartbeat_cycle: form.heartbeatPeriod,
      maximum_heartbeat_timeouts: form.maxHeartbeatTimeout,
      codestream_index: form.stream28181Index
    },
    section_isup: {
      enabled: !!form.isupEnable,
      protocol_version: form.isupVersionProtocol,
      server_addr: form.isupServerAddress,
      port: form.isupPort,
      device_id: form.isupDeviceId,
      registration_status: form.isupRegistrationStatus
    },
    section_cloud: {
      enabled: !!form.yingshiyunEnable,
      access_server_ip: form.yingshiyunServerIp,
      registration_status: form.yingshiyunRegistrationStatus,
      captcha: form.yingshiyunVerificationCode
    },
    encoding_id: {
      alarm_input_list: alarmEncodingTableData.value.map((r: any) => ({
        alarm_input_code_id: r.alarmInputEncodingId
      })),
      video_channel_list: videoEncodingTableData.value.map((r: any) => ({
        video_channel_code_id: r.videoChannelEncodingId
      }))
    }
  }

  const res: any = await savePlatformAccess(params)
  if (res.code === 200) {
    ElMessage.success('保存成功')
    await fetchPlatformAccess()
  }
}

onMounted(() => {
  fetchPlatformAccess()
})
</script>

<style lang="scss" scoped>
.platformPage {
  padding-left: 20px;
  width: 100%;

  .sbForm {
    width: 480px;

    .el-input {
      height: 40px;
    }
  }
}

.topCheckboxes {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.sectionTitle {
  margin: 16px 0 24px;
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

.full-select {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 40px !important;
  }
}

.whitelist-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-edit-btn {
  background: var(--el-color-primary-hb);
  border: 1px solid var(--el-color-primary);
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  width: fit-content;

  span {
    font-size: 14px;
    color: var(--el-color-primary);
  }
}

.platform-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
}

.platform-tab {
  padding: 8px 16px;
  font-size: 14px;
  color: #999999;
  cursor: pointer;
  position: relative;
  border-bottom: 2px solid transparent;

  &.active {
    color: var(--el-color-primary);
    font-weight: 500;
    border-bottom-color: var(--el-color-primary);
  }
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;

  .el-input {
    flex: 1;
  }

  .unit {
    font-size: 14px;
    color: #666666;
    white-space: nowrap;
  }
}

.encoding-id-section {
  margin-top: 24px;
  margin-bottom: 24px;
}

.encoding-id-title {
  font-size: 16px;
  color: #333333;
  margin-bottom: 16px;
  font-weight: 500;
}

.encoding-id-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.encoding-btn {
  background: rgba(153, 153, 153, 0.1);
  border: none;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 14px;
  color: #999999;

  &.active {
    background: var(--el-color-primary-hb);
    color: var(--el-color-primary);
  }
}

.encoding-table {
  width: 880px;
}

.table-input {
  width: 100%;

  :deep(.el-input__wrapper) {
    height: 32px !important;
  }
}

.new_table {
  width: 880px;
  margin-top: 16px;
  margin-bottom: 24px;
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
