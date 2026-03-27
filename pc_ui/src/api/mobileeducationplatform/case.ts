import { request } from '@/utils/service'
import config from '@/config'
import type { CaseRecordDTO, CaseListResponse } from '@/types/caseRecord'

// 定时任务接口
interface SysQuartzVo {
  current: number
  size: number
  className?: string
  quartzStatus?: string
}

interface SysQuartz {
  id: number
  className: string
  cronExpression: string
  param?: string
  descript?: string
  quartzStatus: string
  createTime?: string
  createUser?: string
}

interface QuartzPageResponse {
  records: SysQuartz[]
  total: number
  size: number
  current: number
}

/**
 * 通用请求函数
 * @param interfaceName 接口名称
 * @param data 请求数据
 * @param method 请求方法
 * @param customConfig 自定义配置
 * @returns Promise
 */
function commonFunc<T extends {}, K>(interfaceName: string, data: T, method: 'get' | 'post' | 'put' | 'delete' | 'patch') {
  let params = {}
  let postData = {}
  if (method === 'get' || method === 'delete') {
    params = data
  } else {
    postData = data
  }
  return request<K>({
    // url: '/api/'+ interfaceName,//前后端本地调用
    url: config.URL + config.gateWay + 'oortcloud-educationtalk/' + interfaceName, // 打包放开该注释
    method: method,
    data: postData,
    params: params
  })
}

// 新增-案例库
export function saveCaseRecord(data: any) {
  return commonFunc('caseRecord/saveCaseRecord', data, 'post')
}

/**
 * 通用请求函数  调用组织部门树
 * @param interfaceName 接口名称
 * @param data 请求数据
 * @param method 请求方法  'get' | 'post' | 'put' | 'delete' | 'patch'
 * @returns Promise
 */
function commonFuncD<T, K>(interfaceName: string, data: T, method = 'post') {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-sso' + interfaceName,
    method: method,
    data: data
  })
}

// 获取部门
export function deptList(data: any) {
  return commonFuncD('/sso/v1/deptlist', data)
}

/**
 * 通用请求函数   通用获取用户SSO
 * @param interfaceName 接口名称
 * @param data 请求数据
 * @param method 请求方法  'get' | 'post' | 'put' | 'delete' | 'patch'
 * @returns Promise
 */
function commonFuncUser<T, K>(interfaceName: string, data: T, method = 'post') {
  return request<K>({
    url: config.URL + config.gateWay + 'oortcloud-sso' + interfaceName,
    method: method,
    data: data
  })
}

// 获取部门用户树
export function getdeptuser(data: any) {
  return commonFuncUser('/sso/v1/getdeptuser', data)
}

/**
 * 根据罪犯编号，罪犯姓名查询罪犯列表
 * @param params 统计参数
 * @returns Promise
 */
export function getPrisonerList(params: any) {
  return commonFunc<any, any>('prisonerInfo/getPrisonerList', params, 'post')
}

/**
 * 获取案例类型列表
 * @param parentId 父级ID
 * @returns Promise
 */
export function getCaseTypes(parentId: string) {
  return commonFunc<{}, any>(`dictionary/children/${parentId}`, {}, 'get')
}

/**
 * 获取案例列表
 * @param params 查询参数
 * @returns Promise
 */
export function getCaseList(params: CaseRecordDTO) {
  return commonFunc<CaseRecordDTO, CaseListResponse>('caseRecord/getCaseRecordList', params, 'post')
}

/**
 * 根据ID获取案例详情
 * @param id 案例ID
 * @returns Promise
 */
export function getCaseById(id: string) {
  return commonFunc<{}, any>(`caseRecord/getById/${id}`, {}, 'get')
}

/**
 * 删除案例
 * @param id 案例ID
 * @returns Promise
 */
export function deleteCase(id: string) {
  return commonFunc<{ id: string }, any>('caseRecord/delete', { id }, 'delete')
}

/**
 * 获取本月应谈计划列表
 * @param params 查询参数
 * @returns Promise
 */
export function getMonthlyTalkPlans(params: any) {
  return commonFunc<any, any>('monthlyTalkTlan/getByCodeList', params, 'post')
}

/**
 * 开始谈话
 * @param params 谈话参数
 * @returns Promise
 */
export function startTalk(params: any) {
  return commonFunc<any, any>('memcon/addMemcon', params, 'post')
}

