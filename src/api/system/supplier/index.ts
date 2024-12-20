import request from '@/utils/request';
import { SupplierForm } from './types';

/**
 * @method:获取供应商列表
 */
export const supplierList = () => {
  return request({
    url: '',
    method: 'get'
  });
};

/**
 * @method:新增供应商
 * @param:form
 */
export const addSupplier = (form: SupplierForm) => {
  return request({
    url: '',
    method: 'post',
    data: form
  });
};

/**
 * @method:获取供应商详情
 * @param:id
 */
export const getSupplierDetail = (id: string | number) => {
  return request({
    url: '',
    method: 'post',
    data: id
  });
};

/**
 * @method:编辑供应商
 * @param:form
 */
export const updateSupplier = (form: SupplierForm) => {
  return request({
    url: '',
    method: 'post',
    data: form
  });
};

/**
 * @method:删除供应商
 * @param:id
 */
export const handledelete = (id: string | number) => {
  return request({
    url: '',
    // url: `/manager/device/${id}/profile/${iccid}`,
    method: 'delete'
  });
};
