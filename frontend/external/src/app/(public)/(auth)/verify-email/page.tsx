'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, verifyEmail as verifyEmailApi } from 'common';
import { FormError, AuthLink } from '../_components';
import { useLanguage } from 'common/utils';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { baseUrl, user, isLoading } = useAuth();
  const { t } = useLanguage();
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
      await verifyEmailApi(baseUrl, { email, code });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.verify.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <h1 className="text-2xl font-bold text-white">{t('auth.verify.title')}</h1>
        <p className="text-neutral-400 text-sm">{t('auth.verify.description')}</p>
        <AuthLink href="/login">{t('auth.login.title')}</AuthLink>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">{t('auth.verify.title')}</h1>
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
          label={t('auth.verify.code')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={50}
          placeholder={t('auth.verify.codePlaceholder')}
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('auth.verify.submitting') : t('auth.verify.submit')}
        </Button>
      </form>
      <div className="flex justify-center pt-2">
        <AuthLink href="/login">{t('auth.login.title')}</AuthLink>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <p className="text-neutral-400">...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
