'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Input } from 'common/ui';
import { useAuth, register as registerApi } from 'common';
import { useLanguage } from 'common/utils';
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
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-neutral-400">{t('common.loading', { defaultValue: '로딩 중...' })}</p>
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
      await registerApi(baseUrl, { username, password, email, name, nickname });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.register.failed', { defaultValue: '회원가입에 실패했습니다.' }));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const verifyHref = `/verify-email?email=${encodeURIComponent(email)}`;
    return (
      <>
        <h1 className="text-2xl font-bold text-white">{t('auth.verify.title', { defaultValue: '이메일 인증' })}</h1>
        <p className="text-neutral-400 text-sm">
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
      <h1 className="text-2xl font-bold text-white">{t('auth.register.title', { defaultValue: '회원가입' })}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <Input
          label={t('form.label.username', { defaultValue: '사용자명' })}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
          maxLength={50}
          autoComplete="username"
        />
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
