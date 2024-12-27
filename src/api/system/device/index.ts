import request from '@/utils/request';

/**
 * 卡信息记录查询
 * @param query
 * @returns {*}
 */

export const cardList = (query?: any) => {
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

export const cardImport = (seedList: any) => {
  return request({
    url: '/manager/seed/import',
    method: 'post',
    data: seedList
  });
};

/**
 * 查询设备列表
 * @param query
 * @returns {*}
 */

export const deviceList = (query?: any) => {
  return request({
    url: '/manager/device/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询设备详细信息
 * @param eid
 * @returns {*}
 */

export const deviceDetail = (eid?: any) => {
  return request({
    url: `/manager/device/${eid}`,
    method: 'get'
  });
};

/**
 * 同步数据
 * @param eid
 * @returns {*}
 */

export const updateDetail = (eid?: any) => {
  return request({
    url: `/manager/device/${eid}/profile/list`,
    method: 'post'
  });
};

/**
 * 修改设备名称
 * @param eid
 * @returns {*}
 */

export const deviceName = (eid: any, name: any) => {
  return request({
    url: `/manager/device/${eid}/name`,
    method: 'post',
    data: name
  });
};

/**
 * 修改企业名称
 * @param eid
 * @returns {*}
 */

export const companyName = (eid: any, name: any) => {
  return request({
    url: `/manager/device/${eid}/companyName`,
    method: 'post',
    data: name
  });
};

/**
 * 启用业务号
 * @param data
 * @returns {*}
 */

export const toEnable = (eid: any, iccid: any) => {
  return request({
    url: `/manager/device/${eid}/profile/${iccid}/enable`,
    method: 'patch'
  });
};

/**
 * 停用业务号
 * @param data
 * @returns {*}
 */

export const toDisable = (eid: any, iccid: any) => {
  return request({
    url: `/manager/device/${eid}/profile/${iccid}/disable`,
    method: 'patch'
  });
};

/**
 * 删除业务号
 * @param data
 * @returns {*}
 */

export const toDelete = (eid: any, iccid: any) => {
  return request({
    url: `/manager/device/${eid}/profile/${iccid}`,
    method: 'delete'
  });
};

/**
 * 查询设备运营信息列表
 * @param eid
 * @returns {*}
 */

export const operationLog = (eid: any, query: any) => {
  return request({
    url: `/manager/device/${eid}/log/list`,
    method: 'get',
    params: query
  });
};

/**
 * 查询设备EIM列表
 * @param eid
 * @returns {*}
 */

export const eimList = (eid?: any) => {
  return request({
    url: `/manager/device/${eid}/eim/list`,
    method: 'get'
  });
};

/**
 * 查询设备EIM详情
 * @param eid
 * @returns {*}
 */

export const eimDetail = (eid: any, eimId: any) => {
  return request({
    url: `/manager/device/${eid}/eim/${eimId}`,
    method: 'get'
  });
};

/**
 * 新增设备EIM
 * @param data
 * @returns {*}
 */

export const eimAdd = (eid: any, data: any) => {
  return request({
    url: `/manager/device/${eid}/eim`,
    method: 'post',
    data: data
  });
};

/**
 * 修改设备EIM
 * @param data
 * @returns {*}
 */

export const eimEdit = (eid: any, eimId: any, data: any) => {
  return request({
    url: `/manager/device/${eid}/eim/${eimId}`,
    method: 'patch',
    data: data
  });
};

/**
 * 替换设备EIM
 * @param data
 * @returns {*}
 */

export const eimChange = (eid: any, eimId: any, data: any) => {
  return request({
    url: `/manager/device/${eid}/eim/${eimId}/change`,
    method: 'post',
    data: data
  });
};

/**
 * 删除设备EIM
 * @param eid
 * @returns {*}
 */

export const eimDelete = (eid: any, eimId: any) => {
  return request({
    url: `/manager/device/${eid}/eim/${eimId}`,
    method: 'delete'
  });
};

/**
 * 查询下载进度
 * @param eid
 * @returns {*}
 */

export const eimDownload = (eid: any) => {
  return request({
    url: `/manager/device/${eid}/profileDownload`,
    method: 'get'
  });
};

/**
 * 获取并下载业务号
 * @param eid
 * @returns {*}
 */

export const dpDownload = (eid: any) => {
  return request({
    url: `/manager/device/${eid}/dp/profileDownload`,
    method: 'post'
  });
};

/**
 * 识别并下载业务号
 * @param data
 * @returns {*}
 */

export const toDownload = (eid: any, data: any) => {
  return request({
    url: `/manager/device/${eid}/profileDownload`,
    method: 'post',
    data: data
  });
};

/**
 * 使用运营商资源下载业务号
 * @param data
 * @returns {*}
 */

export const idDownload = (eid: any, id: any) => {
  return request({
    url: `/eimProfile/${eid}/use/${id}`,
    method: 'get'
  });
};

/**
 * 业务号下载结果
 * @param data
 * @returns {*}
 */

export const toResult = (eid: any) => {
  return request({
    url: `/manager/device/${eid}/profileDownload/result`,
    method: 'get'
  });
};

/**
 * 同步EIM
 * @param eid
 * @returns {*}
 */

export const updateEim = (eid?: any) => {
  return request({
    url: `/manager/device/${eid}/eim/listEim`,
    method: 'post'
  });
};

/**
 * 获取运营商列表
 * @param eid
 * @returns {*}
 */

export const eimProfile = (eid?: any) => {
  return request({
    url: `/eimProfile`,
    method: 'get'
  });
};
