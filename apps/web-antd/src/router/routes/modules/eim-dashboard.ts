import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    // component: () => import('#/views/dashboard/eim/index.vue'),
     component: () => import('#/views/dashboard/dataBoard/index.vue'),
    meta: {
      icon: 'lucide:home',
      order: -1,
      title: '首页',
      affixTab: true,
    },
    name: 'EimDashboard',
    path: '/home',
  },
  // 兼容旧缓存：/analytics → /home
  {
    meta: { hideInMenu: true },
    name: 'AnalyticsRedirect',
    path: '/analytics',
    redirect: '/home',
  },
];

export default routes;
