import { z } from 'zod';

const uuid = z.string().uuid();

export const userJoinSchema = z.object({
  id: uuid,
  nickname: z.string(),
});

export type UserJoin = z.infer<typeof userJoinSchema>;
