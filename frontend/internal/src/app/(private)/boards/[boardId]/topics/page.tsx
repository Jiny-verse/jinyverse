'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatRelativeOrAbsolute } from 'common';
import { useLanguage } from 'common/utils';
import {
  DetailPreviewPanel,
  FilterSelect,
  BoardListRenderer,
  PostDetailRenderer,
} from 'common/components';
import { PaginationFooter, Toolbar, Button, ConfirmDialog } from 'common/ui';
import { Table } from './_components';
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
    search,
    isPublic,
    selectedIds,
    pendingDelete,
    selectedTopicId,
    previewTopic,
    previewComments,
    previewLoading,
    setPage,
    setSelectedIds,
    setSelectedTopicId,
    handleDelete,
    handleBatchDelete,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleSearchChange,
    handleIsPublicChange,
    handleSizeChange,
    navigateToCreate,
    navigateToEdit,
    navigateToDetail,
    options,
    isNormal,
    hasPreview,
  } = useTopicContext(boardId);

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
      onCancel={handleDeleteCancel}
    />
  );

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
                      onSizeChange: handleSizeChange,
                    }
                  : undefined
              }
              search={{
                value: search,
                onChange: handleSearchChange,
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
                  onChange={handleIsPublicChange}
                />
              }
              selection={{ selectedIds, onSelectionChange: setSelectedIds }}
              onBatchDelete={selectedIds.length ? handleBatchDelete : undefined}
              onAdd={navigateToCreate}
              onEdit={(row) => navigateToEdit(row.id)}
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
              onChange: handleSearchChange,
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
                onChange={handleIsPublicChange}
              />
            }
            rightSlot={
              <>
                {selectedIds.length > 0 && (
                  <Button size="sm" variant="danger" onClick={handleBatchDelete}>
                    {t('ui.button.deleteSelected', { defaultValue: '선택 삭제 ({{count}})', count: selectedIds.length })}
                  </Button>
                )}
                <Button size="sm" onClick={navigateToCreate}>
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
              onTopicClick={(topic) => navigateToDetail(topic.id)}
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
              onSizeChange={handleSizeChange}
              currentCount={data.content.length}
            />
          )}
        </div>
      )}
    </div>
    </>
  );
}
