'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from 'common/components';
import type { ColumnDef } from 'common/components';
import type { Code } from 'common/services';
import { useLanguage } from 'common/utils';

interface CodeTableProps {
  categoryCode: string | null;
  isSealed: boolean;
  codes: Code[];
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (code: Code) => void;
  onDelete: (catCode: string, code: string) => void;
}

export function CodeTable({
  categoryCode,
  isSealed,
  codes,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}: CodeTableProps) {
  const { t } = useLanguage();
  const btnBase =
    'inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors focus:outline-none';

  const columns: ColumnDef<Code>[] = [
    { key: 'code', header: t('form.label.code') },
    { key: 'name', header: t('form.label.name') },
    {
      key: 'value',
      header: t('form.label.value'),
      render: (row) => row.value ?? '-',
    },
    {
      key: 'order',
      header: t('form.label.order'),
      render: (row) => (row.order != null ? String(row.order) : '-'),
    },
    {
      key: '_actions' as keyof Code,
      header: t('table.actions'),
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isSealed}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSealed) onEdit(row);
            }}
            className={`${btnBase} border-gray-300 text-gray-600 ${
              isSealed
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
            }`}
            aria-label={t('ui.button.edit')}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={isSealed}
            onClick={(e) => {
              e.stopPropagation();
              if (!isSealed && categoryCode) onDelete(categoryCode, row.code);
            }}
            className={`${btnBase} border-gray-300 text-gray-600 ${
              isSealed
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-red-50 hover:border-red-300 hover:text-red-600'
            }`}
            aria-label={t('ui.button.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (!categoryCode) {
    return (
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t('admin.code.title')}</h2>
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
          {t('admin.audit.selectCategory')}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">
        {t('admin.code.title')}
        {isSealed && (
          <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            {t('admin.audit.sealed')}
          </span>
        )}
      </h2>
      <DataTable<Code>
        data={codes}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={t('common.noData')}
        onAdd={isSealed ? undefined : onAdd}
        addButtonLabel={t('ui.button.add')}
        getRowId={(row) => `${row.categoryCode}:${row.code}`}
      />
    </div>
  );
}
