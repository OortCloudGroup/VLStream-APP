/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:03:38
 * @Last Modified by: 兰舰
 * @Last Modified time: 2024-12-02 10:57:211
* @Copyright aPaaS-front-team. All rights reserved.
*/
export const errorRoutes = [
  {
    path: '/403',
    meta: { title: '没有权限', type: 1, showMenu: false },
    component: () => import('./errorPage/403.vue')
  },
  {
    path: '/404',
    meta: { title: '未找到页面', type: 1, showMenu: false },
    component: () => import('./errorPage/404.vue')
  },
  {
    path: '/:pathMatch(.*)',
    meta: { title: '未找到匹配页面', type: 1, showMenu: false },
    redirect: '/404'
  }
]
