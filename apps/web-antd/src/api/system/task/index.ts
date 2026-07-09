import type {
  DownloadTaskProgressVo,
  DownloadTaskQuery,
  DownloadTaskResultVo,
  DownloadTaskVo,
} from './model';
import type { ID, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  taskList = '/manager/device/task/list',
  taskExport = '/manager/device/task/export',
  root = '/manager/device/task',
}

/** 查询下载任务列表 */
export function downloadTaskList(params?: DownloadTaskQuery) {
  return alovaInstance.get<PageResult<DownloadTaskVo>>(Api.taskList, { params });
}

/** 导出下载任务列表 */
export function downloadTaskExport(data: Record<string, any>) {
  return commonExport(Api.taskExport, data);
}

/** 取消下载任务 */
export function cancelDownloadTask(ids: ID | ID[]) {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids;
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${idStr}`);
}

/** 查看配置文件下载进度 */
export function downloadTaskProgress(eid: ID) {
  return alovaInstance.get<DownloadTaskProgressVo>(
    `${Api.root}/${eid}/profileDownload`,
  );
}

/** 查看配置文件下载结果 */
export function downloadTaskResult(eid: ID) {
  return alovaInstance.get<DownloadTaskResultVo>(
    `${Api.root}/${eid}/profileDownload/result`,
  );
}

/** @deprecated 使用 downloadTaskList */
export const taskList = downloadTaskList;

/** @deprecated 使用 cancelDownloadTask */
export const cancelTask = cancelDownloadTask;

export type { DownloadTaskQuery as TaskQuery, DownloadTaskVo as TaskVO };
