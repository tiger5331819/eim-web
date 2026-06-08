import { providerList, cardProviderList, companyList, projectList, allBatchList, tenantList } from '#/api/system/cardImport';

export async function getProviderDict() {
  const res = await providerList();
  return (res.rows || []).map((item: any) => ({
    label: item.dpSource,
    value: item.id,
  }));
}

export async function getCardProviderDict() {
  const res = await cardProviderList();
  return (res.data || []).map((item: any) => ({
    label: item,
    value: item,
  }));
}

export async function getCompanyDict() {
  const res = await companyList();
  return (res.data || []).map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
}

export async function getProjectDict(companyId: string) {
  const res = await projectList(companyId);
  return (res.data || []).map((item: any) => ({
    label: item.name,
    value: item.id,
  }));
}

export async function getBatchDict() {
  const res = await allBatchList();
  return (res.data || []).map((item: any) => ({
    label: item,
    value: item,
  }));
}

export async function getTenantDict() {
  const res = await tenantList();
  return (res.rows || []).map((item: any) => ({
    label: item.companyName,
    value: item.tenantId,
  }));
}
