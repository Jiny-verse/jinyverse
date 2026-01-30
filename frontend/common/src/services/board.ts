import { z } from 'zod';
import {
  boardSchema,
  boardCreateSchema,
  boardUpdateSchema,
  boardFilterSchema,
  pageResponseSchema,
  paginationSchema,
  countResponseSchema,
} from '../schemas';
import type { ApiOptions } from '../types/api';
import type { Board, BoardCreateInput, BoardUpdateInput, BoardFilter } from '../types/api';
import { apiGet, apiPost, apiDelete } from './api';

type BoardPageResponse = { content: Board[]; totalElements: number; totalPages: number; size: number; number: number; first: boolean; last: boolean };

const boardPageSchema = pageResponseSchema(boardSchema);

/** 목록 조회 파라미터: 페이징 + 검색(q) + 필터(BoardFilter). 필터 키는 스키마에만 정의하고 toQuery는 공통 처리 */
type ListBoardsParams = { page?: number; size?: number; sort?: string; q?: string } & BoardFilter;

function toQuery(params: ListBoardsParams): Record<string, string | number | boolean | undefined> {
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

const listBoardsParamsSchema = paginationSchema.merge(boardFilterSchema).extend({ q: z.string().optional() }).partial();

export async function getBoards(
  options: ApiOptions,
  params: ListBoardsParams = {}
): Promise<BoardPageResponse> {
  const parsed = listBoardsParamsSchema.parse(params);
  const data = await apiGet<BoardPageResponse>(options, '/api/boards', toQuery(parsed));
  return boardPageSchema.parse(data) as BoardPageResponse;
}

export async function getBoardCount(options: ApiOptions): Promise<number> {
  const data = await apiGet<{ count: number }>(options, '/api/boards/count', {});
  return countResponseSchema.parse(data).count;
}

export async function getBoard(options: ApiOptions, id: string): Promise<Board> {
  const data = await apiGet<Board>(options, `/api/boards/${id}`);
  return boardSchema.parse(data);
}

export async function createBoard(options: ApiOptions, body: BoardCreateInput): Promise<Board> {
  const parsed = boardCreateSchema.parse(body);
  const data = await apiPost<Board>(options, '/api/boards', parsed);
  return boardSchema.parse(data);
}

export async function updateBoard(options: ApiOptions, id: string, body: BoardUpdateInput): Promise<Board> {
  const parsed = boardUpdateSchema.parse(body);
  const data = await apiPost<Board>(options, `/api/boards/${id}`, parsed);
  return boardSchema.parse(data);
}

export async function deleteBoard(options: ApiOptions, id: string): Promise<void> {
  await apiDelete(options, `/api/boards/${id}`);
}
