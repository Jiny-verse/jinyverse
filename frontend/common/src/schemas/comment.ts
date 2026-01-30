import { z } from 'zod';

const uuid = z.string().uuid();
const optionalUuid = uuid.optional();

/** 댓글 단일 응답 (조회용) */
export const commentSchema = z.object({
  id: uuid,
  topicId: uuid,
  userId: uuid,
  upperCommentId: optionalUuid.nullable(),
  content: z.string(),
  isDeleted: z.boolean().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type Comment = z.infer<typeof commentSchema>;

/** 댓글 생성 요청 */
export const commentCreateSchema = z.object({
  topicId: uuid,
  userId: uuid,
  upperCommentId: optionalUuid,
  content: z.string().min(1),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;

/** 댓글 수정 요청 */
export const commentUpdateSchema = z.object({
  topicId: uuid.optional(),
  userId: uuid.optional(),
  upperCommentId: optionalUuid,
  content: z.string().min(1).optional(),
});

export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;

/** 댓글 목록 필터 (쿼리 파라미터) */
export const commentFilterSchema = z.object({
  topicId: optionalUuid,
  userId: optionalUuid,
});

export type CommentFilter = z.infer<typeof commentFilterSchema>;
