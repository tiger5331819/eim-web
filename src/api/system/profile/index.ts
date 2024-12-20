import request from '@/utils/request';
import { query, AllocationForm } from './types';

/**
 * @method:获取profile资源列表
 * @param:query
 */
export const profileList = (query: query) => {
  return request({
    url: '',
    method: 'get',
    params: query
  });
};

/**
 * @method:同步数据
 */
export const handleSync = () => {
  return request({
    url: '',
    method: 'get'
  });
};

/**
 * @method:资源分配
 * @param:form
 */
export const handleAllocation = (form: AllocationForm) => {
  return request({
    url: '',
    method: 'post',
    data: form
  });
};

/**
 * @method:批量导入上传
 * @param:data
 */
export const handleUpload = (data: FormData) => {
  return request({
    url: '',
    method: 'post',
    data: data
  });
};

/**
 * @method:导出失败记录
 */
export const handleDownload = () => {
  return request({
    url: '',
    method: 'get'
  });
};
