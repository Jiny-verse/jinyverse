'use client';

import { TopicForm } from '../../_components/TopicForm';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBoard, getTopic } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Board } from 'common/schemas';
import { useLanguage } from 'common/utils';

export default function EditTopicPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const topicId = params.topicId as string;
  const options = useApiOptions();
  const { t } = useLanguage();

  const [board, setBoard] = useState<Board | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getBoard(options, boardId), getTopic(options, topicId)])
      .then(([b, topic]) => {
        setBoard(b);
        setTopic(topic);
      })
      .catch(() => setError(t('message.error')))
      .finally(() => setIsLoading(false));
  }, [boardId, topicId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (error || !board || !topic) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-red-500">{error || t('common.noData')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-foreground">
        {t('board.topic.edit')}
      </h1>
      <TopicForm
        mode="edit"
        board={board}
        topicId={topicId}
        initialData={topic}
        onSuccess={() => router.push(`/boards/${boardId}/topics/${topicId}`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
