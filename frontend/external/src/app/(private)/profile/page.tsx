'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'common';
import { getMe, setProfileImage, clearProfileImage, updateUser } from 'common/services';
import { SingleImageField } from 'common/components';
import { Avatar } from 'common/ui';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { User } from 'common/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const options = useApiOptions();

  const [me, setMe] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // 닉네임 수정
  const [nickname, setNickname] = useState('');
  const [savingNickname, setSavingNickname] = useState(false);

  // 비밀번호 변경
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
        if (!done) setMessage({ type: 'error', text: '프로필을 불러오지 못했습니다.' });
      })
      .finally(() => {
        if (!done) setLoading(false);
      });
    return () => {
      done = true;
    };
  }, [authUser, authLoading, options.baseUrl, options.channel]);

  const loadMe = () => {
    getMe(options)
      .then((data) => {
        setMe(data);
        setNickname(data.nickname);
      })
      .catch(() => setMessage({ type: 'error', text: '프로필을 불러오지 못했습니다.' }));
  };

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setMessage(null);
    setSavingNickname(true);
    try {
      await updateUser(options, me.id, { nickname: nickname.trim() });
      setMessage({ type: 'ok', text: '닉네임이 변경되었습니다.' });
      loadMe();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '닉네임 변경에 실패했습니다.' });
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
      setMessage({ type: 'ok', text: '비밀번호가 변경되었습니다.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-400">로딩 중...</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-400">프로필을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-white">내 프로필</h1>

      {message && (
        <p className={`mb-4 text-sm ${message.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}

      {/* 기본 정보 */}
      <section className="mb-6 rounded-lg border border-[#333] bg-[#1f1f1f] p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar
            fileId={me.profileImageFileId}
            apiOptions={options}
            alt={me.nickname}
            size="lg"
          />
          <div>
            <p className="text-white font-semibold">{me.name}</p>
            <p className="text-neutral-400 text-sm">@{me.username}</p>
            <p className="text-neutral-400 text-sm">{me.email}</p>
            {me.createdAt && (
              <p className="text-neutral-500 text-xs mt-1">
                가입일: {new Date(me.createdAt).toLocaleDateString('ko-KR')}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 프로필 이미지 */}
      <section className="mb-6 rounded-lg border border-[#333] bg-[#1f1f1f] p-6">
        <h2 className="mb-3 text-lg font-semibold text-white">프로필 이미지</h2>
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
              setMessage({ type: 'error', text: err instanceof Error ? err.message : '이미지 변경에 실패했습니다.' });
            }
          }}
          uploadLabel="업로드"
          showRemove={true}
          onError={(e) => setMessage({ type: 'error', text: `이미지 설정 실패: ${e.message}` })}
        />
      </section>

      {/* 닉네임 수정 */}
      <section className="mb-6 rounded-lg border border-[#333] bg-[#1f1f1f] p-6">
        <h2 className="mb-3 text-lg font-semibold text-white">닉네임 수정</h2>
        <form onSubmit={handleSaveNickname} className="flex gap-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength={20}
            className="flex-1 rounded border border-[#444] bg-[#181818] px-3 py-2 text-white placeholder:text-gray-500 focus:border-[#666] focus:outline-none"
          />
          <button
            type="submit"
            disabled={savingNickname}
            className="rounded border border-[#555] bg-[#333] px-4 py-2 text-sm font-medium text-white hover:bg-[#444] disabled:opacity-50"
          >
            {savingNickname ? '저장 중...' : '저장'}
          </button>
        </form>
      </section>

      {/* 비밀번호 변경 */}
      <section className="rounded-lg border border-[#333] bg-[#1f1f1f] p-6">
        <h2 className="mb-3 text-lg font-semibold text-white">비밀번호 변경</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-300">현재 비밀번호</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded border border-[#444] bg-[#181818] px-3 py-2 text-white focus:border-[#666] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-300">새 비밀번호</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              className="rounded border border-[#444] bg-[#181818] px-3 py-2 text-white placeholder:text-gray-500 focus:border-[#666] focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={savingPassword}
            className="self-start rounded border border-[#555] bg-[#333] px-4 py-2 text-sm font-medium text-white hover:bg-[#444] disabled:opacity-50"
          >
            {savingPassword ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>
      </section>
    </div>
  );
}
