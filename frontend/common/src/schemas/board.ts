import { z } from 'zod';

const uuid = z.string().uuid();
const optionalUuid = uuid.optional();
const optionalString = z.string().max(40).optional();
const optionalText = z.string().optional();

/** 게시판 단일 응답 (조회용) */
export const boardSchema = z.object({
  id: uuid,
  menuCode: optionalString.nullable(),
  typeCategoryCode: z.string().max(40),
  type: z.string().max(40),
  name: z.string().max(50),
  description: optionalText.nullable(),
  note: optionalText.nullable(),
  isPublic: z.boolean().nullable(),
  order: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type Board = z.infer<typeof boardSchema>;

/** 게시판 생성 요청 */
export const boardCreateSchema = z.object({
  menuCode: optionalString,
  typeCategoryCode: z.string().min(1).max(40),
  type: z.string().min(1).max(40),
  name: z.string().min(1).max(50),
  description: optionalText,
  note: optionalText,
  isPublic: z.boolean().optional(),
  order: z.number().int().optional(),
});

export type BoardCreateInput = z.infer<typeof boardCreateSchema>;

/** 게시판 수정 요청 */
export const boardUpdateSchema = boardCreateSchema.partial();

export type BoardUpdateInput = z.infer<typeof boardUpdateSchema>;

/** 게시판 목록 필터 (쿼리 파라미터) */
export const boardFilterSchema = z.object({
  menuCode: optionalString,
  typeCategoryCode: optionalString,
  type: optionalString,
  isPublic: z.boolean().optional(),
});

export type BoardFilter = z.infer<typeof boardFilterSchema>;
