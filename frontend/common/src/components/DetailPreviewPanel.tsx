'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Spinner } from '../ui';
import useLanguage from '../utils/i18n/hooks/useLanguage';

export interface DetailPreviewPanelProps {
  /** 패널 본문 (상세 내용) */
  children: ReactNode;
  /** 닫기 버튼 클릭 시 → 미리보기 패널 숨김 */
  onClose: () => void;
  /** 확장 버튼 클릭 시 이동할 URL (전체 상세 페이지). 생략하면 버튼 숨김 */
  expandHref?: string;
  /** 로딩 중일 때 true → children 대신 스피너 표시 */
  isLoading?: boolean;
  /** 패널 제목 (선택) */
  title?: string;
}

/**
 * 리스트 옆 우측 미리보기 패널.
 * 닫기 → onClose, 확장 → expandHref로 이동.
 */
export function DetailPreviewPanel({
  children,
  onClose,
  expandHref,
  isLoading = false,
  title,
}: DetailPreviewPanelProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col h-full min-w-0 border-l border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        {title && <span className="text-sm font-medium text-gray-700 truncate">{title}</span>}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {expandHref && (
            <Link
              href={expandHref}
              className="rounded px-3 py-1.5 text-sm font-medium text-(--btn-primary,#374151) hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-(--focus-ring,#6b7280)"
            >
              {t('common.detail')}
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label={t('ui.button.close')}
          >
            {t('ui.button.close')}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="mt-2 text-sm text-gray-500">{t('common.loading')}</span>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
