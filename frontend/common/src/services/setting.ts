import type { ApiOptions } from '../types/api';
import type { FileStorageSetting, FileStorageSettingUpdate } from '../schemas/setting';
import { apiGet, apiPost } from './api';

const FILE_STORAGE_PATH = 'api/admin/settings/file-storage';

export async function getFileStorageSetting(options: ApiOptions): Promise<FileStorageSetting> {
  return apiGet<FileStorageSetting>(options, FILE_STORAGE_PATH);
}

export async function updateFileStorageSetting(
  options: ApiOptions,
  body: FileStorageSettingUpdate
): Promise<FileStorageSetting> {
  return apiPost<FileStorageSetting>(options, FILE_STORAGE_PATH, body);
}
