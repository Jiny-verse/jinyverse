'use client';

import { useState, useEffect, useCallback } from 'react';
import { DetailPreviewPanel } from 'common/components';
import { getTopics } from 'common/services';
import type { ApiOptions, Topic } from 'common/types';
import { useBoardContext } from '../_hooks/useBoardContext';
import { Table } from '../[boardId]/topics/_components/Table';

export interface PanelProps {
  apiOptions: ApiOptions;
}

/**
 * 보드 선택 시 옆에 뜨는 패널 = 해당 보드의 게시글 테이블
 * [boardId]/topics/_components/Table 재사용
 */
export function Panel({ apiOptions }: PanelProps) {
  const domain = useBoardContext();
  const boardId = domain.preview.selectedId;
  const boardName = domain.preview.data?.name;

  const [data, setData] = useState<{
    content: Topic[];
    totalElements: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    if (!boardId) return;
    getTopics(apiOptions, { boardId, page, size, q: search.trim() || undefined })
      .then(setData)
      .catch((e) => console.error('Failed to load topics:', e));
  }, [apiOptions.baseUrl, apiOptions.channel, boardId, page, size, search]);

  useEffect(() => {
    if (!boardId) {
      setData(null);
      return;
    }
    load();
  }, [boardId, load]);

  if (!boardId) return null;

  return (
    <div className="w-1/2 min-w-0 flex flex-col">
      <DetailPreviewPanel
        onClose={() => domain.preview.onSelect(null)}
        expandHref={`/boards/${boardId}/topics`}
        title={boardName ?? '게시글 목록'}
      >
        <div className="flex flex-col gap-2 -m-2">
          <Table
            boardId={boardId}
            data={data?.content ?? []}
            isLoading={!data}
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
              placeholder: '제목·내용 검색',
            }}
          />
        </div>
      </DetailPreviewPanel>
    </div>
  );
}
