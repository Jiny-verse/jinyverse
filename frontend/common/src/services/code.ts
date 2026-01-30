import type { ApiOptions } from '../types/api';
import { apiGet } from './api';

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

type CodePageResponse = {
  content: Code[];
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
