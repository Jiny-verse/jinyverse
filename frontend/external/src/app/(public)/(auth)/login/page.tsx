'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, type LoginRequest } from 'common';
import { FormError, AuthLink } from '../_components';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      router.replace('/');
      return;
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ username, password } as LoginRequest);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">로그인</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <Input
          label="사용자명"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={50}
          autoComplete="username"
        />
        <Input
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="current-password"
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>
      <div className="flex justify-center gap-4 pt-2">
        <AuthLink href="/forgot-password">비밀번호 찾기</AuthLink>
        <AuthLink href="/register">회원가입</AuthLink>
      </div>
    </>
  );
}
