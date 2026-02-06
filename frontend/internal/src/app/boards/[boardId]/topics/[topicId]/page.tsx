'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTopic, getComments, deleteComment } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Comment } from 'common/types';

export default function TopicDetailPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const topicId = params.topicId as string;
  const options = useApiOptions();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    Promise.all([getTopic(options, topicId), getComments(options, { topicId, size: 50 })])
      .then(([t, res]) => {
        setTopic(t);
        setComments(res.content);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  };

  useEffect(() => {
    load();
  }, [options.baseUrl, options.channel, topicId]);

  const handleDeleteComment = async (id: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    await deleteComment(options, id);
    load();
  };

  if (error) {
    return (
      <div className="">
        <p className="text-red-400">{error}</p>
        <Link
          href={`/boards/${boardId}/topics`}
          className="mt-4 inline-block text-gray-400 hover:text-white"
        >
          게시글 목록
        </Link>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="">
      <Link
        href={`/boards/${boardId}/topics`}
        className="text-gray-400 hover:text-white mb-4 inline-block"
      >
        ← 게시글 목록
      </Link>
      <article className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
        <p className="text-sm text-gray-400 mb-4">
          작성일 {topic.createdAt} · 조회 {topic.viewCount ?? 0}
        </p>
        <div className="prose prose-invert max-w-none whitespace-pre-wrap">{topic.content}</div>
      </article>
      <section>
        <h2 className="text-lg font-semibold mb-4">
          댓글 ({comments.filter((c) => !c.isDeleted).length})
        </h2>
        <ul className="space-y-3">
          {comments
            .filter((c) => !c.isDeleted)
            .map((c) => (
              <li
                key={c.id}
                className="flex justify-between items-start rounded border border-gray-700 p-3 bg-gray-800/30"
              >
                <div>
                  <p className="text-sm text-gray-400">작성자 {c.userId}</p>
                  <p className="mt-1">{c.content}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteComment(c.id)}
                  className="text-red-400 text-sm hover:underline"
                >
                  삭제
                </button>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
