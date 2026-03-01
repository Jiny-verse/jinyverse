import { z } from 'zod';

const uuid = z.string().uuid();
const optionalUuid = uuid.nullable().optional();

/** CTA 타입 */
export const ctaTypeSchema = z.enum(['text', 'button', 'image']);

/** CTA 응답 */
export const landingCtaSchema = z.object({
  id: uuid,
  sectionId: uuid,
  typeCategoryCode: z.string(),
  type: ctaTypeSchema,
  label: z.string().nullable().optional(),
  href: z.string(),
  className: z.string().nullable().optional(),
  positionTop: z.number().nullable().optional(),
  positionLeft: z.number().nullable().optional(),
  positionBottom: z.number().nullable().optional(),
  positionRight: z.number().nullable().optional(),
  positionTransform: z.string().nullable().optional(),
  imageFileId: optionalUuid,
  order: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type LandingCta = z.infer<typeof landingCtaSchema>;

/** 섹션 타입 */
export const sectionTypeSchema = z.enum(['hero', 'image', 'board_top', 'image_link']);

/** 섹션 응답 (CTA 목록 포함) */
export const landingSectionSchema = z.object({
  id: uuid,
  typeCategoryCode: z.string(),
  type: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  boardId: optionalUuid,
  isActive: z.boolean(),
  order: z.number().int(),
  extraConfig: z.record(z.unknown()).optional(),
  ctas: z.array(landingCtaSchema),
  fileIds: z.array(uuid).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export type LandingSection = z.infer<typeof landingSectionSchema>;

/** 섹션 생성/수정 요청 */
export const landingSectionCreateSchema = z.object({
  type: z.string().min(1),
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  boardId: uuid.optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
  extraConfig: z.record(z.unknown()).optional(),
});

export type LandingSectionCreateInput = z.infer<typeof landingSectionCreateSchema>;

export const landingSectionUpdateSchema = landingSectionCreateSchema.partial();

export type LandingSectionUpdateInput = z.infer<typeof landingSectionUpdateSchema>;

/** CTA 생성/수정 요청 */
export const landingCtaCreateSchema = z.object({
  type: ctaTypeSchema.optional(),
  label: z.string().max(255).optional(),
  href: z.string().min(1),
  className: z.string().optional(),
  positionTop: z.number().optional(),
  positionLeft: z.number().optional(),
  positionBottom: z.number().optional(),
  positionRight: z.number().optional(),
  positionTransform: z.string().optional(),
  imageFileId: uuid.optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type LandingCtaCreateInput = z.infer<typeof landingCtaCreateSchema>;

export const landingCtaUpdateSchema = landingCtaCreateSchema.partial();

export type LandingCtaUpdateInput = z.infer<typeof landingCtaUpdateSchema>;
