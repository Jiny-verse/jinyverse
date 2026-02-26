'use client';

import { TopicForm } from '../_components/TopicForm';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBoard } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Board } from 'common/schemas';

export default function CreateTopicPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const options = useApiOptions();

  const [board, setBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBoard(options, boardId)
      .then(setBoard)
      .catch(() => setError('게시판 정보를 불러오는데 실패했습니다.'))
      .finally(() => setIsLoading(false));
  }, [boardId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-red-500">{error || '게시판을 찾을 수 없습니다.'}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-foreground">
        새 게시글 작성
      </h1>
      <TopicForm
        mode="create"
        board={board}
        onSuccess={(topicId) => router.push(`/boards/${boardId}/topics/${topicId}`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
