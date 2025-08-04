import request from '@/utils/request';
import { QueryFrom } from './types';

/**
 * @method:获取任务列表
 * @param:query
 */
export const taskList = (query: QueryFrom) => {
  return request({
    url: '/manager/device/task/list',
    method: 'get',
    params: query
  });
};

/**
 * @method:取消任务
 * @param:ids
 */
export const cancelTask = (ids: Array<string>) => {
  return request({
    url: `/manager/device/task/${ids}`,
    method: 'delete'
  });
};
