'use client';

import type { InquiryThread } from 'common/types';

interface ThreadItemProps {
  thread: InquiryThread;
}

const TYPE_STYLES: Record<string, string> = {
  customer_message: 'bg-muted/50 border-border ml-8 max-w-[75%]',
  staff_reply: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 mr-8 max-w-[75%] self-end ml-auto',
  internal_note: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800 max-w-[90%]',
  status_change: 'bg-transparent border-dashed border-muted-foreground/30 text-center text-muted-foreground text-xs py-2',
};

const TYPE_LABELS: Record<string, string> = {
  customer_message: '고객',
  staff_reply: '직원',
  internal_note: '내부 메모',
  status_change: '상태 변경',
};

export function ThreadItem({ thread }: ThreadItemProps) {
  if (thread.typeCode === 'status_change') {
    return (
      <div className={`rounded-md border px-4 py-2 ${TYPE_STYLES.status_change}`}>
        <span>🔄 {thread.content}</span>
        <span className="ml-2 text-xs">{new Date(thread.createdAt).toLocaleString('ko-KR')}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${TYPE_STYLES[thread.typeCode] ?? TYPE_STYLES.customer_message}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold">{TYPE_LABELS[thread.typeCode] ?? thread.typeCode}</span>
          {thread.authorName && (
            <span className="text-xs text-muted-foreground">{thread.authorName}</span>
          )}
          {thread.authorEmail && !thread.authorName && (
            <span className="text-xs text-muted-foreground">{thread.authorEmail}</span>
          )}
          {thread.typeCode === 'internal_note' && (
            <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1 rounded">비공개</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {thread.emailSent && (
            <span className="text-xs text-green-600">이메일 발송됨</span>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(thread.createdAt).toLocaleString('ko-KR')}
          </span>
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap">{thread.content}</p>
    </div>
  );
}
