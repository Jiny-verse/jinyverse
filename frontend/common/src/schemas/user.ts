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
