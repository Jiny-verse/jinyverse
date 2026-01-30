import type { ApiOptions } from '../types/api';

const headers = (options: ApiOptions): HeadersInit => {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Channel': options.channel,
  };
  if (options.role) {
    h['X-Role'] = options.role;
  }
  return h;
};

const buildUrl = (baseUrl: string, path: string, params?: Record<string, string | number | boolean | undefined>) => {
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

export async function apiGet<T>(options: ApiOptions, path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = buildUrl(options.baseUrl, path, params);
  const res = await fetch(url, { method: 'GET', headers: headers(options) });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => res.statusText));
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(options: ApiOptions, path: string, body: unknown): Promise<T> {
  const url = buildUrl(options.baseUrl, path);
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(options),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => res.statusText));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function apiDelete(options: ApiOptions, path: string): Promise<void> {
  const url = buildUrl(options.baseUrl, path);
  const res = await fetch(url, { method: 'DELETE', headers: headers(options) });
  if (!res.ok) {
    throw new Error(await res.text().catch(() => res.statusText));
  }
}
