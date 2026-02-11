import type { ApiOptions } from '../types/api';
import type { CommonFile } from '../schemas/file';
import { apiDelete, apiGet, apiGetBlob, apiPost, apiPostFormData } from './api';

const FILES_PATH = 'api/files';

export type UploadSession = { sessionId: string; expiresAt: string };

/** 업로드 세션 발급 (인증 필수). Topic 첨부 등에서 sessionId로 사용. */
export async function createUploadSession(options: ApiOptions): Promise<UploadSession> {
  return apiPost<UploadSession>(options, `${FILES_PATH}/upload-session`, {});
}

export async function uploadFile(
  options: ApiOptions,
  file: File,
  sessionId?: string
): Promise<CommonFile> {
  const form = new FormData();
  form.append('file', file);
  if (sessionId != null && sessionId !== '') {
    form.append('sessionId', sessionId);
  }
  return apiPostFormData<CommonFile>(options, `${FILES_PATH}/upload`, form);
}

export async function getFileById(options: ApiOptions, id: string): Promise<CommonFile> {
  return apiGet<CommonFile>(options, `${FILES_PATH}/${id}`);
}

/** 다운로드 URL (같은 origin + credentials 시 사용). */
export function getDownloadUrl(options: ApiOptions, fileId: string): string {
  const base = options.baseUrl || '';
  const path = `${FILES_PATH}/${fileId}/download`;
  return base ? `${base}/${path}` : `/${path}`;
}

/** 파일을 Blob으로 조회. Avatar 등 <img>에 쓸 object URL 생성용. */
export async function fetchFileAsBlob(options: ApiOptions, fileId: string): Promise<Blob> {
  return apiGetBlob(options, `${FILES_PATH}/${fileId}/download`);
}

export async function deleteFile(options: ApiOptions, id: string): Promise<void> {
  return apiDelete(options, `${FILES_PATH}/${id}`);
}
