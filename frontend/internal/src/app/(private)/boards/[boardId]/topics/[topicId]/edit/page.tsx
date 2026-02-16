'use client';

import { TopicForm } from '@/components/topic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Topic } from 'common/schemas';

export default function EditTopicPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const topicId = params.topicId as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await fetch(`/api/topics/${topicId}`);
        if (!response.ok) throw new Error('Failed to fetch topic');
        const data = await response.json();
        setTopic(data);
      } catch (err) {
        console.error('Failed to fetch topic:', err);
        setError('게시글을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [topicId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-red-500">{error || '게시글을 찾을 수 없습니다.'}</div>
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
        boardId={boardId}
        topicId={topicId}
        initialData={topic}
        onSuccess={() => router.push(`/boards/${boardId}/topics/${topicId}`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
