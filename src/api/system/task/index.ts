import request from '@/utils/request';
import { query } from './types';

/**
 * @method:获取任务列表
 * @param:query
 */
export const taskList = (query: query) => {
  return request({
    url: '',
    method: 'get',
    params: query
  });
};

/**
 * @method:导入记录下载
 * @param:id
 */
export const handleDownload = (id: string | number) => {
  return request({
    url: '',
    method: 'post',
    data: id
  });
};
