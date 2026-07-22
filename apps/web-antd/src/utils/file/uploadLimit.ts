import { Upload } from 'antdv-next';

/** 批量导入默认大小上限（MB） */
export const IMPORT_MAX_SIZE_MB = 50;

/**
 * 校验导入文件大小，超过上限时提示并返回 false
 */
export function checkImportFileSize(
  file: File | { size: number },
  maxMb = IMPORT_MAX_SIZE_MB,
) {
  const isValid = file.size / 1024 / 1024 <= maxMb;
  if (!isValid) {
    window.message.error(`文件大小不能超过 ${maxMb}MB`);
  }
  return isValid;
}

/**
 * 手动提交场景：超限不加入列表；通过则阻止自动上传（由业务自行提交）
 */
export function beforeManualImportUpload(file: File) {
  if (!checkImportFileSize(file)) {
    return Upload.LIST_IGNORE;
  }
  return false;
}

/**
 * 自动上传场景：超限不加入列表；通过则继续上传
 */
export function beforeAutoImportUpload(file: File) {
  if (!checkImportFileSize(file)) {
    return Upload.LIST_IGNORE;
  }
  return true;
}

/**
 * 创建自定义大小上限的上传前校验（用于 before-upload 绑定）
 */
export function createBeforeManualImportUpload(maxMb = IMPORT_MAX_SIZE_MB) {
  return (file: File) => {
    if (!checkImportFileSize(file, maxMb)) {
      return Upload.LIST_IGNORE;
    }
    return false;
  };
}

export function createBeforeAutoImportUpload(maxMb = IMPORT_MAX_SIZE_MB) {
  return (file: File) => {
    if (!checkImportFileSize(file, maxMb)) {
      return Upload.LIST_IGNORE;
    }
    return true;
  };
}
