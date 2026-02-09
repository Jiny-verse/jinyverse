import { z } from 'zod';

const optionalString = z.string().max(40).optional();
const optionalText = z.string().optional();

/** 메뉴 단일 응답 (조회용) */
export const menuSchema = z.object({
  id: z.string().uuid(),
  code: z.string().max(40),
  name: z.string().max(50),
  description: optionalText.nullable(),
  isActive: z.boolean().nullable(),
  isAdmin: z.boolean().nullable(),
  order: z.number().int().nullable(),
  upperId: z.string().uuid().nullable().optional(),
  channelCategoryCode: z.string().max(40).nullable(),
  channel: z.string().max(40).nullable(),
  path: z.string().max(500).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type Menu = z.infer<typeof menuSchema>;

/** 메뉴 생성 요청 */
export const menuCreateSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(50),
  description: optionalText,
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  order: z.number().int().optional(),
  upperId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  channelCategoryCode: optionalString,
  channel: optionalString,
  path: z.string().max(500).optional(),
});

export type MenuCreateInput = z.infer<typeof menuCreateSchema>;

/** 메뉴 수정 요청 (code 선택: 없으면 path 기준 유지, 있으면 변경 가능) */
export const menuUpdateSchema = menuCreateSchema.partial().extend({
  code: z.string().max(40).optional(),
});

export type MenuUpdateInput = z.infer<typeof menuUpdateSchema>;

/** 메뉴 목록 필터 (쿼리 파라미터) */
export const menuFilterSchema = z.object({
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  channel: optionalString,
  upperId: z
    .union([z.string().uuid(), z.literal('')])
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export type MenuFilter = z.infer<typeof menuFilterSchema>;
