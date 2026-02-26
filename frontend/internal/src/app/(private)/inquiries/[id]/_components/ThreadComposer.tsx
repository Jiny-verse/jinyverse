'use client';

import { useState } from 'react';
import type { ApiOptions, InquiryThread } from 'common/types';
import { addInquiryThread } from 'common/services';

interface ThreadComposerProps {
  inquiryId: string;
  apiOptions: ApiOptions;
  onThreadAdded: (thread: InquiryThread) => void;
}

type TabType = 'reply' | 'note';

export function ThreadComposer({ inquiryId, apiOptions, onThreadAdded }: ThreadComposerProps) {
  const [tab, setTab] = useState<TabType>('reply');
  const [replyContent, setReplyContent] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentContent = tab === 'reply' ? replyContent : noteContent;
  const setCurrentContent = tab === 'reply' ? setReplyContent : setNoteContent;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContent.trim()) return;
    setError('');
    setLoading(true);
    try {
      const typeCode = tab === 'reply' ? 'staff_reply' : 'internal_note';
      const thread = await addInquiryThread(apiOptions, inquiryId, {
        typeCode,
        content: currentContent.trim(),
        sendEmail: tab === 'reply' ? sendEmail : false,
      });
      onThreadAdded(thread);
      setCurrentContent('');
      setSendEmail(false);
    } catch (err: any) {
      setError(err?.message ?? '전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab('reply')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'reply'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          답변
        </button>
        <button
          type="button"
          onClick={() => setTab('note')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'note'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          내부 메모
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <textarea
          value={currentContent}
          onChange={(e) => setCurrentContent(e.target.value)}
          rows={4}
          placeholder={tab === 'reply' ? '고객에게 전달될 답변을 작성하세요...' : '내부 메모를 작성하세요 (고객에게 보이지 않습니다)...'}
          className={`w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 resize-y ${
            tab === 'note'
              ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/20 focus:ring-yellow-500'
              : 'border-border focus:ring-primary'
          }`}
        />

        <div className="flex items-center justify-between">
          {tab === 'reply' && (
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded"
              />
              이메일로도 전송
            </label>
          )}
          {tab === 'note' && <div />}

          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-destructive">{error}</span>}
            <button
              type="submit"
              disabled={loading || !currentContent.trim()}
              className={`px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 ${
                tab === 'note'
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {loading ? '전송 중...' : tab === 'reply' ? '답변 등록' : '메모 저장'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
