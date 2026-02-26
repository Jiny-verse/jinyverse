'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMyInquiryById, addCustomerMessage } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLanguage } from 'common/utils';
import type { Inquiry, InquiryThread } from 'common/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  answered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-muted text-muted-foreground',
};

function ThreadMessage({ thread, language }: { thread: InquiryThread; language: string }) {
  const dateLocale = language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US';

  if (thread.typeCode === 'status_change') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {thread.content}
        </span>
      </div>
    );
  }

  const isCustomer = thread.typeCode === 'customer_message';

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-lg px-4 py-3 ${
          isCustomer
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground border border-border'
        }`}
      >
        {!isCustomer && thread.authorName && (
          <p className="text-xs font-medium mb-1 opacity-70">{thread.authorName}</p>
        )}
        <p className="text-sm whitespace-pre-wrap">{thread.content}</p>
        <p className={`text-xs mt-1 ${isCustomer ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {new Date(thread.createdAt).toLocaleString(dateLocale)}
        </p>
      </div>
    </div>
  );
}

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const options = useApiOptions();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    getMyInquiryById(options, id)
      .then(setInquiry)
      .catch(() => router.push('/inquiries'))
      .finally(() => setLoading(false));
  }, [id, options.baseUrl]);

  useEffect(() => { load(); }, [load]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !message.trim()) return;
    setSendError('');
    setSending(true);
    try {
      const thread = await addCustomerMessage(options, id, message.trim());
      setInquiry((prev) => prev ? { ...prev, threads: [...(prev.threads ?? []), thread] } : prev);
      setMessage('');
    } catch (err: any) {
      setSendError(err?.message ?? t('inquiry.sendFailed'));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">{t('common.loading')}</p>;
  if (!inquiry) return null;

  const isClosed = inquiry.statusCode === 'closed';

  return (
    <div className="max-w-2xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/inquiries')}
        className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1"
      >
        {t('inquiry.backToList')}
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1 text-foreground">{inquiry.title}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="font-mono">{inquiry.ticketNo}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              STATUS_COLORS[inquiry.statusCode] ?? STATUS_COLORS.pending
            }`}
          >
            {t(`inquiry.status.${inquiry.statusCode}` as any) ?? inquiry.statusCode}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6 min-h-[200px]">
        {(inquiry.threads ?? []).map((thread) => (
          <ThreadMessage key={thread.id} thread={thread} language={language} />
        ))}
      </div>

      {!isClosed && (
        <form onSubmit={handleSend} className="space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={t('inquiry.messagePlaceholder')}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex items-center justify-between">
            {sendError && <span className="text-xs text-destructive">{sendError}</span>}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {sending ? t('common.saving') : t('common.submit')}
              </button>
            </div>
          </div>
        </form>
      )}
      {isClosed && (
        <p className="text-sm text-muted-foreground text-center py-4 border-t border-border">
          {t('inquiry.closed')}
        </p>
      )}
    </div>
  );
}
