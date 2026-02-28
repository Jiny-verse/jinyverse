'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  getTopics,
  getTopic,
  getComments,
  deleteTopic,
  getBoard,
} from 'common/services';
import { formatRelativeOrAbsolute } from 'common';
import { useLanguage, parseApiError } from 'common/utils';
import { useApiOptions } from '@/app/providers/ApiProvider';
import {
  DetailPreviewPanel,
  FilterSelect,
  BoardListRenderer,
  PostDetailRenderer,
} from 'common/components';
import { PaginationFooter, Toolbar, Button, ConfirmDialog } from 'common/ui';
import type { Topic, Comment, Board } from 'common/types';
import { Table } from './_components';

export default function TopicsPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const options = useApiOptions();
  const { t } = useLanguage();

  const [board, setBoard] = useState<Board | null>(null);
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
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; isBatch: boolean } | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [previewComments, setPreviewComments] = useState<Comment[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 게시판 정보 로드
  useEffect(() => {
    getBoard(options, boardId)
      .then(setBoard)
      .catch(() => setBoard(null));
  }, [options.baseUrl, options.channel, boardId]);

  const load = useCallback(() => {
    getTopics(options, {
      page,
      size,
      boardId,
      q: search.trim() || undefined,
      isPublic,
    })
      .then(setData)
      .catch((e) => {
        const { messageKey, fallback } = parseApiError(e);
        setError(t(messageKey) || fallback);
      });
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

  const handleDelete = (id: string) => {
    setPendingDelete({ ids: [id], isBatch: false });
  };

  const handleBatchDelete = () => {
    setPendingDelete({ ids: selectedIds, isBatch: true });
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    for (const id of pendingDelete.ids) {
      await deleteTopic(options, id);
    }
    if (pendingDelete.isBatch) setSelectedIds([]);
    setPendingDelete(null);
    load();
  };

  if (error) {
    return (
      <div className="">
        <p className="text-destructive">{error}</p>
        <Link href="/boards" className="mt-4 inline-block text-muted-foreground hover:text-foreground">
          {t('board.list.title', { defaultValue: '게시판 목록' })}
        </Link>
      </div>
    );
  }

  const confirmDialog = (
    <ConfirmDialog
      isOpen={pendingDelete !== null}
      message={t('message.confirmDelete')}
      onConfirm={handleDeleteConfirm}
      onCancel={() => setPendingDelete(null)}
    />
  );

  const hasPreview = selectedTopicId != null;
  const boardType = board?.type ?? 'normal';
  const isNormal = boardType === 'normal';

  return (
    <>
    {confirmDialog}
    <div className="">
      <Link href="/boards" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
        ← {t('board.list.title', { defaultValue: '게시판 목록' })}
      </Link>
      <h1 className="text-2xl font-bold mb-6">{t('board.topic.manage', { defaultValue: '게시글 관리' })}</h1>

      {isNormal ? (
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
                placeholder: t('form.placeholder.search_title_content', { defaultValue: '제목·내용 검색' }),
              }}
              filterSlot={
                <FilterSelect
                  label={t('form.label.isPublic', { defaultValue: '공개 여부' })}
                  value={isPublic === undefined ? '' : isPublic ? 'true' : 'false'}
                  options={[
                    { value: 'true', label: t('common.public', { defaultValue: '공개' }) },
                    { value: 'false', label: t('common.private', { defaultValue: '비공개' }) },
                  ]}
                  placeholder={t('common.all', { defaultValue: '전체' })}
                  onChange={(v) => {
                    setIsPublic(v === '' ? undefined : v === 'true');
                    setPage(0);
                  }}
                />
              }
              selection={{ selectedIds, onSelectionChange: setSelectedIds }}
              onBatchDelete={selectedIds.length ? handleBatchDelete : undefined}
              onAdd={() => router.push(`/boards/${boardId}/topics/create`)}
              onEdit={(row) => router.push(`/boards/${boardId}/topics/${row.id}/edit`)}
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
                {previewTopic && board && (
                  <>
                    <div className="mb-4">
                      <PostDetailRenderer
                        board={board}
                        topic={previewTopic}
                        apiOptions={options}
                      />
                    </div>
                    <section>
                      <h2 className="text-sm font-semibold text-foreground mb-2">
                        {t('board.comment.title', { defaultValue: '댓글 ({{count}})', count: previewComments.length })}
                      </h2>
                      <ul className="space-y-2">
                        {previewComments
                          .filter((c) => !c.isDeleted)
                          .map((c) => (
                            <li key={c.id} className="rounded border border-border p-2 bg-card text-sm">
                              <p className="text-muted-foreground text-xs">
                                {c.author?.nickname ?? '-'} ·{' '}
                                {formatRelativeOrAbsolute(c.createdAt, t)}
                              </p>
                              <p className="mt-0.5 text-foreground">{c.content}</p>
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
      ) : (
        <div className="flex flex-col gap-6">
          {/* 어드민 툴바 */}
          <Toolbar
            search={{
              value: search,
              onChange: (v) => { setSearch(v); setPage(0); },
              placeholder: t('form.placeholder.search_title_content', { defaultValue: '제목·내용 검색' }),
            }}
            filterSlot={
              <FilterSelect
                label={t('form.label.isPublic', { defaultValue: '공개 여부' })}
                value={isPublic === undefined ? '' : isPublic ? 'true' : 'false'}
                options={[
                  { value: 'true', label: t('common.public', { defaultValue: '공개' }) },
                  { value: 'false', label: t('common.private', { defaultValue: '비공개' }) },
                ]}
                placeholder={t('common.all', { defaultValue: '전체' })}
                onChange={(v) => {
                  setIsPublic(v === '' ? undefined : v === 'true');
                  setPage(0);
                }}
              />
            }
            rightSlot={
              <>
                {selectedIds.length > 0 && (
                  <Button size="sm" variant="danger" onClick={handleBatchDelete}>
                    {t('ui.button.deleteSelected', { defaultValue: '선택 삭제 ({{count}})', count: selectedIds.length })}
                  </Button>
                )}
                <Button size="sm" onClick={() => router.push(`/boards/${boardId}/topics/create`)}>
                  {t('ui.button.add', { defaultValue: '추가' })} {t('board.topic.title', { defaultValue: '게시글' })}
                </Button>
              </>
            }
          />

          {/* 타입별 목록 렌더러 */}
          {board && data ? (
            <BoardListRenderer
              board={board}
              topics={data.content}
              apiOptions={options}
              onTopicClick={(topic) => router.push(`/boards/${boardId}/topics/${topic.id}`)}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">{t('common.loading', { defaultValue: '로딩 중...' })}</div>
          )}

          {/* 페이지네이션 */}
          {data && (
            <PaginationFooter
              page={page}
              size={size}
              totalElements={data.totalElements}
              totalPages={data.totalPages}
              onPageChange={setPage}
              onSizeChange={(s) => { setSize(s); setPage(0); }}
              currentCount={data.content.length}
            />
          )}
        </div>
      )}
    </div>
    </>
  );
}
