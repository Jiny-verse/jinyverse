import { z } from 'zod';

const uuid = z.string().uuid();
const optionalUuid = uuid.optional();
const optionalString = z.string().max(40).optional();
const optionalText = z.string().optional();

/** 게시글 단일 응답 (조회용) */
export const topicSchema = z.object({
  id: uuid,
  authorUserId: uuid,
  menuCode: optionalString.nullable(),
  statusCategoryCode: z.string().max(40),
  status: z.string().max(40),
  boardId: uuid,
  title: z.string().max(200),
  content: z.string(),
  isNotice: z.boolean().nullable(),
  isPinned: z.boolean().nullable(),
  isPublic: z.boolean().nullable(),
  viewCount: z.number().int().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
});

export type Topic = z.infer<typeof topicSchema>;

/** 게시글 생성 요청 (statusCategoryCode/status 미입력 시 DB DEFAULT) */
export const topicCreateSchema = z.object({
  authorUserId: uuid,
  menuCode: optionalString,
  statusCategoryCode: optionalString,
  status: optionalString,
  boardId: uuid,
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  isNotice: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  publishedAt: z.string().optional(),
});

export type TopicCreateInput = z.infer<typeof topicCreateSchema>;

/** 게시글 수정 요청 */
export const topicUpdateSchema = topicCreateSchema.partial();

export type TopicUpdateInput = z.infer<typeof topicUpdateSchema>;

/** 게시글 목록 필터 (쿼리 파라미터) */
export const topicFilterSchema = z.object({
  boardId: optionalUuid,
  statusCategoryCode: optionalString,
  status: optionalString,
  q: z.string().max(200).optional(),
  isNotice: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type TopicFilter = z.infer<typeof topicFilterSchema>;

/** 게시글 조인 응답 (상세: topic + author, board, comments 등) - comments는 별도 getComments로 채움 */
export const topicJoinedSchema = topicSchema.extend({
  authorName: z.string().optional(),
  boardName: z.string().optional(),
  comments: z.array(z.unknown()).optional(),
});

export type TopicJoined = z.infer<typeof topicJoinedSchema>;
