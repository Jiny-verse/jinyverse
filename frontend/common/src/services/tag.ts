import { z } from 'zod';
import {
  tagSchema,
  tagCreateSchema,
  tagUpdateSchema,
  tagFilterSchema,
  pageResponseSchema,
  paginationSchema,
} from '../schemas';
import type { ApiOptions } from '../types/api';
import type { Tag, TagCreateInput, TagUpdateInput, TagFilter } from '../types/api';
import { apiGet, apiPost, apiDelete } from './api';

type TagPageResponse = {
  content: Tag[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

const tagPageSchema = pageResponseSchema(tagSchema);

type ListTagsParams = { page?: number; size?: number; sort?: string; q?: string } & TagFilter;

function toQuery(params: ListTagsParams): Record<string, string | number | boolean | undefined> {
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

const listTagsParamsSchema = paginationSchema
  .merge(tagFilterSchema)
  .extend({ q: z.string().optional() })
  .partial();

export async function getTags(
  options: ApiOptions,
  params: ListTagsParams = {}
): Promise<TagPageResponse> {
  const parsed = listTagsParamsSchema.parse(params);
  const data = await apiGet<TagPageResponse>(options, '/api/tags', toQuery(parsed));
  return tagPageSchema.parse(data) as TagPageResponse;
}

export async function getTag(options: ApiOptions, id: string): Promise<Tag> {
  const data = await apiGet<Tag>(options, `/api/tags/${id}`);
  return tagSchema.parse(data);
}

export async function createTag(options: ApiOptions, body: TagCreateInput): Promise<Tag> {
  const parsed = tagCreateSchema.parse(body);
  const data = await apiPost<Tag>(options, '/api/tags', parsed);
  return tagSchema.parse(data);
}

export async function updateTag(
  options: ApiOptions,
  id: string,
  body: TagUpdateInput
): Promise<Tag> {
  const parsed = tagUpdateSchema.parse(body);
  const bodyToSend = Object.fromEntries(
    Object.entries(parsed).filter(([, v]) => v !== undefined && v !== '')
  ) as TagUpdateInput;
  const data = await apiPost<Tag>(options, `/api/tags/${id}`, bodyToSend);
  return tagSchema.parse(data);
}

export async function deleteTag(options: ApiOptions, id: string): Promise<void> {
  await apiDelete(options, `/api/tags/${id}`);
}
