import { z } from 'zod';
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

type CommentPageResponse = {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

const commentPageSchema = pageResponseSchema(commentSchema);

/** 목록 조회 파라미터: 페이징 + 검색(q) + 필터(CommentFilter). 필터 키는 스키마에만 정의하고 toQuery는 공통 처리 */
type ListCommentsParams = { page?: number; size?: number; sort?: string; q?: string } & CommentFilter;

function toQuery(params: ListCommentsParams): Record<string, string | number | boolean | undefined> {
  const { page, size, sort, q, ...filter } = params;
  const out: Record<string, string | number | boolean | undefined> = {};
  if (page !== undefined) out.page = page;
  if (size !== undefined) out.size = size;
  if (sort !== undefined) out.sort = sort;
  if (q !== undefined && q !== '') out.q = q;
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined) out[key] = value as string | number | boolean;
  }
  return out;
}

const listCommentsParamsSchema = paginationSchema
  .merge(commentFilterSchema)
  .extend({ q: z.string().optional() })
  .partial();

export async function getComments(
  options: ApiOptions,
  params: ListCommentsParams = {}
): Promise<CommentPageResponse> {
  const parsed = listCommentsParamsSchema.parse(params);
  const data = await apiGet<CommentPageResponse>(options, '/api/comments', toQuery(parsed));
  return commentPageSchema.parse(data) as CommentPageResponse;
}

export async function getComment(options: ApiOptions, id: string): Promise<Comment> {
  const data = await apiGet<Comment>(options, `/api/comments/${id}`);
  return commentSchema.parse(data);
}

export async function createComment(
  options: ApiOptions,
  body: CommentCreateInput
): Promise<Comment> {
  const parsed = commentCreateSchema.parse(body);
  const data = await apiPost<Comment>(options, '/api/comments', parsed);
  return commentSchema.parse(data);
}

export async function updateComment(
  options: ApiOptions,
  id: string,
  body: CommentUpdateInput
): Promise<Comment> {
  const parsed = commentUpdateSchema.parse(body);
  const data = await apiPost<Comment>(options, `/api/comments/${id}`, parsed);
  return commentSchema.parse(data);
}

export async function deleteComment(options: ApiOptions, id: string): Promise<void> {
  await apiDelete(options, `/api/comments/${id}`);
}
