'use client';

import { TopicForm } from '@/components/topic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBoard, getTopic } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Board } from 'common/schemas';

export default function EditTopicPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const topicId = params.topicId as string;
  const options = useApiOptions();

  const [board, setBoard] = useState<Board | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getBoard(options, boardId), getTopic(options, topicId)])
      .then(([b, t]) => {
        setBoard(b);
        setTopic(t);
      })
      .catch(() => setError('데이터를 불러오는데 실패했습니다.'))
      .finally(() => setIsLoading(false));
  }, [boardId, topicId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error || !board || !topic) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-red-500">{error || '데이터를 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        게시글 수정
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
