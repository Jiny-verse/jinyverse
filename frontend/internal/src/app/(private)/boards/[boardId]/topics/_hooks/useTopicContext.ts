'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getTopics, getTopic, getComments, deleteTopic, getBoard } from 'common/services';
import { useLanguage, parseApiError } from 'common/utils';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Comment, Board } from 'common/types';

export function useTopicContext(boardId: string) {
  const router = useRouter();
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

  const handleDeleteCancel = () => {
    setPendingDelete(null);
  };

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(0);
  };

  const handleIsPublicChange = (v: string) => {
    setIsPublic(v === '' ? undefined : v === 'true');
    setPage(0);
  };

  const handleSizeChange = (s: number) => {
    setSize(s);
    setPage(0);
  };

  const navigateToCreate = () => router.push(`/boards/${boardId}/topics/create`);
  const navigateToEdit = (id: string) => router.push(`/boards/${boardId}/topics/${id}/edit`);
  const navigateToDetail = (id: string) => router.push(`/boards/${boardId}/topics/${id}`);

  const boardType = board?.type ?? 'normal';
  const isNormal = boardType === 'normal';
  const hasPreview = selectedTopicId != null;

  return {
    // state
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
    // setters
    setPage,
    setSelectedIds,
    setSelectedTopicId,
    // handlers
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
    // options (JSX에서 apiOptions prop으로 필요)
    options,
    // derived
    boardType,
    isNormal,
    hasPreview,
  };
}
