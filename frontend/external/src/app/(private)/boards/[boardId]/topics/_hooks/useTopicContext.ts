'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTopics, getTopic, getComments, getBoard } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Comment, Board } from 'common/types';

export function useTopicContext(boardId: string) {
  const router = useRouter();
  const options = useApiOptions();

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

  const handleSizeChange = (s: number) => {
    setSize(s);
    setPage(0);
  };

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
    selectedTopicId,
    previewTopic,
    previewComments,
    previewLoading,
    // setters
    setPage,
    setSelectedTopicId,
    // handlers
    handleSizeChange,
    navigateToDetail,
    // options (JSX에서 apiOptions prop으로 필요)
    options,
    // derived
    boardType,
    isNormal,
    hasPreview,
  };
}
