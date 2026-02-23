'use client';

import { useEffect, useState } from 'react';
import { getMe, setProfileImage, clearProfileImage, updateUser } from 'common/services';
import { SingleImageField } from 'common/components';
import { Avatar, Badge } from 'common/ui';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { User } from 'common/types';
import { useLanguage } from 'common/utils';

export default function ProfilePage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // 이름 / 닉네임 수정
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const loadMe = () => {
    getMe(options)
      .then((data) => {
        setMe(data);
        setName(data.name);
        setNickname(data.nickname);
      })
      .catch(() => setMessage({ type: 'error', text: t('user.profile.loadFailed') }));
  };

  useEffect(() => {
    let done = false;
    getMe(options)
      .then((data) => {
        if (!done) {
          setMe(data);
          setName(data.name);
          setNickname(data.nickname);
        }
      })
      .catch(() => {
        if (!done) setMessage({ type: 'error', text: t('user.profile.loadFailed') });
      })
      .finally(() => {
        if (!done) setLoading(false);
      });
    return () => {
      done = true;
    };
  }, [options.baseUrl, options.channel]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setMessage(null);
    setSavingInfo(true);
    try {
      await updateUser(options, me.id, { name: name.trim(), nickname: nickname.trim() });
      setMessage({ type: 'ok', text: t('user.profile.saved') });
      loadMe();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : t('user.profile.saveFailed') });
    } finally {
      setSavingInfo(false);
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

  const roleVariant = (role?: string) => {
    if (role === 'admin') return 'error' as const;
    return 'default' as const;
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('user.profile.myProfile')}</h1>

      {message && (
        <p className={`mb-4 text-sm ${message.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
      ) : !me ? (
        <p className="text-sm text-muted-foreground">{t('user.profile.notFound')}</p>
      ) : (
        <>
          {/* 기본 정보 */}
          <section className="max-w-xl rounded-lg border border-border bg-card p-6 mb-6">
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
                {me.role && (
                  <div className="mt-1">
                    <Badge variant={roleVariant(me.role)}>{me.role}</Badge>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* 이름 / 닉네임 수정 */}
          <section className="max-w-xl rounded-lg border border-border bg-card p-6 mb-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t('user.profile.basicInfo')}</h2>
            <form onSubmit={handleSaveInfo} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-300">{t('form.label.name')}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={20}
                  className="rounded border border-[#444] bg-[#181818] px-3 py-2 text-foreground focus:border-[#666] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-300">{t('form.label.nickname')}</span>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  maxLength={20}
                  className="rounded border border-[#444] bg-[#181818] px-3 py-2 text-foreground focus:border-[#666] focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={savingInfo}
                className="self-start rounded border border-[#555] bg-[#333] px-4 py-2 text-sm font-medium text-foreground hover:bg-[#444] disabled:opacity-50"
              >
                {savingInfo ? t('common.saving') : t('ui.button.save')}
              </button>
            </form>
          </section>

          {/* 프로필 이미지 */}
          <section className="max-w-xl rounded-lg border border-border bg-card p-6 mb-6">
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

          {/* 비밀번호 변경 */}
          <section className="max-w-xl rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">{t('user.profile.changePassword')}</h2>
            <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-300">{t('user.profile.currentPassword')}</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="rounded border border-[#444] bg-[#181818] px-3 py-2 text-foreground focus:border-[#666] focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-gray-300">{t('auth.reset.newPassword')}</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  maxLength={100}
                  autoComplete="new-password"
                  placeholder={t('auth.reset.passwordPlaceholder')}
                  className="rounded border border-[#444] bg-[#181818] px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-[#666] focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={savingPassword}
                className="self-start rounded border border-[#555] bg-[#333] px-4 py-2 text-sm font-medium text-foreground hover:bg-[#444] disabled:opacity-50"
              >
                {savingPassword ? t('user.profile.changingPassword') : t('user.profile.changePassword')}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
