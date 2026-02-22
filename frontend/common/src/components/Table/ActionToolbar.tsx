'use client';

import { ReactNode } from 'react';
import { Button } from '../../ui';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

export interface ActionToolbarProps {
  /** 선택된 개수 */
  selectedCount: number;
  /** 일괄 삭제 버튼 (클릭 시 onBatchDelete 호출) */
  onBatchDelete?: () => void;
  /** 추가 버튼 등 커스텀 액션 */
  children?: ReactNode;
}

/**
 * 테이블 상단 액션 툴바 (선택 시 노출)
 * 일괄삭제, 커스텀 버튼
 */
export function ActionToolbar({ selectedCount, onBatchDelete, children }: ActionToolbarProps) {
  const { t } = useLanguage();

  if (selectedCount === 0) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{t('table.selected', { count: selectedCount })}</span>
      {onBatchDelete && (
        <Button type="button" variant="danger" size="sm" onClick={onBatchDelete}>
          {t('table.batchDelete')}
        </Button>
      )}
      {children}
    </div>
  );
}
