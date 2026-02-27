'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTopic, getComments, getBoard } from 'common/services';
import { PostDetailRenderer } from 'common/components';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Comment, Board } from 'common/types';
import { useLanguage } from 'common/utils';
import { CommentSection, CommentWriteForm } from './_components';

export default function TopicDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const boardId = params.boardId as string;
  const topicId = params.topicId as string;
  const options = useApiOptions();
  const [board, setBoard] = useState<Board | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      <Link
        href={`/boards/${boardId}/topics`}
        className="text-muted-foreground hover:text-foreground mb-4 inline-block"
      >
        ← {t('board.topic.title')}
      </Link>

      <div className="mb-8">
        <PostDetailRenderer board={board} topic={topic} apiOptions={options} />
      </div>

      <CommentWriteForm topicId={topicId} apiOptions={options} onSuccess={load} />
      <CommentSection topicId={topicId} comments={comments} apiOptions={options} onReload={load} />
    </div>
  );
}
