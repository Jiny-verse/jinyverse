'use client';

import { useEffect, useState } from 'react';
import {
  getFileStorageSetting,
  updateFileStorageSetting,
  getMe,
  setProfileImage,
  clearProfileImage,
  getThumbnailStatus,
  runThumbnailBackfill,
  type ThumbnailStatus,
} from 'common/services';
import { SingleImageField } from 'common/components';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { User } from 'common/types';
import { useLanguage } from 'common/utils';

export default function SettingsPage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  const [basePath, setBasePath] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [thumbnailStatus, setThumbnailStatus] = useState<ThumbnailStatus | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [backfillMessage, setBackfillMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const loadMe = () => {
    getMe(options)
      .then(setMe)
      .catch(() => setMe(null));
  };

  useEffect(() => {
    let done = false;
    Promise.all([
      getFileStorageSetting(options),
      getMe(options).catch(() => null),
      getThumbnailStatus(options).catch(() => null),
    ])
      .then(([res, user, thumbStatus]) => {
        if (!done) {
          setBasePath(res.basePath ?? '');
          setMe(user ?? null);
          setThumbnailStatus(thumbStatus ?? null);
        }
      })
      .catch(() => {
        if (!done) setMessage({ type: 'error', text: t('admin.setting.loadFailed') });
      })
      .finally(() => {
        if (!done) setLoading(false);
      });
    return () => {
      done = true;
    };
  }, [options.baseUrl, options.channel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      await updateFileStorageSetting(options, { basePath: basePath.trim() || null });
      setMessage({ type: 'ok', text: t('admin.setting.saved') });
    } catch {
      setMessage({ type: 'error', text: t('admin.setting.saveFailed') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{t('admin.setting.title')}</h1>

      <section className="max-w-xl rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t('admin.setting.fileStorage')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('admin.setting.fileStorageDesc')}
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-foreground">{t('admin.setting.savePath')}</span>
              <input
                type="text"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                placeholder="/var/jinyverse/uploads"
                className="rounded border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                maxLength={500}
              />
            </label>
            {message && (
              <p
                className={`text-sm ${message.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}
              >
                {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="self-start rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? t('common.saving') : t('ui.button.save')}
            </button>
          </form>
        )}
      </section>

      <section className="mt-8 max-w-xl rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">썸네일 관리</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          이미지 파일의 썸네일 생성 현황을 확인하고 미생성 파일을 일괄 처리합니다.
        </p>
        {thumbnailStatus && (
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded border border-border bg-background p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{thumbnailStatus.total}</div>
              <div className="text-xs text-muted-foreground mt-1">전체 이미지</div>
            </div>
            <div className="rounded border border-green-500/30 bg-green-500/10 p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{thumbnailStatus.withThumbnail}</div>
              <div className="text-xs text-muted-foreground mt-1">썸네일 생성됨</div>
            </div>
            <div className="rounded border border-orange-500/30 bg-orange-500/10 p-3 text-center">
              <div className="text-2xl font-bold text-orange-400">{thumbnailStatus.withoutThumbnail}</div>
              <div className="text-xs text-muted-foreground mt-1">미생성</div>
            </div>
          </div>
        )}
        {backfillMessage && (
          <p className={`mb-3 text-sm ${backfillMessage.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
            {backfillMessage.text}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={backfilling || thumbnailStatus?.withoutThumbnail === 0}
            onClick={async () => {
              setBackfilling(true);
              setBackfillMessage(null);
              try {
                await runThumbnailBackfill(options);
                setBackfillMessage({ type: 'ok', text: '백필 작업이 시작됐습니다. 잠시 후 새로고침하세요.' });
              } catch {
                setBackfillMessage({ type: 'error', text: '백필 실행에 실패했습니다.' });
              } finally {
                setBackfilling(false);
              }
            }}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {backfilling ? '실행 중...' : '썸네일 백필 실행'}
          </button>
          <button
            type="button"
            onClick={() => getThumbnailStatus(options).then(setThumbnailStatus).catch(() => {})}
            className="rounded border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            새로고침
          </button>
        </div>
      </section>

      <section className="mt-8 max-w-xl rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">{t('admin.setting.profileImage')}</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {t('admin.setting.profileImageDesc')}
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (
          <SingleImageField
            apiOptions={options}
            value={me?.profileImageFileId ?? null}
            onChange={async (fileId) => {
              if (fileId) {
                await setProfileImage(options, fileId);
                loadMe();
              } else {
                await clearProfileImage(options);
                loadMe();
              }
            }}
            uploadLabel={t('ui.button.upload')}
            showRemove={true}
            onError={(e) => setMessage({ type: 'error', text: t('admin.setting.profileImageSetFailed', { msg: e.message }) })}
          />
        )}
      </section>
    </div>
  );
}
