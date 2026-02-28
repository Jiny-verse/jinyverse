'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, resetPassword as resetPasswordApi } from 'common';
import { useLanguage, parseApiError } from 'common/utils';
import { FormError, AuthLink } from '../_components';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { baseUrl, user, isLoading } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
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
      await resetPasswordApi(baseUrl, { email, code, newPassword });
      setDone(true);
    } catch (err) {
      const { messageKey, fallback } = parseApiError(err);
      setError(t(messageKey) || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <h1 className="text-2xl font-bold text-foreground">{t('auth.reset.done.title', { defaultValue: '비밀번호 재설정 완료' })}</h1>
        <p className="text-muted-foreground text-sm">{t('auth.reset.done.desc', { defaultValue: '비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.' })}</p>
        <AuthLink href="/login">{t('auth.login.title', { defaultValue: '로그인' })}</AuthLink>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">{t('auth.reset.title', { defaultValue: '비밀번호 재설정' })}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <Input
          label={t('form.label.code', { defaultValue: '인증 코드' })}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={50}
          placeholder={t('form.placeholder.code', { defaultValue: '이메일로 받은 코드' })}
        />
        <Input
          label={t('auth.reset.newPassword', { defaultValue: '새 비밀번호' })}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          placeholder={t('auth.reset.passwordPlaceholder', { defaultValue: '영문, 숫자, 특수문자 포함 8자 이상' })}
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('common.saving', { defaultValue: '재설정 중...' }) : t('user.profile.changePassword', { defaultValue: '비밀번호 변경' })}
        </Button>
      </form>
      <div className="flex justify-center pt-2">
        <AuthLink href="/login">{t('auth.login.title', { defaultValue: '로그인' })}</AuthLink>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">{t('common.loading', { defaultValue: '로딩 중...' })}</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
