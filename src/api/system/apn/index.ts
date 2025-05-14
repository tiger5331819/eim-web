import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ApnForm, ApnQuery, ApnVO } from '@/api/system/apn/types';

/**
 * 查询apn列表
 * @param query
 * @returns {*}
 */

export const listApn = (query?: ApnQuery): AxiosPromise<ApnVO[]> => {
  return request({
    url: '/manager/apn/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询apn详细
 * @param id
 */
export const getApn = (id: string | number): AxiosPromise<ApnVO> => {
  return request({
    url: '/manager/apn/' + id,
    method: 'get'
  });
};

/**
 * 新增apn
 * @param data
 */
export const addApn = (data: ApnForm) => {
  return request({
    url: '/manager/apn',
    method: 'post',
    data: data
  });
};

/**
 * 修改apn
 * @param data
 */
export const updateApn = (data: ApnForm) => {
  return request({
    url: '/manager/apn',
    method: 'put',
    data: data
  });
};

/**
 * 删除apn
 * @param id
 */
export const delApn = (id: string | number | Array<string | number>) => {
  return request({
    url: '/manager/apn/' + id,
    method: 'delete'
  });
};
