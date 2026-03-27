import { request } from '@/utils/service'
import config from '@/config'

type HttpMethod = 'get' | 'post' | 'put' | 'delete'
type ResponseType = 'json' | 'blob' | 'arraybuffer'

function buildParams(method: HttpMethod, data: any, forceParams?: boolean) {
  const useParams = forceParams || method === 'get' || method === 'delete'
  return useParams ? { params: data } : { data }
}

function commonFunc<T, K>(
  interfaceName: string,
  data: T,
  method: HttpMethod,
  forceParams = false,
  responseType?: ResponseType
) {
  return request<K>({
    url: config.URL + config.gateWay + '/' + interfaceName,
    method,
    ...buildParams(method, data, forceParams),
    ...(responseType ? { responseType } : {})
  })
}

function commonFormFunc<T, K>(interfaceName: string, data: T, method: HttpMethod) {
  return request<K>({
    url: config.URL + config.gateWay + '/' + interfaceName,
    method,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// Auth
export function login(data: any) {
  return commonFunc('login', data, 'post')
}

export function logout(data: any) {
  return commonFunc('logout', data, 'post')
}

// System - basic info
export function getBasicInfo(params?: any) {
  return commonFunc('get_basic_info', params || {}, 'get')
}

export function saveBasicInfo(data: any) {
  return commonFunc('save_basic_info', data, 'post')
}

// System - time config
export function setTimeConfig(data: any) {
  return commonFunc('set_time_config', data, 'post')
}

export function getTimeConfig(params?: any) {
  return commonFunc('get_time_config', params || {}, 'get')
}

export function saveTimeConfig(data: any) {
  return commonFunc('save_time_config', data, 'post')
}

// System - daylight
export function getDaylight(params?: any) {
  return commonFunc('get_daylight', params || {}, 'get')
}

export function saveDaylight(data: any) {
  return commonFunc('save_daylight', data, 'post')
}

// System - RS-485
export function getRs485(params?: any) {
  return commonFunc('get_rs_485', params || {}, 'get')
}

export function saveRs485(data: any) {
  return commonFunc('save_rs_485', data, 'post')
}

// 重启设备
export function rebootDevice(data: any) {
  return commonFunc('reboot_device', data, 'post')
}

// 重启设备
export function fullyRecovery(data: any) {
  return commonFunc('fully_recovery', data, 'post')
}

// 固件升级
export function firmwareUpgrade(data: any) {
  return commonFunc('firmware_upgrade', data, 'post')
}

// System - maintenance
export function upgradeMaintain(data: any) {
  return commonFunc('upgrade_maintain', data, 'post')
}

export function exportParams(params?: any) {
  return commonFunc('export_params', params || {}, 'get')
}

export function importParams(data: FormData) {
  return commonFormFunc('import_params', data, 'post')
}

export function uploadFile(data: FormData) {
  return commonFormFunc('upload_file', data, 'post')
}

export function exportLogCsv(params?: any) {
  return commonFunc('export_log_csv', params || {}, 'get')
}

export function getLog(params?: any) {
  return commonFunc('get_log', params || {}, 'get')
}

export function getSystemService(params?: any) {
  return commonFunc('get_system_service', params || {}, 'get')
}

export function saveSystemService(data: any) {
  return commonFunc('save_system_service', data, 'post')
}

export function setSecurityLog(data: any) {
  return commonFunc('set_security_log', data, 'post')
}

// 获取审计安全
export function getSecurityLog(params?: any) {
  return commonFunc('get_security_log', params || {}, 'get')
}

// 保存审计安全
export function saveSecurityLog(data: any) {
  return commonFunc('save_security_log', data, 'post')
}

// 创建证书
export function createCertificateRequest(data: any) {
  return commonFunc('create_certificate_request', data, 'post')
}

// 下载证书
export function downloadCertificateRequest(params?: any) {
  return commonFunc('download_certificate_request', params || {}, 'get')
}

// 删除证书
export function deleteCertificateRequest(data: any) {
  return commonFunc('delete_certificate_request', data, 'post')
}

// 安装CA证书
export function installCaCertificate(data: any) {
  return commonFunc('install_ca_certificate', data, 'post')
}

// 安装证书
export function installGeneratedCertificate(data: any) {
  return commonFunc('install_generated_certificate', data, 'post')
}

// 获取认证方式
export function getAuthentication(params?: any) {
  return commonFunc('get_authentication', params || {}, 'get')
}

// 保存认证方式
export function saveAuthentication(data: any) {
  return commonFunc('save_authentication', data, 'post')
}

// 获取ip地址过滤
export function getIpFilter(params?: any) {
  return commonFunc('get_ip_filter', params || {}, 'get')
}

// 保存ip地址过滤
export function saveIpFilter(data: any) {
  return commonFunc('save_ip_filter', data, 'post')
}

// 获取安全服务
export function getSafeServices(params?: any) {
  return commonFunc('get_safe_services', params || {}, 'get')
}

// 保存安全服务
export function saveSafeServices(data: any) {
  return commonFunc('save_safe_services', data, 'post')
}

// 获取高级安全
export function getAdvancedSafe(params?: any) {
  return commonFunc('get_advanced_safe', params || {}, 'get')
}

// 保存高级安全
export function saveAdvancedSafe(data: any) {
  return commonFunc('save_advanced_safe', data, 'post')
}

// 获取用户管理
export function getUserManage(params?: any) {
  return commonFunc('get_user_manage', params || {}, 'get')
}

// 保存用户管理
export function saveUserManage(data: any) {
  return commonFunc('save_user_manage', data, 'post')
}

export function addUser(data: any) {
  return commonFunc('add_user', data, 'post')
}

export function editUser(data: any) {
  return commonFunc('edit_user', data, 'post')
}

export function deleteUser(data: any) {
  return commonFunc('delete_user', data, 'post')
}

export function setGeneralParam(data: any) {
  return commonFunc('set_general_param', data, 'post')
}

export function setAccountSafe(data: any) {
  return commonFunc('set_account_safe', data, 'post')
}

export function getOnlineUser(params?: any) {
  return commonFunc('get_online_user', params || {}, 'get')
}

// Network - basic config
export function setTcpIp(data: any) {
  return commonFunc('set_tcp_ip', data, 'post')
}

// 获取tcp/ip
export function getTcpIp(params?: any) {
  return commonFunc('get_tcp_ip', params || {}, 'get')
}

// 保存tcp/ip
export function saveTcpIp(data: any) {
  return commonFunc('save_tcp_ip', data, 'post')
}

// 获取DDNS
export function getDdns(params?: any) {
  return commonFunc('get_ddns', params || {}, 'get')
}

// 保存DDNS
export function saveDdns(data: any) {
  return commonFunc('save_ddns', data, 'post')
}

// 获取PPPOE
export function getPppoe(params?: any) {
  return commonFunc('get_pppoe', params || {}, 'get')
}

// 保存PPPOE
export function savePppoe(data: any) {
  return commonFunc('save_pppoe', data, 'post')
}

// 获取端口配置
export function getPort(params?: any) {
  return commonFunc('get_port', params || {}, 'get')
}

// 保存端口配置
export function savePort(data: any) {
  return commonFunc('save_port', data, 'post')
}

// 获取端口映射
export function getPortMap(params?: any) {
  return commonFunc('get_port_map', params || {}, 'get')
}

// 保存端口映射
export function savePortMap(data: any) {
  return commonFunc('save_port_map', data, 'post')
}

// 获取多播配置
export function getMulticast(params?: any) {
  return commonFunc('get_multicast', params || {}, 'get')
}

// 保存多播配置
export function saveMulticast(data: any) {
  return commonFunc('save_multicast', data, 'post')
}

// 获取SNMP
export function getSnmp(params?: any) {
  return commonFunc('get_snmp', params || {}, 'get')
}

// 保存SNMP
export function saveSnmp(data: any) {
  return commonFunc('save_snmp', data, 'post')
}

export function setFtp(data: any) {
  return commonFunc('set_ftp', data, 'post')
}

// 获取FTP
export function getFtp(params?: any) {
  return commonFunc('get_ftp', params || {}, 'get')
}

// 保存FTP
export function saveFtp(data: any) {
  return commonFunc('save_ftp', data, 'post')
}

// 获取Email
export function getEmail(params?: any) {
  return commonFunc('get_email', params || {}, 'get')
}

// 保存Email
export function saveEmail(data: any) {
  return commonFunc('save_email', data, 'post')
}

export function setHttps(data: any) {
  return commonFunc('set_https', data, 'post')
}

export function setPlatformAccess(data: any) {
  return commonFunc('set_platform_access', data, 'post')
}

// 获取平台接入
export function getPlatformAccess(params?: any) {
  return commonFunc('get_platform_access', params || {}, 'get')
}

// 保存平台接入
export function savePlatformAccess(data: any) {
  return commonFunc('save_platform_access', data, 'post')
}

// 获取https
export function getHttps(params?: any) {
  return commonFunc('get_https', params || {}, 'get')
}

// 保存https
export function saveHttps(data: any) {
  return commonFunc('save_https', data, 'post')
}

// 导出自签名证书
export function exportSelfSignedCertificate(params?: any) {
  return commonFunc('export_self_signed_certificate', params || {}, 'get', false, 'blob')
}

// 获取QoS
export function getQos(params?: any) {
  return commonFunc('get_QoS', params || {}, 'get')
}

// 保存QoS
export function saveQos(data: any) {
  return commonFunc('save_QoS', data, 'post')
}

// 获取802.1x
export function get8021x(params?: any) {
  return commonFunc('get_8021x', params || {}, 'get')
}

// 保存802.1x
export function save8021x(data: any) {
  return commonFunc('save_8021x', data, 'post')
}

// 获取集成协议
export function getIntegratedProtocol(params?: any) {
  return commonFunc('get_integrated_protocol', params || {}, 'get')
}

// 保存集成协议
export function saveIntegratedProtocol(data: any) {
  return commonFunc('save_integrated_protocol', data, 'post')
}

// 获取网络服务
export function getNetworkService(params?: any) {
  return commonFunc('get_network_service', params || {}, 'get')
}

// 保存网络服务
export function saveNetworkService(data: any) {
  return commonFunc('save_network_service', data, 'post')
}

export function setHttpListen(data: any) {
  return commonFunc('set_http_listen', data, 'post')
}

// 获取HTTP监听
export function getHttpListen(params?: any) {
  return commonFunc('get_http_listen', params || {}, 'get')
}

// 保存HTTP监听
export function saveHttpListen(data: any) {
  return commonFunc('save_http_listen', data, 'post')
}

// 获取视频
export function getVideo(params?: any) {
  return commonFunc('get_video', params || {}, 'get')
}

// 保存视频
export function saveVideo(data: any) {
  return commonFunc('save_video', data, 'post')
}

// 获取音频
export function getAudio(params?: any) {
  return commonFunc('get_audio', params || {}, 'get')
}

// 保存音频
export function saveAudio(data: any) {
  return commonFunc('save_audio', data, 'post')
}

export function setRoi(data: any) {
  return commonFunc('set_roi', data, 'post')
}

// 获取roi
export function getRoi(params?: any) {
  return commonFunc('get_roi', params || {}, 'get')
}

// 保存roi
export function saveRoi(data: any) {
  return commonFunc('save_roi', data, 'post')
}

// 获取码流信息叠加
export function getCodeStreamInformationSuperposition(params?: any) {
  return commonFunc('get_code_stream_information_superposition', params || {}, 'get')
}

// 保存码流信息叠加
export function saveCodeStreamInformationSuperposition(data: any) {
  return commonFunc('save_code_stream_information_superposition', data, 'post')
}

// Image
export function setDisplaySettings(data: any) {
  return commonFunc('set_display_settings', data, 'post')
}

// 获取显示设置
export function getDisplaySettings(params?: any) {
  return commonFunc('get_display_settings', params || {}, 'get')
}

// 保存显示设置
export function saveDisplaySettings(data: any) {
  return commonFunc('save_display_settings', data, 'post')
}

// 获取osd
export function getOsd(params?: any) {
  return commonFunc('get_osd', params || {}, 'get')
}

// 保存osd
export function saveOsd(data: any) {
  return commonFunc('save_osd', data, 'post')
}

// 获取图像参数切换
export function getImageParameterSwitch(params?: any) {
  return commonFunc('get_image_parameter_switch', params || {}, 'get')
}

// 保存图像参数切换
export function saveImageParameterSwitch(data: any) {
  return commonFunc('save_image_parameter_switch', data, 'post')
}

// PTZ
export function setLimit(data: any) {
  return commonFunc('set_limit', data, 'post')
}

// 获取限位
export function getLimit(params?: any) {
  return commonFunc('get_limit', params || {}, 'get')
}

// 保存限位
export function saveLimit(data: any) {
  return commonFunc('save_limit', data, 'post')
}

// 限位操作
export function limitOperation(data: any) {
  return commonFunc('limit_operation', data, 'post')
}

export function setZeroAngle(params?: any) {
  return commonFunc('set_zero_angle', params || {}, 'get')
}

// 获取隐私遮蔽
export function getPrivacyMask(params?: any) {
  return commonFunc('get_privacy_mask', params || {}, 'get')
}

// 保存隐私遮
export function savePrivacyMask(data: any) {
  return commonFunc('save_privacy_mask', data, 'post')
}

// 获取配置清除
export function getConfigureCleanup(params?: any) {
  return commonFunc('get_configure_cleanup', params || {}, 'get')
}

// 保存配置清除
export function saveConfigureCleanup(data: any) {
  return commonFunc('save_configure_cleanup', data, 'post')
}

// 获取定时任务
export function getScheduledTask(params?: any) {
  return commonFunc('get_scheduled_task', params || {}, 'get')
}

// 保存定时任务
export function saveScheduledTask(data: any) {
  return commonFunc('save_scheduled_task', data, 'post')
}

// 获取云台优先
export function getPtzPriority(params?: any) {
  return commonFunc('get_ptz_priority', params || {}, 'get')
}

// 保存云台优先
export function savePtzPriority(data: any) {
  return commonFunc('save_ptz_priority', data, 'post')
}

// Events - normal
export function setMotionDetection(data: any) {
  return commonFunc('set_motion_detection', data, 'post')
}

// 获取移动侦测
export function getMotionDetection(params?: any) {
  return commonFunc('get_motion_detection', params || {}, 'get')
}

// 保存移动侦测
export function saveMotionDetection(data: any) {
  return commonFunc('save_motion_detection', data, 'post')
}

export function setOcclusionAlarm(data: any) {
  return commonFunc('set_occlusion_alarm', data, 'post')
}

// 获取遮挡报警
export function getOcclusionAlarm(params?: any) {
  return commonFunc('get_occlusion_alarm', params || {}, 'get')
}

// 保存遮挡报警
export function saveOcclusionAlarm(data: any) {
  return commonFunc('save_occlusion_alarm', data, 'post')
}

export function setAlarmInput(data: any) {
  return commonFunc('set_alarm_input', data, 'post')
}

// 获取报警输入
export function getAlarmInput(params?: any) {
  return commonFunc('get_alarm_input', params || {}, 'get')
}

// 保存报警输入
export function saveAlarmInput(data: any) {
  return commonFunc('save_alarm_input', data, 'post')
}

export function setAlarmOutput(data: any) {
  return commonFunc('set_alarm_output', data, 'post')
}

// 获取报警输出
export function getAlarmOutput(params?: any) {
  return commonFunc('get_alarm_output', params || {}, 'get')
}

// 保存报警输出
export function saveAlarmOutput(data: any) {
  return commonFunc('save_alarm_output', data, 'post')
}

// 获取异常
export function getException(params?: any) {
  return commonFunc('get_exception', params || {}, 'get')
}

// 保存异常
export function saveException(data: any) {
  return commonFunc('save_exception', data, 'post')
}

// 获取ptz基本信息
export function getPtzBasic(params?: any) {
  return commonFunc('get_ptz_basic', params || {}, 'get')
}

// 保存ptz基本信息
export function savePtzBasic(data: any) {
  return commonFunc('save_ptz_basic', data, 'post')
}

// ptz操作
export function ptzOperation(data: any) {
  return commonFunc('ptz_operation', data, 'post')
}

// 获取零方位角
export function getZeroAngle(params?: any) {
  return commonFunc('get_zero_angle', params || {}, 'get')
}

// 保存零方位角
export function saveZeroAngle(data: any) {
  return commonFunc('save_zero_angle', data, 'post')
}

// 零方位角操作
export function zeroAngleOperation(data: any) {
  return commonFunc('zero_angle_operation', data, 'post')
}

// 获取守望
export function getWatch(params?: any) {
  return commonFunc('get_watch', params || {}, 'get')
}

// 保存守望
export function saveWatch(data: any) {
  return commonFunc('save_watch', data, 'post')
}

// 守望操作
export function watchOperation(data: any) {
  return commonFunc('watch_operation', data, 'post')
}

// Events - smart
export function setAudioAnomalyDetection(data: any) {
  return commonFunc('set_audio_anomaly_detection', data, 'post')
}

export function getAudioAnomalyDetection(params?: any) {
  return commonFunc('get_audio_anomaly_detection', params || {}, 'get')
}

export function saveAudioAnomalyDetection(data: any) {
  return commonFunc('save_audio_anomaly_detection', data, 'post')
}

// Storage
export function setCapture(data: any) {
  return commonFunc('set_capture', data, 'post')
}

// 获取抓图计划
export function getCapture(params?: any) {
  return commonFunc('get_capture', params || {}, 'get')
}

// 保存抓图计划
export function saveCapture(data: any) {
  return commonFunc('save_capture', data, 'post')
}

// 获取关于设备
export function getAboutDevice(params?: any) {
  return commonFunc('get_about_device', params || {}, 'get')
}

// 保存关于设备
export function saveAboutDevice(data: any) {
  return commonFunc('save_about_device', data, 'post')
}

// 获取ai事件
export function getAiWventConfig(params?: any) {
  return commonFunc('get_ai_event_config', params || {}, 'get')
}

// 保存ai事件
export function saveAiEventConfig(data: any) {
  return commonFunc('save_ai_event_config', data, 'post')
}

// 获取录像计划
export function getRecordingPlan(params?: any) {
  return commonFunc('get_recording_plan', params || {}, 'get')
}

// 保存录像计划
export function saveRecordingPlan(data: any) {
  return commonFunc('save_recording_plan', data, 'post')
}

// 获取硬盘管理
export function getStorageManage(params?: any) {
  return commonFunc('get_storage_manage', params || {}, 'get')
}

// 保存硬盘管理
export function saveStorageManage(data: any) {
  return commonFunc('save_storage_manage', data, 'post')
}

// 获取网络硬盘
export function getNetStorageManage(params?: any) {
  return commonFunc('get_net_storage_manage', params || {}, 'get')
}

// 保存网络硬盘
export function saveNetStorageManage(data: any) {
  return commonFunc('save_net_storage_manage', data, 'post')
}

// 开始录屏
export function startMediaRecord(data: any) {
  return commonFunc('api/media/record/start', data, 'post')
}

// 停止录屏
export function stopMediaRecord(data: any) {
  return commonFunc('api/media/record/stop', data, 'post')
}

// 抓图
export function snapshotMedia(data: any) {
  return commonFunc('api/media/snapshot', data, 'post')
}

// 下载文件
export function fileMedia(params?: any) {
  return commonFunc('api/media/file', params || {}, 'get', true, 'blob')
}
