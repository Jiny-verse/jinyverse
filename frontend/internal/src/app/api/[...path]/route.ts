import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL || process.env.API_BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}
export async function OPTIONS(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(request, await params);
}

async function proxy(request: NextRequest, { path }: { path: string[] }) {
  const pathname = path?.length ? path.join('/') : '';
  const url = new URL(`/api/${pathname}`, BACKEND);
  request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  const headers = new Headers();
  request.headers.forEach((v, k) => {
    const lower = k.toLowerCase();
    if (lower === 'host' || lower === 'connection') return;
    headers.set(k, v);
  });

  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();
  const res = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
  });

  const nextRes = new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
  });
  res.headers.forEach((v, k) => {
    if (k.toLowerCase() === 'set-cookie') return;
    nextRes.headers.set(k, v);
  });
  const setCookies = (res.headers as Headers & { getSetCookie?(): string[] }).getSetCookie?.();
  if (setCookies?.length) {
    setCookies.forEach((c) => nextRes.headers.append('Set-Cookie', c));
  } else {
    const sc = res.headers.get('set-cookie');
    if (sc) nextRes.headers.set('Set-Cookie', sc);
  }
  return nextRes;
}
