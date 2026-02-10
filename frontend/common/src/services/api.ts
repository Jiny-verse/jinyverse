import type { ApiOptions } from '../types/api';

const CREDENTIALS: RequestCredentials = 'include';

const headers = (options: ApiOptions): HeadersInit => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Channel': options.channel,
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (options.role) {
    h['X-Role'] = options.role;
  }
  return h;
};

const buildUrl = (
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
) => {
  if (!baseUrl) {
    const pathname = path.startsWith('/') ? path : `/${path}`;
    if (!params) return pathname;
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') search.set(k, String(v));
    });
    const q = search.toString();
    return q ? `${pathname}?${q}` : pathname;
  }
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }
  return url.toString();
};

export async function apiGet<T>(
  options: ApiOptions,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const url = buildUrl(options.baseUrl, path, params);
  const res = await fetch(url, { method: 'GET', headers: headers(options), credentials: CREDENTIALS });
  if (res.status === 401) {
    options.on401?.();
  }
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${body || res.url}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(options: ApiOptions, path: string, body: unknown): Promise<T> {
  const url = buildUrl(options.baseUrl, path);
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(options),
    body: JSON.stringify(body),
    credentials: CREDENTIALS,
  });
  if (res.status === 401) {
    options.on401?.();
  }
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${body || res.url}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function apiPut<T>(options: ApiOptions, path: string, body: unknown): Promise<T> {
  const url = buildUrl(options.baseUrl, path);
  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(options),
    body: JSON.stringify(body),
    credentials: CREDENTIALS,
  });
  if (res.status === 401) {
    options.on401?.();
  }
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${body || res.url}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function apiDelete(options: ApiOptions, path: string): Promise<void> {
  const url = buildUrl(options.baseUrl, path);
  const res = await fetch(url, { method: 'DELETE', headers: headers(options), credentials: CREDENTIALS });
  if (res.status === 401) {
    options.on401?.();
  }
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${body || res.url}`);
  }
}
