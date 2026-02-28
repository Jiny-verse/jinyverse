'use client';

import { useParams } from 'next/navigation';
import { DetailPreviewPanel, BoardListRenderer, PostDetailRenderer, TopicTable } from 'common/components';
import { PaginationFooter } from 'common/ui';
import { formatRelativeOrAbsolute } from 'common';
import { useLanguage } from 'common/utils';
import { useTopicContext } from './_hooks/useTopicContext';

export default function TopicsPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const { t } = useLanguage();

  const {
    board,
    data,
    error,
    page,
    size,
    selectedTopicId,
    previewTopic,
    previewComments,
    previewLoading,
    setPage,
    setSelectedTopicId,
    handleSizeChange,
    navigateToDetail,
    options,
    isNormal,
    hasPreview,
  } = useTopicContext(boardId);

  if (error) {
    return (
      <div className="min-h-screen pt-[90px]">
        <div className="max-w-7xl mx-auto">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

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
                      onSizeChange: handleSizeChange,
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
              onTopicClick={(topic) => navigateToDetail(topic.id)}
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
              onSizeChange={handleSizeChange}
              currentCount={data.content.length}
            />
          )}
        </div>
      )}
      </div>
    </div>
  );
}
