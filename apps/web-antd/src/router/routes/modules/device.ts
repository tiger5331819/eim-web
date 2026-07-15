import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'DeviceDetail',
    path: '/system/device/detail',
    component: () => import('#/views/system/device/detail/index.vue'),
    meta: {
      hideInMenu: true,
      title: '设备详情',
      activePath: '/system/device',
    },
  },
  {
    name: 'DeviceDownload',
    path: '/system/device/download',
    component: () => import('#/views/system/device/download/index.vue'),
    meta: {
      hideInMenu: true,
      title: '批量下载资源',
      activePath: '/system/device',
    },
  },
];

export default routes;
