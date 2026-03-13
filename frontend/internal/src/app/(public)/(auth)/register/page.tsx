'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, register as registerApi, checkUsername as checkUsernameApi } from 'common';
import { useLanguage, parseApiError } from 'common/utils';
import { FormError, AuthLink } from '../_components';

export default function RegisterPage() {
  const router = useRouter();
  const { baseUrl, user, isLoading } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState({ type: '', text: '' });
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

  const handleCheckUsername = async () => {
    if (!username) {
      setUsernameMessage({ type: 'error', text: t('auth.register.usernameRequired', { defaultValue: '아이디를 입력해주세요.' }) });
      return;
    }
    setCheckingUsername(true);
    setUsernameMessage({ type: '', text: '' });
    try {
      await checkUsernameApi(baseUrl, username);
      setIsUsernameChecked(true);
      setUsernameMessage({ type: 'success', text: t('auth.register.usernameAvailable', { defaultValue: '사용 가능한 아이디입니다.' }) });
    } catch (err) {
      setIsUsernameChecked(false);
      setUsernameMessage({ type: 'error', text: t('auth.register.usernameDuplicate', { defaultValue: '이미 사용 중인 아이디입니다.' }) });
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsernameChecked) {
      setError(t('auth.register.usernameNotChecked', { defaultValue: '아이디 중복 확인을 진행해주세요.' }));
      return;
    }
    if (password !== passwordConfirm) {
      setError(t('validation.passwordMismatch', { defaultValue: '비밀번호가 일치하지 않습니다.' }));
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
        <h1 className="text-2xl font-bold text-foreground">{t('auth.verify.title', { defaultValue: '이메일 인증' })}</h1>
        <p className="text-muted-foreground text-sm">
          {t('auth.register.done.desc', { defaultValue: '가입하신 이메일({{email}})로 인증 메일을 보냈습니다. 메일의 인증 코드를 입력해 주세요.', email })}
        </p>
        <div className="flex flex-col gap-2">
          <AuthLink href={verifyHref}>{t('auth.verify.action', { defaultValue: '이메일 인증하기' })}</AuthLink>
          <AuthLink href="/login">{t('auth.login.title', { defaultValue: '로그인' })}</AuthLink>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground">{t('auth.register.title', { defaultValue: '회원가입' })}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label={t('form.label.username', { defaultValue: '아이디' })}
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
              {t('auth.register.checkDuplicate', { defaultValue: '중복 확인' })}
            </Button>
          </div>
          {usernameMessage.text && (
            <p className={`text-sm mt-1 px-1 ${usernameMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {usernameMessage.text}
            </p>
          )}
        </div>
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
          label={t('form.label.password', { defaultValue: '비밀번호' })}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          placeholder={t('auth.reset.passwordPlaceholder', { defaultValue: '영문, 숫자, 특수문자 포함 8자 이상' })}
        />
        <Input
          label={t('form.label.passwordConfirm', { defaultValue: '비밀번호 확인' })}
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          required
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
          placeholder={t('auth.reset.passwordConfirmPlaceholder', { defaultValue: '비밀번호를 다시 입력해주세요' })}
        />
        <Input
          label={t('form.label.name', { defaultValue: '이름' })}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={20}
          autoComplete="name"
        />
        <Input
          label={t('form.label.nickname', { defaultValue: '닉네임' })}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          maxLength={20}
          autoComplete="nickname"
        />
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? t('auth.register.submitting', { defaultValue: '가입 중...' }) : t('auth.register.action', { defaultValue: '가입하기' })}
        </Button>
      </form>
      <div className="flex justify-center gap-4 pt-2">
        <AuthLink href="/login">{t('auth.login.title', { defaultValue: '로그인' })}</AuthLink>
      </div>
    </>
  );
}
