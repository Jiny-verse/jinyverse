'use client';

import { useState, useEffect, useCallback } from 'react';
import { DataTable, FilterSelect } from 'common/components';
import type { Tag } from 'common/types';
import type { ApiOptions } from 'common/types';
import { getTags } from 'common/services';
import { useLanguage } from 'common/utils';
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

  const load = useCallback(() => {
    getTags(apiOptions, {
      page,
      size,
      q: search.trim() || undefined,
      usage: usage || undefined,
    })
      .then(setData)
      .catch((e) => console.error('Failed to load tags:', e));
  }, [apiOptions.baseUrl, apiOptions.channel, apiOptions.role, page, size, search, usage]);

  useEffect(() => {
    load();
  }, [load, domain.reloadTrigger]);

  const handleBatchDelete = async () => {
    await domain.crud.batchDelete(selectedIds);
    setSelectedIds([]);
  };

  const columns = getColumns(
    {
      onEdit: domain.dialogs.update.onOpen,
      onDelete: domain.crud.delete,
    },
    t
  );

  return (
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
      onBatchDelete={selectedIds.length ? handleBatchDelete : undefined}
      onAdd={domain.dialogs.create.onOpen}
      addButtonLabel={t('admin.tag.create')}
    />
  );
}
