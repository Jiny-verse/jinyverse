import type { Board, BoardFilter } from '../schemas/board';
import type { Topic, TopicFilter, TopicJoined } from '../schemas/topic';
import type { Comment, CommentFilter } from '../schemas/comment';

export type { Board, BoardFilter, BoardCreateInput, BoardUpdateInput } from '../schemas/board';
export type {
  Topic,
  TopicFilter,
  TopicJoined,
  TopicCreateInput,
  TopicUpdateInput,
} from '../schemas/topic';
export type {
  Comment,
  CommentFilter,
  CommentCreateInput,
  CommentUpdateInput,
} from '../schemas/comment';

/** Spring Page 응답 형태 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/** API 요청 옵션 (baseUrl, channel, role) */
export interface ApiOptions {
  baseUrl: string;
  channel: 'INTERNAL' | 'EXTERNAL';
  role?: 'admin' | 'user' | null;
}
