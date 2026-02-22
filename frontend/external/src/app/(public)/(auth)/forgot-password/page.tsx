'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, requestPasswordReset as requestPasswordResetApi } from 'common';
import { FormError, AuthLink } from '../_components';
import { useLanguage } from 'common/utils';

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
      await requestPasswordResetApi(baseUrl, { email });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.forgot.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const resetHref = `/reset-password?email=${encodeURIComponent(email)}`;
    return (
      <>
        <h1 className="text-2xl font-bold text-white">{t('auth.forgot.sentTitle')}</h1>
        <p className="text-neutral-400 text-sm">
          {t('auth.forgot.sentDesc', { email })}
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <AuthLink href={resetHref}>{t('auth.forgot.resetLink')}</AuthLink>
          <AuthLink href="/login">{t('auth.login.title')}</AuthLink>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">{t('auth.forgot.title')}</h1>
      <p className="text-neutral-400 text-sm">{t('auth.forgot.description')}</p>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
        </Button>
      </form>
      <div className="flex justify-center pt-2">
        <AuthLink href="/login">{t('auth.login.title')}</AuthLink>
      </div>
    </>
  );
}
