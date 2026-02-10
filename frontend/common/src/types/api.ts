import type { Board, BoardFilter } from '../schemas/board';
import type { Topic, TopicFilter, TopicJoined } from '../schemas/topic';
import type { Comment, CommentFilter } from '../schemas/comment';
import type { Menu, MenuFilter } from '../schemas/menu';

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
export type { Menu, MenuFilter, MenuCreateInput, MenuUpdateInput } from '../schemas/menu';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiOptions {
  baseUrl: string;
  channel: 'INTERNAL' | 'EXTERNAL';
  role?: string | null;
  accessToken?: string | null;
  on401?: () => void;
}
