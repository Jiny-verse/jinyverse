import { z } from 'zod';

/**
 * 공통 스키마
 * 모든 프로젝트에서 공통으로 사용하는 기본 스키마들
 */

// ID 스키마
export const idSchema = z.string().uuid();

// 페이지네이션 스키마
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// 페이지네이션 응답 스키마
export const paginationResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    size: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  });

// 날짜 범위 스키마
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type DateRange = z.infer<typeof dateRangeSchema>;

// 검색 스키마
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  fields: z.array(z.string()).optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;
