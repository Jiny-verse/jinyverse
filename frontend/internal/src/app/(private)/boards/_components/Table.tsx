'use client';

import { useState } from 'react';
import { BoardTable } from 'common/components';
import { ConfirmDialog } from 'common/ui';
import type { ApiOptions } from 'common/types';
import { useBoardContext } from '../_hooks/useBoardContext';
import { useLanguage } from 'common/utils';

export interface TableProps {
  apiOptions: ApiOptions;
  boardIdPrefix?: string;
}

export function Table({ apiOptions, boardIdPrefix = '/boards' }: TableProps) {
  const domain = useBoardContext();
  const { t } = useLanguage();
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; isBatch: boolean } | null>(null);

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    for (const id of pendingDelete.ids) {
      await domain.crud.delete(id);
    }
    setPendingDelete(null);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={pendingDelete !== null}
        message={t('message.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
      <BoardTable
        apiOptions={apiOptions}
        linkPrefix={boardIdPrefix}
        onAdd={domain.dialogs.create.onOpen}
        onEdit={domain.dialogs.update.onOpen}
        onDelete={(id) => setPendingDelete({ ids: [id], isBatch: false })}
        onBatchDelete={async (ids) => setPendingDelete({ ids, isBatch: true })}
        reloadTrigger={domain.reloadTrigger}
      />
    </>
  );
}
