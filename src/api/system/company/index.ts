import request from '@/utils/request';
import { CompanyForm, ProjectForm, QueryFrom } from './types';

/**
 * @method: 获取企业列表
 */
export const companyList = (query: QueryFrom) => {
  return request({
    url: `/manager/company/list`,
    method: 'get',
    params: query
  });
};

/**
 * @method:新增企业
 * @param:form
 */
export const addCompany = (form: CompanyForm) => {
  return request({
    url: '/manager/company',
    method: 'post',
    data: form
  });
};

/**
 * @method:获取企业详情
 * @param:companyId
 */
export const getCompanyDetail = (companyId: string) => {
  return request({
    url: `/manager/company/${companyId}`,
    method: 'get',
    params: { companyId: companyId }
  });
};

/**
 * @method:编辑企业
 * @param:form
 */
export const updateCompany = (companyId: string, form: CompanyForm) => {
  return request({
    url: `/manager/company/${companyId}`,
    method: 'put',
    data: form
  });
};

/**
 * @method:新增项目
 * @param:id, form
 */
export const addProject = (id: string, form: ProjectForm) => {
  return request({
    url: `/manager/company/${id}/project`,
    method: 'post',
    data: form
  });
};

/**
 * @method:获取项目详情
 * @param:id
 */
export const getProjectDetail = (companyId: string, projectId: string) => {
  return request({
    url: `/manager/company/${companyId}/project/${projectId}`,
    method: 'get'
  });
};

/**
 * @method:编辑项目
 * @param:form
 */
export const updateProject = (companyId: string, projectId: string, form: ProjectForm) => {
  return request({
    url: `/manager/company/${companyId}/project/${projectId}`,
    method: 'put',
    data: form
  });
};

/**
 * @method:删除企业
 * @param:ids
 */
export const handledeleteCompany = (ids: string) => {
  return request({
    url: `/manager/company/${ids}`,
    method: 'delete'
  });
};

/**
 * @method:删除项目
 * @param:ids
 */
export const handledeleteProject = (companyId: string, ids: string) => {
  return request({
    url: `/manager/company/${companyId}/project/${ids}`,
    method: 'delete'
  });
};

/**
 * @method:查询租户列表
 */
export const tenantList = () => {
  return request({
    url: `/system/tenant/list`,
    method: 'get'
  });
};

/**
 * @method:查询用户租户信息
 */
export const tenantInfo = () => {
  return request({
    url: `/system/user/getTenant`,
    method: 'get'
  });
};
