import type { ApiOptions } from '../types/api';

/**
 * <img src="..."> 처럼 헤더 설정이 불가능한 컨텍스트에서 사용.
 * accessToken을 쿼리 파라미터로 포함한 이미지 URL 반환.
 */
export function getPublicImageUrl(fileId: string, apiOptions: ApiOptions): string {
  const base = apiOptions.baseUrl ?? '';
  const path = `api/files/${fileId}/download`;
  const url = base ? `${base}/${path}` : `/${path}`;
  return apiOptions.accessToken ? `${url}?token=${encodeURIComponent(apiOptions.accessToken)}` : url;
}
