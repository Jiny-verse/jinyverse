'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getMyInquiries } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLanguage } from 'common/utils';
import type { Inquiry, PageResponse } from 'common/types';

const EMPTY_PAGE: PageResponse<Inquiry> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  answered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-muted text-muted-foreground',
};

export default function MyInquiriesPage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  const [data, setData] = useState<PageResponse<Inquiry>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getMyInquiries(options, { page, size: 10 })
      .then(setData)
      .catch(() => setData(EMPTY_PAGE))
      .finally(() => setLoading(false));
  }, [options.baseUrl, options.channel, page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('inquiry.title')}</h1>
        <Link
          href="/contact"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 no-underline"
        >
          {t('inquiry.new')}
        </Link>
      </div>

      {loading && <p className="text-sm text-muted-foreground mb-4">{t('common.loading')}</p>}

      <div className="space-y-3">
        {data.content.length === 0 && !loading && (
          <p className="text-muted-foreground text-center py-8">{t('inquiry.empty')}</p>
        )}
        {data.content.map((inquiry) => (
          <Link
            key={inquiry.id}
            href={`/inquiries/${inquiry.id}`}
            className="block rounded-lg border border-border bg-background p-4 hover:bg-muted/30 transition-colors no-underline"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{inquiry.title}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{inquiry.ticketNo}</p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_COLORS[inquiry.statusCode] ?? STATUS_COLORS.pending
                  }`}
                >
                  {t(`inquiry.status.${inquiry.statusCode}` as any) ?? inquiry.statusCode}
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 border border-border rounded text-sm text-foreground disabled:opacity-40"
          >
            {t('common.previous')}
          </button>
          <span className="px-3 py-1 text-sm text-muted-foreground">
            {page + 1} / {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
            disabled={page >= data.totalPages - 1}
            className="px-3 py-1 border border-border rounded text-sm text-foreground disabled:opacity-40"
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
}
