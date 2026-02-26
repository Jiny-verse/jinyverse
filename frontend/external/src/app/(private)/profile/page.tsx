'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'common';
import { getMe, setProfileImage, clearProfileImage, updateUser } from 'common/services';
import { SingleImageField } from 'common/components';
import { Avatar } from 'common/ui';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { User } from 'common/types';
import { useLanguage } from 'common/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const options = useApiOptions();
  const { t } = useLanguage();

  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [nickname, setNickname] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.replace('/login');
      return;
    }
    let done = false;
    getMe(options)
      .then((data) => {
        if (!done) {
          setMe(data);
          setNickname(data.nickname);
        }
      })
      .catch(() => {
        if (!done) setMessage({ type: 'error', text: t('user.profile.loadFailed') });
      })
      .finally(() => {
        if (!done) setLoading(false);
      });
    return () => { done = true; };
  }, [authUser, authLoading, options.baseUrl, options.channel]);

  const loadMe = () => {
    getMe(options)
      .then((data) => { setMe(data); setNickname(data.nickname); })
      .catch(() => setMessage({ type: 'error', text: t('user.profile.loadFailed') }));
  };

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setMessage(null);
    setSavingNickname(true);
    try {
      await updateUser(options, me.id, { nickname: nickname.trim() });
      setMessage({ type: 'ok', text: t('user.profile.nicknameChanged') });
      loadMe();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : t('user.profile.nicknameChangeFailed') });
    } finally {
      setSavingNickname(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setMessage(null);
    setSavingPassword(true);
    try {
      await updateUser(options, me.id, { currentPassword, password: newPassword });
      setMessage({ type: 'ok', text: t('user.profile.passwordChanged') });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : t('user.profile.passwordChangeFailed') });
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">{t('user.profile.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('user.profile.myProfile')}</h1>

      {message && (
        <p className={`mb-4 text-sm ${message.type === 'ok' ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}

      {/* 기본 정보 */}
      <section className="mb-6 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar
            fileId={me.profileImageFileId}
            apiOptions={options}
            alt={me.nickname}
            size="lg"
          />
          <div>
            <p className="text-foreground font-semibold">{me.name}</p>
            <p className="text-muted-foreground text-sm">@{me.username}</p>
            <p className="text-muted-foreground text-sm">{me.email}</p>
            {me.createdAt && (
              <p className="text-muted-foreground text-xs mt-1">
                {t('user.profile.joinedAt', { date: new Date(me.createdAt).toLocaleDateString() })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 프로필 이미지 */}
      <section className="mb-6 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">{t('user.profile.image')}</h2>
        <SingleImageField
          apiOptions={options}
          value={me.profileImageFileId ?? null}
          onChange={async (fileId) => {
            setMessage(null);
            try {
              if (fileId) {
                await setProfileImage(options, fileId);
              } else {
                await clearProfileImage(options);
              }
              loadMe();
            } catch (err) {
              setMessage({ type: 'error', text: err instanceof Error ? err.message : t('user.profile.imageChangeFailed') });
            }
          }}
          uploadLabel={t('ui.button.upload')}
          showRemove={true}
          onError={(e) => setMessage({ type: 'error', text: t('user.profile.imageSetFailed', { msg: e.message }) })}
        />
      </section>

      {/* 닉네임 수정 */}
      <section className="mb-6 rounded-lg border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">{t('user.profile.editNickname')}</h2>
        <form onSubmit={handleSaveNickname} className="flex gap-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength={20}
            className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={savingNickname}
            className="rounded border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80 disabled:opacity-50"
          >
            {savingNickname ? t('common.saving') : t('ui.button.save')}
          </button>
        </form>
      </section>

      {/* 비밀번호 변경 */}
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">{t('user.profile.changePassword')}</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">{t('user.profile.currentPassword')}</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">{t('auth.reset.newPassword')}</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              placeholder={t('auth.reset.passwordPlaceholder')}
              className="rounded border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </label>
          <button
            type="submit"
            disabled={savingPassword}
            className="self-start rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {savingPassword ? t('user.profile.changingPassword') : t('user.profile.changePassword')}
          </button>
        </form>
      </section>
    </div>
  );
}
