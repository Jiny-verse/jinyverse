'use client';

import type { InquiryThread } from 'common/types';
import { ThreadItem } from './ThreadItem';

interface ThreadViewProps {
  threads: InquiryThread[];
}

export function ThreadView({ threads }: ThreadViewProps) {
  const conversation = threads.filter((t) => t.typeCode !== 'internal_note');
  const notes = threads.filter((t) => t.typeCode === 'internal_note');

  return (
    <div className="flex flex-col gap-6">
      {/* 대화 영역 */}
      <div className="flex flex-col space-y-3">
        {conversation.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">대화 내역이 없습니다.</p>
        ) : (
          conversation.map((thread) => (
            <ThreadItem key={thread.id} thread={thread} />
          ))
        )}
      </div>

      {/* 내부 메모 영역 */}
      {notes.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">내부 메모</span>
            <div className="flex-1 border-t border-yellow-200 dark:border-yellow-800" />
          </div>
          <div className="flex flex-col space-y-3">
            {notes.map((thread) => (
              <ThreadItem key={thread.id} thread={thread} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
