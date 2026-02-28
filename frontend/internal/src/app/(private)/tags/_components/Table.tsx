'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, FilterSelect } from 'common/components';
import type { Tag } from 'common/types';
import type { ApiOptions } from 'common/types';
import { getTags } from 'common/services';
import { useLanguage, parseApiError } from 'common/utils';
import { Alert, ConfirmDialog } from 'common/ui';
import { getColumns } from './Column';
import { useTagContext } from '../_hooks/useTagContext';

export interface TableProps {
  apiOptions: ApiOptions;
}

export function Table({ apiOptions }: TableProps) {
  const { t } = useLanguage();
  const domain = useTagContext();
  const [data, setData] = useState<{
    content: Tag[];
    totalElements: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [usage, setUsage] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; isBatch: boolean } | null>(null);

  const load = useCallback(() => {
    setLoadError(null);
    getTags(apiOptions, {
      page,
      size,
      q: search.trim() || undefined,
      usage: usage || undefined,
    })
      .then(setData)
      .catch((e) => {
        const { messageKey, fallback } = parseApiError(e);
        setLoadError(t(messageKey) || fallback);
      });
  }, [apiOptions.baseUrl, apiOptions.channel, apiOptions.role, page, size, search, usage]);

  useEffect(() => {
    load();
  }, [load, domain.reloadTrigger]);

  const handleBatchDeleteRequest = () => {
    setPendingDelete({ ids: selectedIds, isBatch: true });
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    for (const id of pendingDelete.ids) {
      await domain.crud.delete(id);
    }
    if (pendingDelete.isBatch) setSelectedIds([]);
    setPendingDelete(null);
  };

  const columns = getColumns(
    {
      onEdit: domain.dialogs.update.onOpen,
      onDelete: (id) => setPendingDelete({ ids: [id], isBatch: false }),
    },
    t
  );

  if (loadError) {
    return (
      <Alert variant="error">
        <p>{loadError}</p>
        <button onClick={load}>{t('common.retry')}</button>
      </Alert>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={pendingDelete !== null}
        message={t('message.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
      <DataTable<Tag>
        data={data?.content ?? []}
        columns={columns}
        isLoading={!data}
        emptyMessage={t('common.noData')}
        pagination={{
          page,
          size,
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 0,
          onPageChange: setPage,
          onSizeChange: (s) => {
            setSize(s);
            setPage(0);
          },
        }}
        search={{
          value: search,
          onChange: (v) => {
            setSearch(v);
            setPage(0);
          },
          placeholder: t('form.placeholder.search'),
        }}
        filterSlot={
          <FilterSelect
            label={t('form.label.usage')}
            value={usage}
            options={[
              { value: '', label: t('common.all') },
              { value: 'topic', label: '게시글' },
              { value: 'board', label: '게시판' },
            ]}
            placeholder={t('common.all')}
            onChange={(v) => {
              setUsage(v);
              setPage(0);
            }}
          />
        }
        selection={{ selectedIds, onSelectionChange: setSelectedIds }}
        onBatchDelete={selectedIds.length ? handleBatchDeleteRequest : undefined}
        onAdd={domain.dialogs.create.onOpen}
        addButtonLabel={t('admin.tag.create')}
      />
    </>
  );
}