/**
 * 修改谈话记录
 * @param params
 * @returns Promise
 */
export function updateMemcon(params: any) {
  return commonFunc<any, any>('memcon/update', params, 'post')
}

/**
 * 获取谈话记录列表
 * @param params 查询参数
 * @returns Promise
 */
export function getMemconList(params: any): Promise<any> {
  return commonFunc<any, any>('memcon/getMemconList', params, 'post')
}

/**
 * 获取应谈 查看罪犯谈话记录
 * @param params 查询参数
 * @returns Promise
 */
export function getPrisonerNoMemconList(params: any): Promise<any> {
  return commonFunc<any, any>('memcon/getPrisonerNoMemconList', params, 'post')
}
/**
 * 已谈民警列表
 * @param params 查询参数
 * @returns Promise
 */
export function getPoliceConversationList(params: any) {
  return commonFunc<any, any>('memcon/getPoliceConversationList', params, 'post')
}

/**
 * 获取谈话记录详情
 * @param id 谈话记录ID
 * @returns Promise
 */
export function getMemconInfo(id: string) {
  return commonFunc<{}, any>(`memcon/info/${id}`, {}, 'get')
}

/**
 * 异常谈话记录结束校验
 * @param formData
 * @returns Promise
 */
export function abnormalConversation(params: any): Promise<any> {
  return commonFunc<any, any>('memcon/abnormalConversation', params, 'post')
}

/**
 * 结束谈话
 * @param formData 包含视频文件和谈话记录信息的表单数据
 * @returns Promise
 */
export function endMemcon(params: any): Promise<any> {
  return commonFunc<any, any>('memcon/enDMencon', params, 'post')
}

/**
 * 结束谈话上传视频
 * @param formData 视频文件表单数据
 * @returns Promise
 */
export function uploadTalkVideo(formData: FormData): Promise<any> {
  return commonFunc<FormData, any>('memcon/enDMenconUploadVideo', formData, 'post')
}

// /**
//  * 语音转文字
//  * @param formData 文件数据
//  * @returns Promise
//  */
// export function realTimeAudioRecognition(formData: FormData): Promise<any> {
//   return commonFunc<FormData, any>('ViceRecognitionModule/realTimeAudioRecognition', formData, 'post')
// }

/**
 * 新增谈话模版
 * @param dto 谈话模版数据
 * @returns Promise
 */
export function addTalkTemplate(dto: any): Promise<any> {
  return commonFunc<any, any>('prisonInterviewTemplate/add', dto, 'post')
}

/**
 * 修改谈话模版
 * @param dto 谈话模版数据
 * @returns Promise
 */
export function updateTalkTemplate(dto: any): Promise<any> {
  return commonFunc<any, any>('prisonInterviewTemplate/update', dto, 'post')
}

/**
 * 删除谈话模版
 * @param id 模版ID
 * @returns Promise
 */
export function deleteTalkTemplate(id: number): Promise<any> {
  return commonFunc<{}, any>(`prisonInterviewTemplate/delete/${id}`, {}, 'delete')
}

/**
 * 获取谈话模版详情
 * @param id 模版ID
 * @returns Promise
 */
export function getTalkTemplateById(id: number): Promise<any> {
  return commonFunc<{}, any>(`prisonInterviewTemplate/get/${id}`, {}, 'get')
}

/**
 * 分页查询谈话模版
 * @param dto 查询参数
 * @returns Promise
 */
export function pageTalkTemplates(dto: any): Promise<any> {
  return commonFunc<any, any>('prisonInterviewTemplate/page', dto, 'post')
}

/**
 * 获取本月应谈统计
 * @param params 统计参数
 * @returns Promise
 */
export function getMonthStatistics(params: any) {
  return commonFunc<any, any>('statisticsr/getMonthStatisticsr', params, 'post')
}

/**
 * 获取已谈民警统计
 * @param params 统计参数
 * @returns Promise
 */
export function getPoliceConversationStatistics(params: any) {
  return commonFunc<any, any>('statisticsr/getPoliceConversationStatistics', params, 'post')
}

/**
 * 实时记录谈话内容
 * @param params 谈话内容数据
 * @returns Promise
 */
export function updateConversation(params: any): Promise<any> {
  return commonFunc<any, any>('memcon/updateConversation', params, 'post')
}

