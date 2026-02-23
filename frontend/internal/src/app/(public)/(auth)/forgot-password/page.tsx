'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, requestPasswordReset as requestPasswordResetApi } from 'common';
import { useLanguage } from 'common/utils';
import { FormError, AuthLink } from '../_components';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { baseUrl, user, isLoading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading', { defaultValue: '로딩 중...' })}</p>
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
      await requestPasswordResetApi(baseUrl, { email });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.forgot.failed', { defaultValue: '요청에 실패했습니다.' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const resetHref = `/reset-password?email=${encodeURIComponent(email)}`;
    return (
      <>
        <h1 className="text-2xl font-bold text-foreground">{t('auth.forgot.done.title', { defaultValue: '비밀번호 재설정 메일 발송' })}</h1>
        <p className="text-muted-foreground text-sm">
          {t('auth.forgot.done.desc', { defaultValue: '{{email}}로 비밀번호 재설정 메일을 보냈습니다. 메일의 링크 또는 코드로 새 비밀번호를 설정해 주세요.', email })}
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <AuthLink href={resetHref}>{t('auth.reset.title', { defaultValue: '비밀번호 재설정하기' })}</AuthLink>
          <AuthLink href="/login">{t('auth.login.title', { defaultValue: '로그인' })}</AuthLink>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">{t('auth.forgot.title', { defaultValue: '비밀번호 찾기' })}</h1>
      <p className="text-muted-foreground text-sm">{t('auth.forgot.desc', { defaultValue: '가입 시 사용한 이메일을 입력하면 재설정 링크를 보내드립니다.' })}</p>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <FormError message={error} />
        <Input
          label={t('form.label.email', { defaultValue: '이메일' })}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={256}
          autoComplete="email"
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('auth.forgot.submitting', { defaultValue: '발송 중...' }) : t('auth.forgot.action', { defaultValue: '재설정 메일 받기' })}
        </Button>
      </form>
      <div className="flex justify-center pt-2">
        <AuthLink href="/login">{t('auth.login.title', { defaultValue: '로그인' })}</AuthLink>
      </div>
    </>
  );
}
