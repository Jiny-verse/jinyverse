/**
 * Converts an API error (thrown by api.ts) into a user-friendly i18n key.
 * api.ts throws errors in the format: "API {statusCode} {statusText}: {body}"
 */
export function parseApiError(err: unknown): {
  messageKey: string;
  fallback: string;
} {
  if (!(err instanceof Error)) {
    return { messageKey: 'error.unknown', fallback: '알 수 없는 오류가 발생했습니다.' };
  }

  const msg = err.message;

  // Match the format thrown by api.ts: "API 500 Internal Server Error: ..."
  const match = msg.match(/^API (\d+)/);
  if (match) {
    const status = parseInt(match[1], 10);
    const body = msg.split(':').slice(1).join(':').trim();

    if (status === 401) {
      if (body.includes('Invalid credentials')) {
        return { messageKey: 'error.loginFailed', fallback: '아이디 또는 비밀번호가 올바르지 않습니다.' };
      }
      return { messageKey: 'error.unauthorized', fallback: '로그인이 필요합니다.' };
    }
    if (status === 403) {
      if (body.includes('Account locked')) {
        return { messageKey: 'error.accountLocked', fallback: '계정이 잠겼습니다.' };
      }
      if (body.includes('Account disabled')) {
        return { messageKey: 'error.accountDisabled', fallback: '계정이 비활성화되었습니다.' };
      }
      return { messageKey: 'error.forbidden', fallback: '권한이 없습니다.' };
    }
    if (status === 404) return { messageKey: 'error.notFound', fallback: '요청한 항목을 찾을 수 없습니다.' };
    if (status === 409) return { messageKey: 'error.saveFailed', fallback: '이미 존재하는 데이터입니다.' };
    if (status === 429) return { messageKey: 'error.rateLimit', fallback: '요청이 너무 많습니다.' };
    if (status >= 500) {
      return {
        messageKey: 'error.serverError',
        fallback: '서버에 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      };
    }
  }

  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
    return { messageKey: 'error.networkError', fallback: '인터넷 연결을 확인해 주세요.' };
  }

  return { messageKey: 'error.unknown', fallback: '알 수 없는 오류가 발생했습니다.' };
}
