import { z } from 'zod';

/**
 * 공통 스키마
 * 모든 프로젝트에서 공통으로 사용하는 기본 스키마들
 */

// ID 스키마
export const idSchema = z.string().uuid();

// 페이지네이션 입력 스키마 (목록 요청용)
export const paginationSchema = z.object({
  page: z.number().int().min(0).default(0),
  size: z.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Count API 응답 스키마
export const countResponseSchema = z.object({
  count: z.number().int().nonnegative(),
});

export type CountResponse = z.infer<typeof countResponseSchema>;

// Spring Page 응답 스키마 (content, totalElements, totalPages, size, number, first, last)
export const pageResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    size: z.number().int().nonnegative(),
    number: z.number().int().min(0),
    first: z.boolean(),
    last: z.boolean(),
  });
