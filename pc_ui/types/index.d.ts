// 切换栏type
interface activeNameL {
  label: string;
  number: number;
}

// 树形节点
interface Tree {
  id: number;
  label: string;
  children?: Tree[];
}

// 表格th
interface TableTh {
  prop: string;
  title: string;
  width?: any
}

// 表格tr
interface TableItem {
  id: number;
  image: string;
  name: string;
  telNumber: string;
  dept: string;
  createTime: string;
}

interface tableList {
  tableTh: TableTh[]
  tableTr: TableItem[]
  showHeader?: boolean
  align?: string
}

// 项目状态 1进行中 2已完成 3督办
interface statusList {
  label: string;
  value: number;
  image?: any;
  classN?: string;
}

// 项目管理表格嵌套
interface tableProjectManage {
  order: number
  name: string
  description: string
  begin_time: string
  end_time: string
  priority: number
  is_complete: number
  progress_track: string
  main_people: string
  created_at: string
  remark: string
  status?: string
  hasChildren?: boolean
  children?: tableProjectManage[]
}

interface UICONFIGITEM {
  login_logo_text: string,
  login_title: string,
  login_bottom: string,
  logo: string,
  logoWhite: string,
}

interface UICONFIG {
  [key: string]: UICONFIGITEM
}

interface formData {
  accessToken: string
  name: string
  priority: number
  taskmod: string
  begin_time: any
  stop_time: any
  content: string
  attachment: string
  agreed: boolean
  loop_type: number
  user_org:boxObjectItemTs[]
  user_circ:boxObjectItemTs[]
  user_co:boxObjectItemTs[]
  dept_co:boxObjectItemTs[]
  uuid?: string
  loop_run?: number
  loop_type: number
}

interface proCreFormTs{
  accessToken: string
  name: string
  priority: number
  begin_time:string
  end_time?:string
  parent_uuid?:string
  description?:string
  file_url?:string
  organizers:boxObjectItemTs[]
  circulators:boxObjectItemTs[]
  co_organizers:boxObjectItemTs[]
  units:boxObjectItemTs[]
  project_uuid?:boxObjectItemTs[]
  grade?:string
}

interface organizersTs {
  avatar_url: string,
  name: string,
  uuid: string
}

// 任务列表
interface taskListFnTs {
  name: string,
  priority: number,
  begin_time: string,
  stop_time: string,
  created_at?: string,
  expired_at?: string,
  content: string,
  main_people: string,
  task_childs: taskListFnTs[]
}

interface boxObjectItemTs {
  oort_name?: string
  oort_dname?: string
  oort_photo?: string
  avatar_url?: string
  name?: string
}

// 任务详情
interface boxObject {
  name?:string,
  taskmodname: string,
  casename: string, // 案件名称
  begin_time: string, // 开始时间
  stop_time: string, // 结束
  content: string, // 任务描述
  canReview: number, // 审核权限 0:无 1:有
  reviewInfo: string, // 审核意见
  attachment: string, // 附件地址
  agreed: string, // 是否需要领导同意开始进行此任务 1:需要 2:不需要
  loop_gap: string, // 循环间隔(只生效于按天循环) 0:不间隔 大于0:间隔多少天
  dept_co: boxObjectItemTs[], // 协助单位
  user_circ: boxObjectItemTs[], // 传阅人
  user_co: boxObjectItemTs[], // 协办人
  user_org: boxObjectItemTs[], // 主办人
  priority: number // 优先级 1:低 2:中 3:高
}

// 系统配置
interface dicContentBox {
  areaTitle: string
  placeholder: string
  areaTitle2: string
}
// 动态
interface commentList{
  id: number
  oort_name: string
  created_at: string
  content: string
  parent_dynamic_id: number
  replies: commentList[]
}
// 优先级
interface priorityList {
  id?:number
  name:string
  uuid?:string
}
interface formTs{
  startTime:string
  endTime:string
  keyword:string
  taskmod:string
  priority:number
  userType:number
  status:number
  loop:number
}
