'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getTopic, getComments, getBoard, deleteTopic } from 'common/services';
import { PostDetailRenderer } from 'common/components';
import { Button, ConfirmDialog } from 'common/ui';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Comment, Board } from 'common/types';
import { useLanguage } from 'common/utils';
import { CommentSection, CommentWriteForm } from './_components';

export default function TopicDetailPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const boardId = params.boardId as string;
  const topicId = params.topicId as string;
  const options = useApiOptions();
  const [board, setBoard] = useState<Board | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteTopic(options, topicId);
      router.push(`/boards/${boardId}/topics`);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const load = useCallback(() => {
    Promise.all([
      getBoard(options, boardId),
      getTopic(options, topicId),
      getComments(options, { topicId, size: 50 }),
    ])
      .then(([b, topic, res]) => {
        setBoard(b);
        setTopic(topic);
        setComments(res.content);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [options.baseUrl, options.channel, boardId, topicId]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="">
        <p className="text-destructive">{error}</p>
        <Link
          href={`/boards/${boardId}/topics`}
          className="mt-4 inline-block text-muted-foreground hover:text-foreground"
        >
          {t('board.topic.title')}
        </Link>
      </div>
    );
  }

  if (!topic || !board) {
    return (
      <div className="">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/boards/${boardId}/topics`}
          className="text-muted-foreground hover:text-foreground inline-block"
        >
          ← {t('board.topic.title')}
        </Link>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push(`/boards/${boardId}/topics/${topicId}/edit`)}
          >
            {t('ui.button.edit', { defaultValue: '수정' })}
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={deleting}
            onClick={() => setConfirmDelete(true)}
          >
            {t('ui.button.delete', { defaultValue: '삭제' })}
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <PostDetailRenderer board={board} topic={topic} apiOptions={options} />
      </div>

      <CommentWriteForm topicId={topicId} apiOptions={options} onSuccess={load} />
      <CommentSection topicId={topicId} comments={comments} apiOptions={options} onReload={load} />

      <ConfirmDialog
        isOpen={confirmDelete}
        message={t('message.confirmDelete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
