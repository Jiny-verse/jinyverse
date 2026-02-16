'use client';

import { TopicForm } from '@/components/topic';
import { useParams, useRouter } from 'next/navigation';

export default function CreateTopicPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        새 게시글 작성
      </h1>
      <TopicForm
        mode="create"
        boardId={boardId}
        onSuccess={(topicId) => router.push(`/boards/${boardId}/topics/${topicId}`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
