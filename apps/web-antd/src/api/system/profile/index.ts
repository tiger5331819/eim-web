import type {
  AllocationForm,
  ProfileQuery,
  UpdatePasswordParam,
  UserProfile,
} from './model';
import type { ID, PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  profileList = '/manager/profile/list',
  profileSync = '/manager/profile/sync',
  profileBatch = '/manager/profile/productionBatch',
  profileAssign = '/manager/profile/assign',
  root = '/manager/profile',
}

export function profileList(params?: ProfileQuery) {
  return alovaInstance.get<PageResult<any>>(Api.profileList, { params });
}

export function handleSync() {
  return alovaInstance.postWithMsg<void>(Api.profileSync);
}

export function allBatchList() {
  return alovaInstance.get<any>(Api.profileBatch);
}

export function batchAllowableNumber(productionBatch: string) {
  return alovaInstance.get<any>(`${Api.root}/canBeAssignCount/${productionBatch}`);
}

export function handleAllocation(data: AllocationForm) {
  return alovaInstance.postWithMsg<void>(Api.profileAssign, data);
}

export function updateProfileApn(id: ID, apnId: ID) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${id}/apn/${apnId}`);
}

/**
 * 获取当前用户个人信息
 */
export function userProfile() {
  return alovaInstance.get<UserProfile>('/system/user/profile');
}

/**
 * 更新用户头像
 * 适配 CropperAvatar 组件的 uploadApi 签名
 */
export function userUpdateAvatar({
  file,
}: {
  file: Blob;
  filename: string;
  name: string;
}) {
  const formData = new FormData();
  formData.append('avatarfile', file);
  return alovaInstance.post<{ imgUrl: string }>(
    '/system/user/profile/avatar',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
}

/**
 * 更新用户个人信息
 * @param data 用户信息
 */
export function userProfileUpdate(data: Record<string, any>) {
  return alovaInstance.putWithMsg<void>('/system/user/profile', data);
}

/**
 * 修改用户密码
 * @param data 包含 oldPassword 和 newPassword
 */
export function userUpdatePassword(data: UpdatePasswordParam) {
  return alovaInstance.putWithMsg<void>('/system/user/profile/updatePwd', data);
}