/**
 * 本月个人谈话统计
 * @param params 谈话统计
 * @returns Promise
 */
export function PersonalConversations(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getThisMonthsStatisticsOfPersonalConversations', params, 'post')
}

/**
 * 谈话状态统计
 * @param params 谈话统计
 * @returns Promise
 */
export function StatusStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getConversationStatusStatistics', params, 'post')
}

/**
 * 谈话类别统计
 * @param params 谈话统计
 * @returns Promise
 */
export function TypeStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getConversationTypeStatistics', params, 'post')
}

/**
 * 本月监区谈话统计  本月监区谈话统计
 * @param params 谈话统计
 * @returns Promise
 */
export function ConversationStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getOrganizeConversationStatistics', params, 'post')
}

/**
 * 应谈话统计
 * @param params 谈话统计
 * @returns Promise
 */
export function ResponseStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getConversationResponseStatistics', params, 'post')
}

/**
 * 应谈话统计 查看详情
 * @param params 谈话统计
 * @returns Promise
 */
export function conversationResponseStatisticsList(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getConversationResponseStatisticsList', params, 'post')
}

/**
 * 已谈话统计
 * @param params 谈话统计
 * @returns Promise
 */
export function getConversationStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getConversationStatistics', params, 'post')
}

/**
 * 已谈话统计 查看详情
 * @param params 谈话统计
 * @returns Promise
 */
export function getConversationStatisticsList(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getConversationStatisticsList', params, 'post')
}

/**
 * 罪犯谈话覆盖率统计
 * @param params 谈话统计
 * @returns Promise
 */
export function FCriminalConversations(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getStatisticsOnTheCoverageRaTeoFCriminalConversations', params, 'post')
}

/**
 * 谈话及时率统计
 * @param params 谈话统计
 * @returns Promise
 */
export function getConversationResponseRateStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getConversationResponseRateStatistics', params, 'post')
}

/**
 * 重点犯谈话统计
 * @param params 谈话统计
 * @returns Promise
 */
export function PointsOfConversationStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getKeyPointsOfConversationStatistics', params, 'post')
}

/**
 * 重点犯谈话统计 查看详情
 * @param params 谈话统计
 * @returns Promise
 */
export function getKeyPointsOfConversationStatisticsList(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getKeyPointsOfConversationStatisticsList', params, 'post')
}

/**
 * 部门谈话统计
 * @param params 谈话统计
 * @returns Promise
 */
export function MentalConversationStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getDepartMentalConversationStatistics', params, 'post')
}

/**
 * 部门谈话统计  查看详情
 * @param params 谈话统计
 * @returns Promise
 */
export function getDepartMentalConversationStatisticsList(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getDepartMentalConversationStatisticsList', params, 'post')
}

/**
 * 创建定时任务
 * @param data 定时任务数据
 * @returns Promise
 */
export function createQuartz(data: any): Promise<any> {
  return commonFunc<any, any>('quartz/addQuartz', data, 'post')
}

/**
 * 更新定时任务
 * @param data 定时任务数据
 * @returns Promise
 */
export function updateQuartz(data: any): Promise<any> {
  return commonFunc<any, any>('quartz/updateQuartz', data, 'post')
}

/**
 * 删除定时任务
 * @param id 任务ID
 * @returns Promise
 */
export function deleteQuartz(id: number): Promise<any> {
  return commonFunc<{}, any>(`quartz/deleteQuartz/${id}`, {}, 'delete')
}

/**
 * 获取定时任务详情
 * @param id 任务ID
 * @returns Promise
 */
export function getQuartzById(id: number): Promise<any> {
  return commonFunc<{}, any>(`quartz/getQuartz/${id}`, {}, 'get')
}

/**
 * 分页查询定时任务
 * @param params 查询参数
 * @returns Promise
 */
export function getQuartzPage(params: SysQuartzVo): Promise<{ code: number; data: QuartzPageResponse; msg?: string }> {
  return commonFunc<SysQuartzVo, { code: number; data: QuartzPageResponse; msg?: string }>('quartz/getQuartzPage', params, 'post')
}

/**
 * 启动定时任务
 * @param id 任务ID
 * @returns Promise
 */
