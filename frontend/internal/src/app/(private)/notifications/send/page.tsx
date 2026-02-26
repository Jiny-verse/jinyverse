'use client';

import { useEffect, useState } from 'react';
import {
  getNotificationTemplates,
  renderTemplatePreview,
} from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { NotificationTemplate } from 'common/types';
import { apiPost } from 'common/services';

export default function NotificationSendPage() {
  const options = useApiOptions();
  const [userId, setUserId] = useState('');
  const [type, setType] = useState('system');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [varValues, setVarValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const selectedTemplate = templates.find((t) => t.id === templateId);

  useEffect(() => {
    getNotificationTemplates(options, { size: 100 })
      .then((res) => setTemplates(res.content))
      .catch(() => {});
  }, [options.baseUrl]);

  useEffect(() => {
    if (selectedTemplate) {
      setMessage(renderTemplatePreview(selectedTemplate.body, varValues));
    }
  }, [selectedTemplate, varValues]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await apiPost(options, 'api/notifications', {
        userId,
        typeCategoryCode: 'notification_type',
        type,
        message,
        link: link || undefined,
      });
      setSuccess('알림이 발송되었습니다.');
      setUserId('');
      setMessage('');
      setLink('');
    } catch (err: any) {
      setError(err?.message ?? '발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">알림 수동 발송</h1>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">수신자 사용자 ID *</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            placeholder="UUID"
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">알림 타입</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="system">system</option>
            <option value="comment">comment</option>
            <option value="reply">reply</option>
            <option value="inquiry_replied">inquiry_replied</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">템플릿 선택 (선택사항)</label>
          <select
            value={templateId}
            onChange={(e) => { setTemplateId(e.target.value); setVarValues({}); }}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">직접 입력</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {selectedTemplate && selectedTemplate.variables.length > 0 && (
          <div className="space-y-2 pl-2 border-l-2 border-border">
            <p className="text-xs text-muted-foreground">변수 값 입력</p>
            {selectedTemplate.variables.map((v) => (
              <div key={v} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-28 shrink-0">{'{{'}{v}{'}}'}</span>
                <input
                  type="text"
                  value={varValues[v] ?? ''}
                  onChange={(e) => setVarValues((prev) => ({ ...prev, [v]: e.target.value }))}
                  placeholder={v}
                  className="flex-1 border border-border rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">메시지 *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">링크 (선택사항)</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/some/path"
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {success && <p className="text-sm text-green-600">{success}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '발송 중...' : '발송'}
        </button>
      </form>
    </div>
  );
}
