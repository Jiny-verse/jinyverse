import { z } from 'zod';
import {
  menuSchema,
  menuCreateSchema,
  menuUpdateSchema,
  menuFilterSchema,
  pageResponseSchema,
  paginationSchema,
} from '../schemas';
import type { ApiOptions } from '../types/api';
import type { Menu, MenuCreateInput, MenuUpdateInput, MenuFilter } from '../types/api';
import { apiGet, apiPost, apiDelete } from './api';

type MenuPageResponse = {
  content: Menu[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

const menuPageSchema = pageResponseSchema(menuSchema);

type ListMenusParams = { page?: number; size?: number; sort?: string; q?: string } & MenuFilter;

function toQuery(params: ListMenusParams): Record<string, string | number | boolean | undefined> {
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

const listMenusParamsSchema = paginationSchema
  .merge(menuFilterSchema)
  .extend({ q: z.string().optional() })
  .partial();

export async function getMenus(
  options: ApiOptions,
  params: ListMenusParams = {}
): Promise<MenuPageResponse> {
  const parsed = listMenusParamsSchema.parse(params);
  const data = await apiGet<MenuPageResponse>(options, '/api/menus', toQuery(parsed));
  const first = Array.isArray(data?.content) ? data.content[0] : null;
  console.log('[MenuDebug] getMenus raw 응답', {
    contentLength: data?.content?.length ?? 0,
    firstItemKeys: first ? Object.keys(first) : [],
    firstItemId: first != null ? (first as Record<string, unknown>).id : undefined,
    firstItemUpperId: first != null ? (first as Record<string, unknown>).upperId : undefined,
  });
  try {
    return menuPageSchema.parse(data) as MenuPageResponse;
  } catch (e) {
    console.error('[MenuDebug] getMenus parse 실패', e);
    throw e;
  }
}

export async function getMenusForManagement(
  options: ApiOptions,
  params: ListMenusParams = {}
): Promise<MenuPageResponse> {
  const parsed = listMenusParamsSchema.parse(params);
  const data = await apiGet<MenuPageResponse>(options, '/api/admin/menus', toQuery(parsed));
  return menuPageSchema.parse(data) as MenuPageResponse;
}

export async function getMenu(options: ApiOptions, code: string): Promise<Menu> {
  const data = await apiGet<Menu>(options, `/api/menus/${encodeURIComponent(code)}`);
  return menuSchema.parse(data);
}

export async function createMenu(options: ApiOptions, body: MenuCreateInput): Promise<Menu> {
  const parsed = menuCreateSchema.parse(body);
  const data = await apiPost<Menu>(options, '/api/menus', parsed);
  return menuSchema.parse(data);
}

export async function updateMenu(
  options: ApiOptions,
  code: string,
  body: MenuUpdateInput
): Promise<Menu> {
  const parsed = menuUpdateSchema.parse(body);
  const data = await apiPost<Menu>(options, `/api/menus/${encodeURIComponent(code)}`, parsed);
  return menuSchema.parse(data);
}

export async function deleteMenu(options: ApiOptions, code: string): Promise<void> {
  await apiDelete(options, `/api/menus/${encodeURIComponent(code)}`);
}

/** 메뉴 클릭 시 이동: board(게시판 리스트), topic(게시글), link(메뉴 기본 경로) */
export type MenuResolve = {
  type: 'board' | 'topic' | 'link';
  boardId?: string;
  topicId?: string;
  path?: string;
};

/** 메뉴 코드로 이동 대상 조회. 404 시 null */
export async function getMenuResolve(
  options: ApiOptions,
  code: string
): Promise<MenuResolve | null> {
  const base = options.baseUrl?.trim() || '';
  const path = `/api/menus/${encodeURIComponent(code)}/resolve`;
  const url = base ? `${base.replace(/\/$/, '')}${path}` : path;
  const res = await fetch(url, {
    headers: {
      'X-Channel': options.channel,
      'X-Requested-With': 'XMLHttpRequest',
    },
    credentials: 'include',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${body}`);
  }
  const data = await res.json();
  return {
    type: data.type,
    boardId: data.boardId,
    topicId: data.topicId,
    path: data.path,
  };
}
