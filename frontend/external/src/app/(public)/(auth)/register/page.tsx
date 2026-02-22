'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input, Checkbox } from 'common/ui';
import { useAuth, register as registerApi } from 'common';
import { FormError, AuthLink } from '../_components';
import { useLanguage } from 'common/utils';

export default function RegisterPage() {
  const router = useRouter();
  const { baseUrl, user, isLoading } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [agreed, setAgreed] = useState(false);
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
    if (!agreed) {
      setError(t('auth.register.agreeError'));
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await registerApi(baseUrl, { username, password, email, name, nickname });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.register.error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const verifyHref = `/verify-email?email=${encodeURIComponent(email)}`;
    return (
      <>
        <h1 className="text-2xl font-bold text-white">{t('auth.verify.title')}</h1>
        <p className="text-neutral-400 text-sm">
          {t('auth.register.verifyEmailSent', { email })}
        </p>
        <div className="flex flex-col gap-2">
          <AuthLink href={verifyHref}>{t('auth.register.verifyEmailLink')}</AuthLink>
          <AuthLink href="/login">{t('auth.login.title')}</AuthLink>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">{t('auth.register.title')}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <Input
          label={t('form.label.username')}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={50}
          autoComplete="username"
        />
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
          label={t('form.label.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          placeholder={t('auth.reset.passwordPlaceholder')}
        />
        <Input
          label={t('form.label.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={20}
          autoComplete="name"
        />
        <Input
          label={t('form.label.nickname')}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          maxLength={20}
          autoComplete="nickname"
        />
        <Checkbox
          label={t('auth.register.agreeLabel')}
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
      </form>
      <div className="flex justify-center gap-4 pt-2">
        <AuthLink href="/login">{t('auth.login.title')}</AuthLink>
      </div>
    </>
  );
}
