'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, verifyEmail as verifyEmailApi } from 'common';
import { FormError, AuthLink } from '../_components';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { baseUrl, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get('email');
    const qCode = searchParams.get('code');
    if (qEmail) setEmail(qEmail);
    if (qCode) setCode(qCode);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-400">로딩 중...</p>
      </div>
    );
  }
  if (user) {
    router.replace('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await verifyEmailApi(baseUrl, { email, code });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <h1 className="text-2xl font-bold text-white">이메일 인증 완료</h1>
        <p className="text-neutral-400 text-sm">이메일 인증이 완료되었습니다. 로그인해 주세요.</p>
        <AuthLink href="/login">로그인</AuthLink>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">이메일 인증</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={256}
          autoComplete="email"
        />
        <Input
          label="인증 코드"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={50}
          placeholder="이메일로 받은 6자리 코드"
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? '인증 중...' : '인증하기'}
        </Button>
      </form>
      <div className="flex justify-center pt-2">
        <AuthLink href="/login">로그인</AuthLink>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-400">로딩 중...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
