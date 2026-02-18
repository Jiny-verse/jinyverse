'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from 'common/components';
import type { ColumnDef } from 'common/components';
import type { Code } from 'common/services';

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
  const btnBase =
    'inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors focus:outline-none';

  const columns: ColumnDef<Code>[] = [
    { key: 'code', header: '코드' },
    { key: 'name', header: '이름' },
    {
      key: 'value',
      header: '값',
      render: (row) => row.value ?? '-',
    },
    {
      key: 'order',
      header: '순서',
      render: (row) => (row.order != null ? String(row.order) : '-'),
    },
    {
      key: '_actions' as keyof Code,
      header: '작업',
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
            aria-label="수정"
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
            aria-label="삭제"
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
        <h2 className="mb-3 text-lg font-semibold">코드 목록</h2>
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
          좌측에서 분류를 선택하면 코드 목록이 표시됩니다.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">
        코드 목록
        {isSealed && (
          <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            잠김 — 수정 불가
          </span>
        )}
      </h2>
      <DataTable<Code>
        data={codes}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="등록된 코드가 없습니다."
        onAdd={isSealed ? undefined : onAdd}
        addButtonLabel="코드 추가"
        getRowId={(row) => `${row.categoryCode}:${row.code}`}
      />
    </div>
  );
}
