import request from '@/utils/request';
import { QueryFrom, AllocationForm } from './types';

/**
 * @method:获取卡信息记录列表
 * @param:query
 */
export const cardImportList = (query: QueryFrom) => {
  return request({
    url: '/manager/seed/list',
    method: 'get',
    params: query
  });
};

/**
 * @method:获取运营商列表
 */
export const providerList = () => {
  return request({
    url: '/manager/provider/list',
    method: 'get'
  });
};

/**
 * @method:获取归属企业列表
 */
export const companyList = () => {
  return request({
    url: '/manager/company/all',
    method: 'get'
  });
};

/**
 * @method:获取归属项目列表（归属企业为前置条件）
 * @param:companyId
 */
export const projectList = (companyId: string) => {
  return request({
    url: `/manager/company/${companyId}/project/all`,
    method: 'get'
  });
};

/**
 * @method:查询所有批次
 */
export const allBatchList = () => {
  return request({
    url: '/manager/seed/batch/all',
    method: 'get'
  });
};

/**
 * @method:查看当前批次允许分配数量
 * @param:productionBatch
 */
export const batchAllowableNumber = (productionBatch: string) => {
  return request({
    url: `/manager/seed/batch/${productionBatch}/inventory`,
    method: 'get'
  });
};

/**
 * @method:卡数分配
 * @param:productionBatch,form
 */
export const handleAllocation = (productionBatch: string, form: AllocationForm) => {
  return request({
    url: `/manager/seed/batch/${productionBatch}`,
    method: 'post',
    data: form
  });
};

/**
 * @method:下载导出失败记录
 * @param:errorToken
 */
export const downloadFailRecord = (errorToken: string) => {
  return request({
    url: `/manager/seed/importError/${errorToken}`,
    method: 'post'
  });
};

//查看制卡商
export const cardProviderList = () => {
  return request({
    url: '/manager/seed/cardProviderName',
    method: 'get'
  });
};
