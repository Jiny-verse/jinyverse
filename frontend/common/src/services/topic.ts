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

type TopicPageResponse = {
  content: Topic[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

const topicPageSchema = pageResponseSchema(topicSchema);

/** 목록 조회 파라미터: 페이징 + 검색(q) + 필터(TopicFilter). 필터 키는 스키마에만 정의하고 toQuery는 공통 처리 */
type ListTopicsParams = { page?: number; size?: number; sort?: string; q?: string } & TopicFilter;

function toQuery(params: ListTopicsParams): Record<string, string | number | boolean | undefined> {
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

const listTopicsParamsSchema = paginationSchema.merge(topicFilterSchema).partial();

export async function getTopics(
  options: ApiOptions,
  params: ListTopicsParams = {}
): Promise<TopicPageResponse> {
  const parsed = listTopicsParamsSchema.parse(params);
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

export async function updateTopic(
  options: ApiOptions,
  id: string,
  body: TopicUpdateInput
): Promise<Topic> {
  const parsed = topicUpdateSchema.parse(body);
  const data = await apiPost<Topic>(options, `/api/topics/${id}`, parsed);
  return topicSchema.parse(data);
}

export async function deleteTopic(options: ApiOptions, id: string): Promise<void> {
  await apiDelete(options, `/api/topics/${id}`);
}