export function startQuartz(id: number): Promise<any> {
  return commonFunc<{}, any>(`quartz/start/${id}`, {}, 'post')
}

/**
 * 停止定时任务
 * @param id 任务ID
 * @returns Promise
 */
export function stopQuartz(id: number): Promise<any> {
  return commonFunc<{}, any>(`quartz/stop/${id}`, {}, 'post')
}

// 获取每月25号后未完成当月应谈次数
export function getNumberOfUnfinishedTasks(params: any): Promise<any> {
  return commonFunc<any, any>('statisticsr/getNumberOfUnfinishedTasks', params, 'post')
}

/**
 * 数据字典相关接口
 */

/**
 * 新增数据字典
 * @param data 字典数据，包含：
 *             - categoryName: string 类型名称
 *             - categoryType: string 类型编码
 *             - parentType: string 父级类型
 * @returns Promise 返回添加结果
 */
export function addDictionary(data: any) {
  return commonFunc<any, any>('dictionary/add', data, 'post')
}

/**
 * 更新数据字典
 * @param data 字典数据，包含：
 *             - id: number 字典ID
 *             - categoryName: string 类型名称
 *             - categoryType: string 类型编码
 *             - parentType: string 父级类型
 * @returns Promise 返回更新结果
 */
export function updateDictionary(data: any) {
  return commonFunc<any, any>('dictionary/update', data, 'post')
}

/**
 * 删除数据字典
 * @param id 字典ID
 * @returns Promise 返回删除结果
 */
export function deleteDictionary(id: number) {
  return commonFunc<{}, any>(`dictionary/delete/${id}`, {}, 'delete')
}

/**
 * 根据ID获取数据字典详情
 * @param id 字典ID
 * @returns Promise 返回字典详情
 */
export function getDictionaryById(id: number) {
  return commonFunc<{}, any>(`dictionary/get/${id}`, {}, 'get')
}

/**
 * 分页查询数据字典列表
 * @param params 查询参数，包含：
 *               - current: number 当前页码
 *               - size: number 每页大小
 *               - categoryName?: string 类型名称(可选)
 *               - categoryType?: string 类型编码(可选)
 * @returns Promise 返回分页数据
 */
export function getDictionaryPage(params: any) {
  return commonFunc<any, any>('dictionary/page', params, 'post')
}

/**
 * 获取父级数据字典列表
 * @returns Promise 返回父级字典列表
 */
export function getParentDictionaries() {
  return commonFunc<{}, any>('dictionary/getByParentId', {}, 'get')
}

/**
 * 获取该组织部门下，子一级CODE集合不包含部门本身 同步罪犯信息用到
 * @param deptCode 部门编码
 * @returns Promise 返回部门列表
 */
export function getPrisonList(deptCode: string) {
  return commonFunc<{}, any>(`dictionary/getByDeptCodeSubLevelList/${deptCode}`, {}, 'get')
}

/**
 * 同步单个罪犯信息
 * @param params 同步参数
 * @returns Promise
 */
export function syncPrisonerInfo(params: any) {
  return commonFunc<any, any>('prisonerInfo/getSyncingCriminalOffenderInformation', params, 'post')
}

/**
 * 统计报表相关接口
 */

/**
 * 导出组织结构谈话统计
 * @param params 导出参数
 * @returns Promise
 */
export function exportDepartmentStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('report/exportDepartmentStatistics', params, 'post')
}

/**
 * 导出民警谈话完成率统计
 * @param params 导出参数
 * @returns Promise
 */
export function exportPoliceCompletionRateStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('report/exportPoliceCompletionRateStatistics', params, 'post')
}

/**
 * 导出民警个人谈话统计
 * @param params 导出参数
 * @returns Promise
 */
export function exportPolicePersonalStatisticsByDepartment(params: any): Promise<any> {
  return commonFunc<any, any>('report/exportPolicePersonalStatisticsByDepartment', params, 'post')
}

/**
 * 导出罪犯谈话覆盖率统计
 * @param params 导出参数
 * @returns Promise
 */
export function exportPrisonerCoverageStatisticsByDepartment(params: any): Promise<any> {
  return commonFunc<any, any>('report/exportPrisonerCoverageStatisticsByDepartment', params, 'post')
}

/**
 * 导出罪犯谈话时长统计
 * @param params 导出参数
 * @returns Promise
 */
