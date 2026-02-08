'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  getTopics,
  getTopic,
  getComments,
  getCodes,
  createTopic,
  updateTopic,
  deleteTopic,
} from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { DetailPreviewPanel, FilterSelect } from 'common/components';
import type { Topic, TopicCreateInput, TopicUpdateInput, Comment } from 'common/types';
import { Table, CreateDialog, UpdateDialog } from './_components';

export default function TopicsPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const options = useApiOptions();
  const [data, setData] = useState<{
    content: Topic[];
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [search, setSearch] = useState('');
  const [isPublic, setIsPublic] = useState<boolean | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [previewComments, setPreviewComments] = useState<Comment[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [statusOptions, setStatusOptions] = useState<{ value: string; label: string }[]>([]);

  const TOPIC_STATUS_CATEGORY = 'topic_status';
  const STATUS_CODES_EXCLUDED = new Set(['published', 'hidden']);
  useEffect(() => {
    getCodes(options, { categoryCode: TOPIC_STATUS_CATEGORY })
      .then((codes) =>
        setStatusOptions(
          codes
            .filter((c) => !STATUS_CODES_EXCLUDED.has(c.code))
            .map((c) => ({ value: c.code, label: c.name }))
        )
      )
      .catch(() => setStatusOptions([]));
  }, [options.baseUrl, options.channel]);

  const load = useCallback(() => {
    getTopics(options, {
      page,
      size,
      boardId,
      q: search.trim() || undefined,
      isPublic,
    })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [options.baseUrl, options.channel, boardId, page, size, search, isPublic]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedTopicId) {
      setPreviewTopic(null);
      setPreviewComments([]);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    Promise.all([
      getTopic(options, selectedTopicId),
      getComments(options, { topicId: selectedTopicId, size: 50 }),
    ])
      .then(([t, res]) => {
        if (!cancelled) {
          setPreviewTopic(t);
          setPreviewComments(res.content);
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewTopic(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [options.baseUrl, options.channel, selectedTopicId]);

  const handleCreate = async (values: TopicCreateInput) => {
    await createTopic(options, { ...values, boardId: values.boardId ?? boardId });
    setCreateDialogOpen(false);
    load();
  };

  const handleUpdate = async (values: TopicUpdateInput) => {
    if (!editing) return;
    await updateTopic(options, editing.id, values);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await deleteTopic(options, id);
    load();
  };

  const handleBatchDelete = async () => {
    if (!confirm(`선택한 ${selectedIds.length}개를 삭제하시겠습니까?`)) return;
    for (const id of selectedIds) {
      await deleteTopic(options, id);
    }
    setSelectedIds([]);
    load();
  };

  if (error) {
    return (
      <div className="">
        <p className="text-red-400">{error}</p>
        <Link href="/boards" className="mt-4 inline-block text-gray-400 hover:text-white">
          게시판 목록
        </Link>
      </div>
    );
  }

  const hasPreview = selectedTopicId != null;

  return (
    <div className="">
      <Link href="/boards" className="text-gray-400 hover:text-white mb-4 inline-block">
        ← 게시판 목록
      </Link>
      <h1 className="text-2xl font-bold mb-6">게시글 관리</h1>
      <div className={hasPreview ? 'flex gap-0 h-[calc(100vh-10rem)] min-h-[400px]' : ''}>
        <div className={hasPreview ? 'w-1/2 min-w-0 pr-4 flex flex-col' : ''}>
          <Table
            boardId={boardId}
            data={data?.content ?? []}
            isLoading={!data}
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
            search={{
              value: search,
              onChange: (v) => {
                setSearch(v);
                setPage(0);
              },
              placeholder: '제목·내용 검색',
            }}
            filterSlot={
              <FilterSelect
                label="공개 여부"
                value={isPublic === undefined ? '' : isPublic ? 'true' : 'false'}
                options={[
                  { value: 'true', label: '공개' },
                  { value: 'false', label: '비공개' },
                ]}
                placeholder="전체"
                onChange={(v) => {
                  setIsPublic(v === '' ? undefined : v === 'true');
                  setPage(0);
                }}
              />
            }
            selection={{ selectedIds, onSelectionChange: setSelectedIds }}
            onBatchDelete={selectedIds.length ? handleBatchDelete : undefined}
            onAdd={() => setCreateDialogOpen(true)}
            onEdit={(row) => setEditing(row)}
            onDelete={handleDelete}
            onRowClick={(row) => setSelectedTopicId(row.id)}
            selectedRowId={selectedTopicId}
          />
        </div>
        {hasPreview && (
          <div className="w-1/2 min-w-0 flex flex-col">
            <DetailPreviewPanel
              onClose={() => setSelectedTopicId(null)}
              expandHref={`/boards/${boardId}/topics/${selectedTopicId}`}
              isLoading={previewLoading}
              title={previewTopic?.title}
            >
              {previewTopic && (
                <>
                  <article className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      작성일 {previewTopic.createdAt} · 조회 {previewTopic.viewCount ?? 0}
                    </p>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-900">
                      {previewTopic.content}
                    </div>
                  </article>
                  <section>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">
                      댓글 ({previewComments.length})
                    </h2>
                    <ul className="space-y-2">
                      {previewComments
                        .filter((c) => !c.isDeleted)
                        .map((c) => (
                          <li
                            key={c.id}
                            className="rounded border border-gray-200 p-2 bg-white text-sm"
                          >
                            <p className="text-gray-500 text-xs">작성자 {c.userId}</p>
                            <p className="mt-0.5 text-gray-900">{c.content}</p>
                          </li>
                        ))}
                    </ul>
                  </section>
                </>
              )}
            </DetailPreviewPanel>
          </div>
        )}
      </div>
      <CreateDialog
        open={createDialogOpen}
        boardId={boardId}
        statusOptions={statusOptions}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreate}
      />
      <UpdateDialog
        open={!!editing}
        topic={editing}
        statusOptions={statusOptions}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
