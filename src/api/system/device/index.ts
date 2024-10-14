import request from '@/utils/request';

/**
 * 卡信息记录查询
 * @param query
 * @returns {*}
 */

export const cardList = (query?:any) => {
  return request({
    url: '/manager/seed/list',
    method: 'get',
    params: query
  });
};

/**
 * 批量导入
 * @param seedList
 * @returns {*}
 */

export const cardImport = (seedList:any) => {
  return request({
    url: '/manager/seed/import',
    method: 'post',
    data: seedList
  });
};