export function exportPrisonerDurationStatisticsByDepartment(params: any): Promise<any> {
  return commonFunc<any, any>('report/exportPrisonerDurationStatisticsByDepartment', params, 'post')
}

/**
 * 导出罪犯谈话次数统计
 * @param params 导出参数
 * @returns Promise
 */
export function exportPrisonerTalkCountStatisticsByDepartment(params: any): Promise<any> {
  return commonFunc<any, any>('report/exportPrisonerTalkCountStatisticsByDepartment', params, 'post')
}

/**
 * 导出谈话类型统计
 * @param params 导出参数
 * @returns Promise
 */
export function exportTalkTypeStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('report/exportTalkTypeStatistics', params, 'post')
}

/**
 * 获取组织结构谈话统计
 * @param params 查询参数
 * @returns Promise
 */
export function getDepartmentStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('report/getDepartmentStatistics', params, 'post')
}

/**
 * 获取民警谈话完成率统计
 * @param params 查询参数
 * @returns Promise
 */
export function getPoliceCompletionRateStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('report/getPoliceCompletionRateStatistics', params, 'post')
}

/**
 * 获取民警个人谈话统计
 * @param params 查询参数
 * @returns Promise
 */
export function getPolicePersonalStatisticsByDepartment(params: any): Promise<any> {
  return commonFunc<any, any>('report/getPolicePersonalStatisticsByDepartment', params, 'post')
}

/**
 * 获取罪犯谈话覆盖率统计
 * @param params 查询参数
 * @returns Promise
 */
export function getPrisonerCoverageStatisticsByDepartment(params: any): Promise<any> {
  return commonFunc<any, any>('report/getPrisonerCoverageStatisticsByDepartment', params, 'post')
}

/**
 * 获取罪犯谈话时长统计
 * @param params 查询参数
 * @returns Promise
 */
export function getPrisonerDurationStatisticsByDepartment(params: any): Promise<any> {
  return commonFunc<any, any>('report/getPrisonerDurationStatisticsByDepartment', params, 'post')
}

/**
 * 获取罪犯谈话次数统计
 * @param params 查询参数
 * @returns Promise
 */
export function getPrisonerTalkCountStatisticsByDepartment(params: any): Promise<any> {
  return commonFunc<any, any>('report/getPrisonerTalkCountStatisticsByDepartment', params, 'post')
}

/**
 * 获取谈话类型统计
 * @param params 查询参数
 * @returns Promise
 */
export function getTalkTypeStatistics(params: any): Promise<any> {
  return commonFunc<any, any>('report/getTalkTypeStatistics', params, 'post')
}

// 文件管理相关的API
// 文件列表
export function getFileList(params: any): Promise<any> {
  return commonFunc<any, any>('conversation-file-manager/list', params, 'get')
}

// 导入文件
export function saveFile(params: any): Promise<any> {
  return commonFunc<any, any>('conversation-file-manager/save', params, 'post')
}

// 删除文件 （逻辑删除）
export function removeFile(params: any): Promise<any> {
  return commonFunc<any, any>('conversation-file-manager/remove', params, 'get')
}

// 我的收藏
export function myFavoriteList(params: any): Promise<any> {
  return commonFunc<any, any>('conversation-file-favorite/page', params, 'get')
}

// 收藏
export function myFavoriteSave(params: any): Promise<any> {
  return commonFunc<any, any>('conversation-file-favorite/save', params, 'post')
}

// 取消收藏
export function myFavoriteRemove(params: any): Promise<any> {
  return commonFunc<any, any>('conversation-file-favorite/remove', params, 'get')
}

// 罪犯基本信息模块-add
export function prisonerInfoSave(params: any): Promise<any> {
  return commonFunc<any, any>('prisonerInfo/save', params, 'post')
}

// 罪犯基本信息模块-del
export function prisonerInfoRemove(params: any): Promise<any> {
  return commonFunc<any, any>('prisonerInfo/remove', params, 'post')
}

// 罪犯基本信息模块-del
export function prisonerInfoUpdate(params: any): Promise<any> {
  return commonFunc<any, any>('prisonerInfo/update', params, 'post')
}

// 罪犯基本信息模块-list
export function prisonerInfoList(params: any): Promise<any> {
  return commonFunc<any, any>('prisonerInfo/list', params, 'get')
}
