import request from '@/utils/request';
import { SupplierForm } from './types';
import { Pagination } from '@/api/types';

/**
 * @method:获取供应商列表
 */
export const supplierList = (query: Pagination) => {
  return request({
    url: '/manager/provider/list',
    method: 'get',
    params: query
  });
};

/**
 * @method:新增供应商
 * @param:form
 */
export const addSupplier = (form: SupplierForm) => {
  return request({
    url: '/manager/provider',
    method: 'post',
    data: form
  });
};

/**
 * @method:获取供应商详情
 * @param:id
 */
export const getSupplierDetail = (id: string) => {
  return request({
    url: `/manager/provider/${id}`,
    method: 'get'
  });
};

/**
 * @method:编辑供应商
 * @param:form
 */
export const updateSupplier = (form: SupplierForm) => {
  return request({
    url: '/manager/provider',
    method: 'put',
    data: form
  });
};

/**
 * @method:删除供应商
 * @param:ids
 */
export const handledelete = (ids: string) => {
  return request({
    url: `/manager/provider/${ids}`,
    method: 'delete'
  });
};
