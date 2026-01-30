'use client';

import { useCallback, useEffect, useState } from 'react';
import { getBoards, getBoard, createBoard, updateBoard, deleteBoard, getCodes } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { DetailPreviewPanel, FilterSelect } from 'common/components';
import type { Board, BoardCreateInput, BoardUpdateInput } from 'common/types';
import { BoardTable } from './_components/Table';
import { BoardCreateDialog } from './_components/CreateDialog';
import { BoardUpdateDialog } from './_components/UpdateDialog';

const BOARD_TYPE_CATEGORY = 'BOARD_TYPE';

export default function BoardsPage() {
  const options = useApiOptions();
  const [data, setData] = useState<{ content: Board[]; totalElements: number; totalPages: number; first: boolean; last: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<{ menuCode?: string; typeCategoryCode?: string; type?: string; isPublic?: boolean }>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [previewBoard, setPreviewBoard] = useState<Board | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Board | null>(null);
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);

  const load = useCallback(() => {
    getBoards(options, { page, size, q: search.trim() || undefined, ...filter })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [options.baseUrl, options.channel, options.role, page, size, search, filter.menuCode, filter.typeCategoryCode, filter.type, filter.isPublic]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getCodes(options, { categoryCode: BOARD_TYPE_CATEGORY })
      .then((codes) => setTypeOptions(codes.map((c) => ({ value: c.code, label: c.name }))))
      .catch(() => setTypeOptions([]));
  }, [options.baseUrl, options.channel]);

  useEffect(() => {
    if (!selectedBoardId) {
      setPreviewBoard(null);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    getBoard(options, selectedBoardId)
      .then((b) => {
        if (!cancelled) setPreviewBoard(b);
      })
      .catch(() => {
        if (!cancelled) setPreviewBoard(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [options.baseUrl, options.channel, selectedBoardId]);

  const handleCreate = async (values: BoardCreateInput) => {
    await createBoard(options, values);
    setCreateDialogOpen(false);
    load();
  };

  const handleUpdate = async (values: BoardUpdateInput) => {
    if (!editing) return;
    await updateBoard(options, editing.id, values);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await deleteBoard(options, id);
    load();
  };

  const handleBatchDelete = async () => {
    if (!confirm(`선택한 ${selectedIds.length}개를 삭제하시겠습니까?`)) return;
    for (const id of selectedIds) {
      await deleteBoard(options, id);
    }
    setSelectedIds([]);
    load();
  };

  if (error) {
    return (
      <div className="">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const hasPreview = selectedBoardId != null;

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">게시판 관리</h1>
      <div className={hasPreview ? 'flex gap-0 h-[calc(100vh-10rem)] min-h-[400px]' : ''}>
        <div className={hasPreview ? 'w-1/2 min-w-0 pr-4 flex flex-col' : ''}>
          <BoardTable
            data={data?.content ?? []}
            isLoading={!data}
            search={{
              value: search,
              onChange: (v) => { setSearch(v); setPage(0); },
              placeholder: '이름·설명·타입 검색',
            }}
            filterSlot={
              <FilterSelect
                label="공개 여부"
                value={filter.isPublic === undefined ? '' : filter.isPublic ? 'true' : 'false'}
                options={[
                  { value: 'true', label: '공개' },
                  { value: 'false', label: '비공개' },
                ]}
                placeholder="전체"
                onChange={(v) => {
                  setFilter((f) => ({ ...f, isPublic: v === '' ? undefined : v === 'true' }));
                  setPage(0);
                }}
              />
            }
            pagination={
              data
                ? {
                    page,
                    size,
                    totalElements: data.totalElements,
                    totalPages: data.totalPages,
                    onPageChange: setPage,
                    onSizeChange: (s) => {
                      setSize(s);
                      setPage(0);
                    },
                  }
                : undefined
            }
            selection={{ selectedIds, onSelectionChange: setSelectedIds }}
            onBatchDelete={selectedIds.length ? handleBatchDelete : undefined}
            onAdd={() => setCreateDialogOpen(true)}
            onEdit={(row) => setEditing(row)}
            onDelete={handleDelete}
            onRowClick={(row) => setSelectedBoardId(row.id)}
            selectedRowId={selectedBoardId}
          />
        </div>
        {hasPreview && (
          <div className="w-1/2 min-w-0 flex flex-col">
            <DetailPreviewPanel
              onClose={() => setSelectedBoardId(null)}
              expandHref={`/boards/${selectedBoardId}/topics`}
              isLoading={previewLoading}
              title={previewBoard?.name}
            >
              {previewBoard && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
                  <p><span className="text-gray-500 text-sm">타입</span> {previewBoard.type ?? '-'}</p>
                  <p><span className="text-gray-500 text-sm">설명</span> {previewBoard.description ?? '-'}</p>
                  <p><span className="text-gray-500 text-sm">공개</span> {previewBoard.isPublic ? 'Y' : 'N'}</p>
                  <p className="text-sm text-gray-500">확장을 누르면 이 게시판의 게시글 목록으로 이동합니다.</p>
                </div>
              )}
            </DetailPreviewPanel>
          </div>
        )}
      </div>
      <BoardCreateDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
        typeOptions={typeOptions}
      />
      <BoardUpdateDialog
        open={!!editing}
        board={editing}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
        typeOptions={typeOptions}
      />
    </div>
  );
}
