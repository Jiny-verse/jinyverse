import {
  topicSchema,
  topicCreateSchema,
  topicUpdateSchema,
  topicFilterSchema,
  pageResponseSchema,
  paginationSchema,
  countResponseSchema,
} from '../schemas';
import type { ApiOptions } from '../types/api';
import type { Topic, TopicCreateInput, TopicUpdateInput, TopicFilter } from '../types/api';
import { apiGet, apiPost, apiDelete } from './api';

type TopicPageResponse = { content: Topic[]; totalElements: number; totalPages: number; size: number; number: number; first: boolean; last: boolean };

const topicPageSchema = pageResponseSchema(topicSchema);

function toQuery(params: { page?: number; size?: number; sort?: string } & TopicFilter): Record<string, string | number | boolean | undefined> {
  const { page, size, sort, boardId, statusCategoryCode, status, q, isNotice, isPinned } = params;
  const query: Record<string, string | number | boolean | undefined> = {};
  if (page !== undefined) query.page = page;
  if (size !== undefined) query.size = size;
  if (sort !== undefined) query.sort = sort;
  if (boardId !== undefined) query.boardId = boardId;
  if (statusCategoryCode !== undefined) query.statusCategoryCode = statusCategoryCode;
  if (status !== undefined) query.status = status;
  if (q !== undefined) query.q = q;
  if (isNotice !== undefined) query.isNotice = isNotice;
  if (isPinned !== undefined) query.isPinned = isPinned;
  return query;
}

export async function getTopics(
  options: ApiOptions,
  params: { page?: number; size?: number; sort?: string } & TopicFilter = {}
): Promise<TopicPageResponse> {
  const parsed = paginationSchema.merge(topicFilterSchema).partial().parse(params);
  const data = await apiGet<TopicPageResponse>(options, '/api/topics', toQuery(parsed));
  return topicPageSchema.parse(data) as TopicPageResponse;
}

export async function getTopicCount(options: ApiOptions): Promise<number> {
  const data = await apiGet<{ count: number }>(options, '/api/topics/count', {});
  return countResponseSchema.parse(data).count;
}

export async function getTopic(options: ApiOptions, id: string): Promise<Topic> {
  const data = await apiGet<Topic>(options, `/api/topics/${id}`);
  return topicSchema.parse(data);
}

export async function createTopic(options: ApiOptions, body: TopicCreateInput): Promise<Topic> {
  const parsed = topicCreateSchema.parse(body);
  const data = await apiPost<Topic>(options, '/api/topics', parsed);
  return topicSchema.parse(data);
}

export async function updateTopic(options: ApiOptions, id: string, body: TopicUpdateInput): Promise<Topic> {
  const parsed = topicUpdateSchema.parse(body);
  const data = await apiPost<Topic>(options, `/api/topics/${id}`, parsed);
  return topicSchema.parse(data);
}

export async function deleteTopic(options: ApiOptions, id: string): Promise<void> {
  await apiDelete(options, `/api/topics/${id}`);
}
