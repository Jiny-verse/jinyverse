'use client';

import { useEffect, useState } from 'react';
import { getNotificationSetting, updateNotificationSetting } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLanguage } from 'common/utils';
import type { NotificationSetting } from 'common/types';

const NOTIFICATION_TYPE_KEYS = ['comment', 'reply', 'system', 'inquiry_replied'] as const;

export default function NotificationSettingsPage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  const [setting, setSetting] = useState<NotificationSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getNotificationSetting(options)
      .then(setSetting)
      .catch((err) => { console.warn('[NotificationSettings] 설정 로드 실패:', err); })
      .finally(() => setLoading(false));
  }, [options.baseUrl]);

  const handleSave = async () => {
    if (!setting) return;
    setSaving(true);
    setSaved(false);
    try {
      const updated = await updateNotificationSetting(options, {
        systemEnabled: setting.systemEnabled,
        emailEnabled: setting.emailEnabled,
        emailOverride: setting.emailOverride,
        typeSettings: setting.typeSettings,
      });
      setSetting(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const updateTypeSettings = (key: string, value: boolean) => {
    if (!setting) return;
    setSetting({
      ...setting,
      typeSettings: { ...(setting.typeSettings ?? {}), [key]: value },
    });
  };

  if (loading) return <p className="text-muted-foreground">{t('common.loading')}</p>;
  if (!setting) return <p className="text-muted-foreground">{t('notification.settings.loadFailed')}</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t('notification.settings.title')}</h1>

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-background p-4 space-y-3">
          <h2 className="font-medium text-foreground">{t('notification.settings.basic')}</h2>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">{t('notification.settings.systemEnabled')}</span>
            <input
              type="checkbox"
              checked={setting.systemEnabled}
              onChange={(e) => setSetting({ ...setting, systemEnabled: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-foreground">{t('notification.settings.emailEnabled')}</span>
            <input
              type="checkbox"
              checked={setting.emailEnabled}
              onChange={(e) => setSetting({ ...setting, emailEnabled: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
          </label>

          {setting.emailEnabled && (
            <div>
              <label className="block text-sm mb-1 text-foreground">{t('notification.settings.emailOverrideLabel')}</label>
              <input
                type="email"
                value={setting.emailOverride ?? ''}
                onChange={(e) => setSetting({ ...setting, emailOverride: e.target.value || undefined })}
                placeholder={t('notification.settings.emailOverridePlaceholder')}
                className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background p-4 space-y-3">
          <h2 className="font-medium text-foreground">{t('notification.settings.typeSettings')}</h2>
          {NOTIFICATION_TYPE_KEYS.map((key) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-foreground">{t(`notification.settings.type.${key}` as any)}</span>
              <input
                type="checkbox"
                checked={setting.typeSettings?.[key] !== false}
                onChange={(e) => updateTypeSettings(key, e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
            </label>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? t('common.saving') : t('ui.button.save')}
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400">{t('notification.settings.saved')}</span>}
        </div>
      </div>
    </div>
  );
}
