'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTopics, getTopic, getComments, getBoard } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { DetailPreviewPanel, BoardListRenderer, PostDetailRenderer, TopicTable } from 'common/components';
import { PaginationFooter } from 'common/ui';
import { formatRelativeOrAbsolute } from 'common';
import type { Topic, Comment, Board } from 'common/types';
import { useLanguage } from 'common/utils';

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
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [previewComments, setPreviewComments] = useState<Comment[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    getBoard(options, boardId)
      .then(setBoard)
      .catch(() => setBoard(null));
  }, [options.baseUrl, options.channel, boardId]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getTopics(options, { page, size, boardId })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [options.baseUrl, options.channel, options.role, boardId, page, size]);

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
      .then(([topic, res]) => {
        if (!cancelled) {
          setPreviewTopic(topic);
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

  if (error) {
    return (
      <div className="min-h-screen pt-[90px]">
        <div className="max-w-7xl mx-auto">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  const boardType = board?.type ?? 'normal';
  const isNormal = boardType === 'normal';
  const hasPreview = selectedTopicId != null;

  const previewPanel = hasPreview && (
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
              <PostDetailRenderer board={board} topic={previewTopic} apiOptions={options} />
            </div>
            <section>
              <h2 className="text-sm font-semibold text-foreground mb-2">
                {t('post.comments')} ({previewComments.filter((c) => !c.isDeleted).length})
              </h2>
              <ul className="space-y-2">
                {previewComments
                  .filter((c) => !c.isDeleted)
                  .map((c) => (
                    <li key={c.id} className="rounded border border-border p-2 bg-card text-sm">
                      <p className="text-muted-foreground text-xs">
                        {c.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(c.createdAt)}
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
  );

  return (
    <div className="min-h-screen pt-[90px]">
      <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{board?.name ?? t('board.topic.title')}</h1>

      {isNormal ? (
        <div className={hasPreview ? 'flex gap-0 h-[calc(100vh-12rem)] min-h-[400px]' : ''}>
          <div className={hasPreview ? 'w-1/2 min-w-0 pr-4 flex flex-col' : ''}>
            <TopicTable
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
                      onSizeChange: (s) => { setSize(s); setPage(0); },
                    }
                  : undefined
              }
              onRowClick={(row) => setSelectedTopicId(row.id)}
              selectedRowId={selectedTopicId}
            />
          </div>
          {previewPanel}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {board && data ? (
            <BoardListRenderer
              board={board}
              topics={data.content}
              apiOptions={options}
              onTopicClick={(topic) => router.push(`/boards/${boardId}/topics/${topic.id}`)}
            />
          ) : (
            <div className="py-8 text-center text-muted-foreground">{t('common.loading')}</div>
          )}
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
    </div>
  );
}
