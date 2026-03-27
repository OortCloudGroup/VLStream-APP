export const messageRoute = [
  {
    path: '/home',
    menuShow: 'hidden',
    meta: { title: '预览' },
    component: () => import('../views/page/message/home.vue')
  },
  {
    path: '/system',
    meta: { title: '系统', icon: 'xt' },
    children: [
      {
        path: '/system',
        meta: { title: '系统设置' },
        component: () => import('../views/page/message/system/system.vue')
      },
      {
        path: '/upgrade',
        meta: { title: '系统维护' },
        component: () => import('../views/page/message/system/upgrade.vue')
      },
      {
        path: '/security',
        meta: { title: '安全管理' },
        component: () => import('../views/page/message/system/security.vue')
      },
      {
        path: '/user',
        meta: { title: '用户管理' },
        component: () => import('../views/page/message/system/user.vue')
      }]
  },
  {
    path: '/basic',
    meta: { title: '网络', icon: 'wl' },
    children: [
      {
        path: '/basic',
        meta: { title: '基本配置' },
        component: () => import('../views/page/message/network/basic.vue')
      },
      {
        path: '/advance',
        meta: { title: '高级配置' },
        component: () => import('../views/page/message/network/advance.vue')
      }]
  },
  {
    path: '/audio',
    meta: { title: '音视频', icon: 'ysp' },
    component: () => import('../views/page/message/audio/audio.vue')
  },
  {
    path: '/messRecord',
    meta: { title: '图像', icon: 'tx' },
    component: () => import('../views/page/message/image/image.vue')
  },
  {
    path: '/PTZ',
    meta: { title: 'PTZ', icon: 'PTZ' },
    component: () => import('../views/page/message/ptz/ptz.vue')
  },
  {
    path: '/events',
    meta: { title: '事件', icon: 'sj' },
    children: [
      {
        path: '/events',
        meta: { title: '普通事件' },
        component: () => import('../views/page/message/events/events.vue')
      },
      {
        path: '/smart',
        meta: { title: '决策式AI事件' },
        component: () => import('../views/page/message/events/smart.vue')
      }]
  },
  {
    path: '/plan',
    meta: { title: '存储', icon: 'cc' },
    children: [
      {
        path: '/plan',
        meta: { title: '计划配置' },
        component: () => import('../views/page/message/storage/plan.vue')
      },
      {
        path: '/storage',
        meta: { title: '存储管理' },
        component: () => import('../views/page/message/storage/storage.vue')
      }]
  }
]
