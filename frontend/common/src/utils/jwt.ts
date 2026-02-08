/**
 * JWT payload에서 exp(만료 시각, 초 단위) 추출. 클라이언트는 서명 검증 없이 만료 체크만 수행.
 */
export function getExpFromToken(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded) as { exp?: number };
    return typeof parsed.exp === 'number' ? parsed.exp : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, bufferSeconds = 0): boolean {
  const exp = getExpFromToken(token);
  if (exp == null) return true;
  return exp * 1000 < Date.now() + bufferSeconds * 1000;
}
