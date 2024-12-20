import request from '@/utils/request';
import { CompanyForm, ProjectForm } from './types';

/**
 * @method: 获取企业列表
 */
export const companyList = () => {
  return request({
    url: '',
    method: 'get'
  });
};

/**
 * @method:新增企业
 * @param:form
 */
export const addCompany = (form: CompanyForm) => {
  return request({
    url: '',
    method: 'post',
    data: form
  });
};

/**
 * @method:获取企业详情
 * @param:id
 */
export const getCompanyDetail = (id: string | number) => {
  return request({
    url: '',
    method: 'post',
    data: id
  });
};

/**
 * @method:编辑企业
 * @param:form
 */
export const updateCompany = (form: CompanyForm) => {
  return request({
    url: '',
    method: 'post',
    data: form
  });
};

/**
 * @method:新增项目
 * @param:form
 */
export const addProject = (form: ProjectForm) => {
  return request({
    url: '',
    method: 'post',
    data: form
  });
};

/**
 * @method:获取项目详情
 * @param:id
 */
export const getProjectDetail = (id: string | number) => {
  return request({
    url: '',
    method: 'post',
    data: id
  });
};

/**
 * @method:编辑项目
 * @param:form
 */
export const updateProject = (form: ProjectForm) => {
  return request({
    url: '',
    method: 'post',
    data: form
  });
};

/**
 * @method:删除企业/项目
 * @param:id
 */
export const handledelete = (id: string | number) => {
  return request({
    url: '',
    // url: `/manager/device/${id}/profile/${iccid}`,
    method: 'delete'
  });
};
