'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getInquiryById } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Inquiry, InquiryThread } from 'common/types';
import { TicketInfoPanel } from './_components/TicketInfoPanel';
import { ThreadView } from './_components/ThreadView';
import { ThreadComposer } from './_components/ThreadComposer';

export default function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const options = useApiOptions();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    getInquiryById(options, id)
      .then(setInquiry)
      .catch(() => setInquiry(null))
      .finally(() => setLoading(false));
  }, [id, options.baseUrl]);

  useEffect(() => { load(); }, [load]);

  const handleThreadAdded = (thread: InquiryThread) => {
    setInquiry((prev) => {
      if (!prev) return prev;
      return { ...prev, threads: [...(prev.threads ?? []), thread] };
    });
    // Reload to get updated status
    load();
  };

  if (loading) return <p className="text-muted-foreground">로딩 중...</p>;
  if (!inquiry) return <p className="text-muted-foreground">문의를 찾을 수 없습니다.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">{inquiry.title}</h1>
      <p className="text-sm text-muted-foreground mb-6">티켓 {inquiry.ticketNo}</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 스레드 */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="overflow-y-auto max-h-[calc(100vh-380px)] min-h-[200px] pr-1">
            <ThreadView threads={inquiry.threads ?? []} />
          </div>
          <ThreadComposer
            inquiryId={inquiry.id}
            apiOptions={options}
            onThreadAdded={handleThreadAdded}
          />
        </div>

        {/* 오른쪽: 정보 패널 */}
        <div>
          <TicketInfoPanel
            inquiry={inquiry}
            apiOptions={options}
            onUpdated={(updated) => setInquiry((prev) => prev ? { ...prev, ...updated } : prev)}
          />
        </div>
      </div>
    </div>
  );
}
