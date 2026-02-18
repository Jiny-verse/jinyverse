'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from 'common/components';
import type { ColumnDef } from 'common/components';
import type { CodeCategory } from 'common/services';

interface CategoryTableProps {
  data: CodeCategory[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  search: string;
  isLoading: boolean;
  selectedCode?: string;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  onSearchChange: (v: string) => void;
  onSelect: (cat: CodeCategory) => void;
  onAdd: () => void;
  onEdit: (cat: CodeCategory) => void;
  onDelete: (code: string) => void;
}

export function CategoryTable({
  data,
  totalElements,
  totalPages,
  page,
  size,
  search,
  isLoading,
  selectedCode,
  onPageChange,
  onSizeChange,
  onSearchChange,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const btnBase =
    'inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-colors focus:outline-none';

  const columns: ColumnDef<CodeCategory>[] = [
    { key: 'code', header: '분류 코드' },
    { key: 'name', header: '분류명' },
    {
      key: 'isSealed',
      header: '잠금',
      render: (row) =>
        row.isSealed ? (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            잠김
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            열림
          </span>
        ),
    },
    { key: 'createdAt', header: '생성일' },
    {
      key: '_actions' as keyof CodeCategory,
      header: '작업',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={row.isSealed}
            onClick={(e) => {
              e.stopPropagation();
              if (!row.isSealed) onEdit(row);
            }}
            className={`${btnBase} border-gray-300 text-gray-600 ${
              row.isSealed
                ? 'cursor-not-allowed opacity-40'
                : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
            }`}
            aria-label="수정"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={row.isSealed}
            onClick={(e) => {
              e.stopPropagation();
              if (!row.isSealed) onDelete(row.code);
            }}
            className={`${btnBase} border-gray-300 text-gray-600 ${
              row.isSealed
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

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">코드 분류</h2>
      <DataTable<CodeCategory>
        data={data}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="등록된 분류가 없습니다."
        pagination={{
          page,
          size,
          totalElements,
          totalPages,
          onPageChange,
          onSizeChange,
        }}
        search={{
          value: search,
          onChange: onSearchChange,
          placeholder: '분류 코드·이름 검색',
        }}
        onAdd={onAdd}
        addButtonLabel="분류 추가"
        onRowClick={onSelect}
        getRowId={(row) => row.code}
        selectedRowId={selectedCode}
      />
    </div>
  );
}
