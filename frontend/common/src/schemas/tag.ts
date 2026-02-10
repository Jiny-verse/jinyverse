import { z } from 'zod';

const uuid = z.string().uuid();
const optionalString = z.string().max(40).optional();
const optionalText = z.string().optional();

/** 태그 단일 응답 (조회용) */
export const tagSchema = z.object({
  id: uuid,
  name: z.string().max(50),
  description: optionalText.nullable(),
  usageCategoryCode: z.string().max(40),
  usage: z.string().max(40),
  createdAt: z.string(),
});

export type Tag = z.infer<typeof tagSchema>;

export const tagCreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: optionalText,
  usageCategoryCode: optionalString,
  usage: optionalString,
});

export type TagCreateInput = z.infer<typeof tagCreateSchema>;

/** 태그 수정 요청 */
export const tagUpdateSchema = tagCreateSchema.partial();

export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;

/** 태그 목록 필터 (쿼리 파라미터) */
export const tagFilterSchema = z.object({
  usageCategoryCode: optionalString,
  usage: optionalString,
});

export type TagFilter = z.infer<typeof tagFilterSchema>;
