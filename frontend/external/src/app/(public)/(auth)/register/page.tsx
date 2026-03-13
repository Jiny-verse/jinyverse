'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input, Checkbox } from 'common/ui';
import { useAuth, register as registerApi, checkUsername as checkUsernameApi } from 'common';
import { FormError, AuthLink } from '../_components';
import { useLanguage, parseApiError } from 'common/utils';

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
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState({ type: '', text: '' });
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

  const handleCheckUsername = async () => {
    if (!username) {
      setUsernameMessage({ type: 'error', text: t('auth.register.usernameRequired') });
      return;
    }
    setCheckingUsername(true);
    setUsernameMessage({ type: '', text: '' });
    try {
      await checkUsernameApi(baseUrl, username);
      setIsUsernameChecked(true);
      setUsernameMessage({ type: 'success', text: t('auth.register.usernameAvailable') });
    } catch (err) {
      setIsUsernameChecked(false);
      setUsernameMessage({ type: 'error', text: t('auth.register.usernameDuplicate') });
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsernameChecked) {
      setError(t('auth.register.usernameNotChecked'));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t('validation.passwordMismatch'));
      return;
    }
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
      const { messageKey, fallback } = parseApiError(err);
      setError(t(messageKey) || fallback);
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
        <div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label={t('form.label.username')}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsUsernameChecked(false);
                  setUsernameMessage({ type: '', text: '' });
                }}
                required
                minLength={3}
                maxLength={50}
                autoComplete="username"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCheckUsername}
              disabled={checkingUsername || !username}
            >
              {t('auth.register.checkDuplicate')}
            </Button>
          </div>
          {usernameMessage.text && (
            <p className={`text-sm mt-1 px-1 ${usernameMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {usernameMessage.text}
            </p>
          )}
        </div>
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
          label={t('form.label.passwordConfirm')}
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          placeholder={t('auth.reset.passwordConfirmPlaceholder')}
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
