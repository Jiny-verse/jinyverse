'use client';

import { useEffect, useState } from 'react';
import {
  getFileStorageSetting,
  updateFileStorageSetting,
  getMe,
  setProfileImage,
  clearProfileImage,
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

  const loadMe = () => {
    getMe(options)
      .then(setMe)
      .catch(() => setMe(null));
  };

  useEffect(() => {
    let done = false;
    Promise.all([getFileStorageSetting(options), getMe(options).catch(() => null)])
      .then(([res, user]) => {
        if (!done) {
          setBasePath(res.basePath ?? '');
          setMe(user ?? null);
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
