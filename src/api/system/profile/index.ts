import request from '@/utils/request';
import { query, AllocationForm } from './types';

/**
 * @method:获取profile资源列表
 * @param:query
 */
export const profileList = (query: query) => {
  return request({
    url: '/manager/profile/list',
    method: 'get',
    params: query
  });
};

/**
 * @method:同步数据
 */
export const handleSync = () => {
  return request({
    url: '/manager/profile/sync',
    method: 'post'
  });
};

/**
 * @method:查询所有批次
 */
export const allBatchList = () => {
  return request({
    url: '/manager/profile/productionBatch',
    method: 'get'
  });
};

/**
 * @method:查看当前批次允许分配数量
 * @param:productionBatch
 */
export const batchAllowableNumber = (productionBatch: string) => {
  return request({
    url: `/manager/profile/canBeAssignCount/${productionBatch}`,
    method: 'get'
  });
};

/**
 * @method:资源分配
 * @param:form
 */
export const handleAllocation = (form: AllocationForm) => {
  return request({
    url: '/manager/profile/assign',
    method: 'post',
    data: form
  });
};