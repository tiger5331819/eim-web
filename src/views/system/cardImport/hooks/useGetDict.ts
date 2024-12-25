import { allBatchList, companyList, projectList } from '@/api/system/cardImport';

/** 获取下拉框数据：运营商 */
export async function getBatchDict() {
  const res = await allBatchList();
  const target = res.data.map((item: any) => {
    const _item = {
      label: item,
      value: item
    };
    return _item;
  });
  return target;
}

/** 获取下拉框数据：归属企业 */
export async function getCompanyDict() {
  const res = await companyList();
  const target = res.data.map((item: any) => {
    const _item = {
      label: item.name,
      value: item.id
    };
    return _item;
  });
  return target;
}

/** 获取下拉框数据：归属项目 */
export async function getProjectDict(params: string) {
  const res = await projectList(params);
  const target = res.data.map((item: any) => {
    const _item = {
      label: item.dpSource,
      value: item.id
    };
    return _item;
  });
  return target;
}
