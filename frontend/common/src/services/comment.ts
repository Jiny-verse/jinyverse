import {
  commentSchema,
  commentCreateSchema,
  commentUpdateSchema,
  commentFilterSchema,
  pageResponseSchema,
  paginationSchema,
} from '../schemas';
import type { ApiOptions } from '../types/api';
import type { Comment, CommentCreateInput, CommentUpdateInput, CommentFilter } from '../types/api';
import { apiGet, apiPost, apiDelete } from './api';

type CommentPageResponse = { content: Comment[]; totalElements: number; totalPages: number; size: number; number: number; first: boolean; last: boolean };

const commentPageSchema = pageResponseSchema(commentSchema);

function toQuery(params: { page?: number; size?: number; sort?: string } & CommentFilter): Record<string, string | number | boolean | undefined> {
  const { page, size, sort, topicId, userId } = params;
  const query: Record<string, string | number | boolean | undefined> = {};
  if (page !== undefined) query.page = page;
  if (size !== undefined) query.size = size;
  if (sort !== undefined) query.sort = sort;
  if (topicId !== undefined) query.topicId = topicId;
  if (userId !== undefined) query.userId = userId;
  return query;
}

export async function getComments(
  options: ApiOptions,
  params: { page?: number; size?: number; sort?: string } & CommentFilter = {}
): Promise<CommentPageResponse> {
  const parsed = paginationSchema.merge(commentFilterSchema).partial().parse(params);
  const data = await apiGet<CommentPageResponse>(options, '/api/comments', toQuery(parsed));
  return commentPageSchema.parse(data) as CommentPageResponse;
}

export async function getComment(options: ApiOptions, id: string): Promise<Comment> {
  const data = await apiGet<Comment>(options, `/api/comments/${id}`);
  return commentSchema.parse(data);
}

export async function createComment(options: ApiOptions, body: CommentCreateInput): Promise<Comment> {
  const parsed = commentCreateSchema.parse(body);
  const data = await apiPost<Comment>(options, '/api/comments', parsed);
  return commentSchema.parse(data);
}

export async function updateComment(options: ApiOptions, id: string, body: CommentUpdateInput): Promise<Comment> {
  const parsed = commentUpdateSchema.parse(body);
  const data = await apiPost<Comment>(options, `/api/comments/${id}`, parsed);
  return commentSchema.parse(data);
}

export async function deleteComment(options: ApiOptions, id: string): Promise<void> {
  await apiDelete(options, `/api/comments/${id}`);
}
