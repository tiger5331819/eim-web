import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

/**
 * eIM 调整需求 P1 新增菜单
 * 后端 system_menu 入库后此文件可移除，菜单走动态路由
 */
const routes: RouteRecordRaw[] = [
  // ============ License 管理（租户管理一级菜单下） ============
  {
    name: 'LicenseGroup',
    path: '/license',
    component: BasicLayout,
    redirect: '/license/balance',
    meta: {
      title: 'License管理',
      icon: 'lucide:badge-dollar-sign',
      order: 21,
    },
    children: [
      {
        name: 'LicenseBalance',
        path: '/license/balance',
        component: () => import('#/views/license/index.vue'),
        meta: {
          title: '余额查询',
          icon: 'lucide:wallet',
          keepAlive: true,
        },
      },
      {
        name: 'LicenseRecord',
        path: '/license/record',
        component: () => import('#/views/license/license-record/index.vue'),
        meta: {
          title: '变更流水',
          icon: 'lucide:scroll-text',
          keepAlive: true,
        },
      },
      {
        name: 'LicenseFreeze',
        path: '/license/freeze',
        component: () => import('#/views/license/license-freeze/index.vue'),
        meta: {
          title: '冻结记录',
          icon: 'lucide:snowflake',
          keepAlive: true,
        },
      },
    ],
  },
];

export default routes;
