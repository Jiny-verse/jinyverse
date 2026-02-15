import { z } from 'zod';

const uuid = z.string().uuid();

export const userJoinSchema = z.object({
  id: uuid,
  nickname: z.string(),
});

export type UserJoin = z.infer<typeof userJoinSchema>;

export const userSchema = z.object({
  id: uuid,
  roleCategoryCode: z.string().optional(),
  role: z.string().optional(),
  username: z.string(),
  email: z.string(),
  name: z.string(),
  nickname: z.string(),
  isActive: z.boolean().nullable().optional(),
  isLocked: z.boolean().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().nullable().optional(),
  profileImageFileId: uuid.nullable().optional(),
});

export type User = z.infer<typeof userSchema>;

export const userUpdateInputSchema = z.object({
  name: z.string().optional(),
  nickname: z.string().optional(),
  password: z.string().optional(),
  currentPassword: z.string().optional(),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  role: z.string().optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateInputSchema>;

export const userListParamsSchema = z.object({
  page: z.number().int().min(0).optional(),
  size: z.number().int().positive().optional(),
  keyword: z.string().optional(),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  role: z.string().optional(),
});

export type UserListParams = z.infer<typeof userListParamsSchema>;
