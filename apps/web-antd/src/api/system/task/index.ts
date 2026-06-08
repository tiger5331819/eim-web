import type { TaskQuery, TaskVO } from './model';
import type { PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  taskList = '/manager/device/task/list',
  root = '/manager/device/task',
}

export function taskList(params?: TaskQuery) {
  return alovaInstance.get<PageResult<TaskVO>>(Api.taskList, { params });
}

export function cancelTask(ids: (string | number)[]) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${ids}`);
}
