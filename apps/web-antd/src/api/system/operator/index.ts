import type {
  OperatorBo,
  OperatorImportResultVo,
  OperatorVo,
} from './model';

import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/operator',
  list = '/manager/operator/list',
  export = '/manager/operator/export',
  import = '/manager/operator/import',
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
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

/** 修改运营商 */
export function operatorUpdate(data: OperatorBo) {
  return alovaInstance.putWithMsg<void>(Api.root, data);
}

/** 删除运营商 */
export function operatorRemove(ids: IDS) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${ids}`);
}

/** 导出运营商列表 */
export function operatorExport(data: Record<string, any>) {
  return commonExport(Api.export, data);
}

/** 批量导入运营商（multipart/form-data，返回导入结果） */
export function operatorImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return alovaInstance.post<OperatorImportResultVo>(Api.import, formData, {
    headers: { 'Content-Type': 'multipart/form-data;charset=UTF-8' },
  });
}
