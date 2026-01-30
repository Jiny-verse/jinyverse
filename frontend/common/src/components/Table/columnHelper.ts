import type { ColumnDef } from './types';

/**
 * 데이터의 키로부터 컬럼 정의 자동 생성
 * @param data 목록 데이터 (첫 행 기준으로 키 추출)
 * @param options exclude: 제외할 키, labels: 키별 헤더 라벨
 */
export function columnsFromData<T extends Record<string, unknown>>(
  data: T[],
  options?: { exclude?: (keyof T)[]; labels?: Record<string, string> }
): ColumnDef<T>[] {
  const exclude = new Set(options?.exclude ?? []);
  const labels = options?.labels ?? {};
  const sample = data[0];
  if (!sample) return [];
  const keys = Object.keys(sample).filter((k) => !exclude.has(k as keyof T));
  return keys.map((key) => ({
    key,
    header: labels[key] ?? key,
  }));
}
