'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, resetPassword as resetPasswordApi } from 'common';
import { FormError, AuthLink } from '../_components';
import { useLanguage } from 'common/utils';

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
      <div className="flex items-center justify-center py-12">
        <p className="text-neutral-400">{t('common.loading')}</p>
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
      setError(err instanceof Error ? err.message : t('auth.reset.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <h1 className="text-2xl font-bold text-white">{t('auth.reset.doneTitle')}</h1>
        <p className="text-neutral-400 text-sm">{t('auth.reset.doneDesc')}</p>
        <AuthLink href="/login">{t('auth.login.title')}</AuthLink>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">{t('auth.reset.title')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <Input
          label={t('form.label.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={256}
          autoComplete="email"
        />
        <Input
          label={t('auth.reset.verifyCode')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={50}
          placeholder={t('auth.reset.verifyCodePlaceholder')}
        />
        <Input
          label={t('auth.reset.newPassword')}
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          placeholder={t('auth.reset.passwordPlaceholder')}
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('auth.reset.submitting') : t('auth.reset.submit')}
        </Button>
      </form>
      <div className="flex justify-center pt-2">
        <AuthLink href="/login">{t('auth.login.title')}</AuthLink>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-400">...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
