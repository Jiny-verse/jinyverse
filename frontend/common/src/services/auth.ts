import {
  loginRequestSchema,
  loginResponseSchema,
  registerRequestSchema,
  verifyEmailRequestSchema,
  requestPasswordResetSchema,
  resetPasswordRequestSchema,
} from '../schemas/auth';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  VerifyEmailRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from '../schemas/auth';

const JSON_HEADERS: HeadersInit = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};
const FETCH_CREDENTIALS: RequestCredentials = 'include';

export async function login(baseUrl: string, body: LoginRequest): Promise<LoginResponse> {
  const parsed = loginRequestSchema.parse(body);
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(parsed),
    credentials: FETCH_CREDENTIALS,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  const data = await res.json();
  return loginResponseSchema.parse(data);
}

export async function refresh(baseUrl: string): Promise<LoginResponse> {
  const res = await fetch(`${baseUrl}/api/auth/refresh`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: '{}',
    credentials: FETCH_CREDENTIALS,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  const data = await res.json();
  return loginResponseSchema.parse(data);
}

export async function logout(baseUrl: string): Promise<void> {
  const res = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: '{}',
    credentials: FETCH_CREDENTIALS,
  });
  if (!res.ok && res.status !== 401) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
}

export async function me(baseUrl: string): Promise<LoginResponse | null> {
  const res = await fetch(`${baseUrl}/api/auth/me`, {
    method: 'GET',
    credentials: FETCH_CREDENTIALS,
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  const data = await res.json();
  return loginResponseSchema.parse(data);
}

export async function register(baseUrl: string, body: RegisterRequest): Promise<void> {
  const parsed = registerRequestSchema.parse(body);
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(parsed),
    credentials: FETCH_CREDENTIALS,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
}

export async function verifyEmail(baseUrl: string, body: VerifyEmailRequest): Promise<void> {
  const parsed = verifyEmailRequestSchema.parse(body);
  const res = await fetch(`${baseUrl}/api/auth/verify-email`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(parsed),
    credentials: FETCH_CREDENTIALS,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
}

export async function requestPasswordReset(
  baseUrl: string,
  body: RequestPasswordResetRequest
): Promise<void> {
  const parsed = requestPasswordResetSchema.parse(body);
  const res = await fetch(`${baseUrl}/api/auth/request-password-reset`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(parsed),
    credentials: FETCH_CREDENTIALS,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
}

export async function resetPassword(baseUrl: string, body: ResetPasswordRequest): Promise<void> {
  const parsed = resetPasswordRequestSchema.parse(body);
  const res = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(parsed),
    credentials: FETCH_CREDENTIALS,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
}
