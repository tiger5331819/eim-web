import type {
  OperatorBo,
  OperatorImportResultVo,
  OperatorStatusBo,
  OperatorVo,
} from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { EnableStatus } from '@vben/constants';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/operator',
  list = '/manager/operator/list',
  export = '/manager/operator/export',
  import = '/manager/operator/import',
  changeStatus = '/manager/operator/changeStatus',
}

/** 分页查询运营商列表 */
export function operatorList(params?: PageQuery) {
  return alovaInstance.get<PageResult<OperatorVo>>(Api.list, { params });
}

/** 获取运营商详情 */
export function operatorInfo(id: ID) {
  return alovaInstance.get<OperatorVo>(`${Api.root}/${id}`);
}

/** 新增运营商 */
export function operatorAdd(data: OperatorBo) {
  return alovaInstance.postWithMsg<void>(Api.root, data, {
    successMessageMode: 'none',
  });
}

/** 修改运营商 */
export function operatorUpdate(data: OperatorBo) {
  return alovaInstance.putWithMsg<void>(Api.root, data, {
    successMessageMode: 'none',
  });
}

/** 切换运营商状态 */
export function operatorChangeStatus(data: OperatorStatusBo) {
  return alovaInstance.putWithMsg<void>(Api.changeStatus, data, {
    successMessageMode: 'none',
  });
}

/** 删除运营商 */
export function operatorRemove(ids: IDS) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${ids}`, undefined, {
    successMessageMode: 'none',
  });
}

/** 导出运营商列表 */
export function operatorExport(data: Record<string, any>) {
  return commonExport(Api.export, data);
}

/** 批量导入运营商 */
export function operatorImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return alovaInstance.post<OperatorImportResultVo>(Api.import, formData, {
    headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
  });
}

/** 拉取运营商下拉选项 */
export async function getOperatorOptions() {
  const res = await operatorList({ pageNum: 1, pageSize: 1000 });
  return (res.rows || []).map((item) => ({
    label: item.operatorName,
    value: item.id,
  }));
}

/** 拉取已启用运营商下拉选项（APN 新增表单使用） */
export async function getEnabledOperatorOptions() {
  const res = await operatorList({
    pageNum: 1,
    pageSize: 1000,
    status: EnableStatus.Enable,
  });
  return (res.rows || []).map((item) => ({
    label: item.operatorName,
    value: item.id,
  }));
}
