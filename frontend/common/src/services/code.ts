import type { ApiOptions } from '../types/api';
import { apiGet, apiPost, apiDelete } from './api';

export type Code = {
  categoryCode: string;
  code: string;
  name: string;
  value?: string;
  description?: string;
  note?: string;
  order?: number;
  upperCategoryCode?: string;
  upperCode?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type CodeCategory = {
  code: string;
  isSealed: boolean;
  name: string;
  description?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

type CodePageResponse = {
  content: Code[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

type CodeCategoryPageResponse = {
  content: CodeCategory[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

/** 공통코드 목록 조회 (분류 코드로 필터) */
export async function getCodes(
  options: ApiOptions,
  params: { categoryCode: string; page?: number; size?: number }
): Promise<Code[]> {
  const res = await apiGet<CodePageResponse>(options, '/api/codes', {
    categoryCode: params.categoryCode,
    page: params.page ?? 0,
    size: params.size ?? 100,
  });
  return res.content ?? [];
}

/** 공통코드 분류 목록 조회 */
export async function getCodeCategories(
  options: ApiOptions,
  params?: { page?: number; size?: number; q?: string }
): Promise<CodeCategoryPageResponse> {
  return apiGet<CodeCategoryPageResponse>(options, '/api/code-categories', {
    page: params?.page ?? 0,
    size: params?.size ?? 10,
    q: params?.q,
  });
}

/** 공통코드 분류 생성 */
export async function createCodeCategory(
  options: ApiOptions,
  data: Omit<CodeCategory, 'createdAt' | 'updatedAt' | 'deletedAt'>
): Promise<CodeCategory> {
  return apiPost<CodeCategory>(options, '/api/code-categories', data);
}

/** 공통코드 분류 수정 */
export async function updateCodeCategory(
  options: ApiOptions,
  code: string,
  data: Partial<Omit<CodeCategory, 'code' | 'createdAt' | 'updatedAt' | 'deletedAt'>>
): Promise<CodeCategory> {
  return apiPost<CodeCategory>(options, `/api/code-categories/${code}/update`, data);
}

/** 공통코드 분류 삭제 */
export async function deleteCodeCategory(options: ApiOptions, code: string): Promise<void> {
  return apiDelete(options, `/api/code-categories/${code}`);
}

/** 공통코드 생성 */
export async function createCode(
  options: ApiOptions,
  data: {
    categoryCode: string;
    code: string;
    name: string;
    value?: string;
    description?: string;
    note?: string;
    order?: number;
    upperCategoryCode?: string;
    upperCode?: string;
  }
): Promise<Code> {
  return apiPost<Code>(options, '/api/codes', data);
}

/** 공통코드 수정 */
export async function updateCode(
  options: ApiOptions,
  catCode: string,
  code: string,
  data: Partial<{
    name: string;
    value: string;
    description: string;
    note: string;
    order: number;
    upperCategoryCode: string;
    upperCode: string;
  }>
): Promise<Code> {
  return apiPost<Code>(options, `/api/codes/${catCode}/${code}/update`, {
    categoryCode: catCode,
    code,
    ...data,
  });
}

/** 공통코드 삭제 */
export async function deleteCode(options: ApiOptions, catCode: string, code: string): Promise<void> {
  return apiDelete(options, `/api/codes/${catCode}/${code}`);
}
