'use client';

import { BoardTable } from 'common/components';
import type { ApiOptions } from 'common/types';
import { useBoardContext } from '../_hooks/useBoardContext';

export interface TableProps {
  apiOptions: ApiOptions;
  boardIdPrefix?: string;
}

export function Table({ apiOptions, boardIdPrefix = '/boards' }: TableProps) {
  const domain = useBoardContext();
  return (
    <BoardTable
      apiOptions={apiOptions}
      linkPrefix={boardIdPrefix}
      onAdd={domain.dialogs.create.onOpen}
      onEdit={domain.dialogs.update.onOpen}
      onDelete={domain.crud.delete}
      onBatchDelete={async (ids) => domain.crud.batchDelete(ids)}
      reloadTrigger={domain.reloadTrigger}
    />
  );
}
