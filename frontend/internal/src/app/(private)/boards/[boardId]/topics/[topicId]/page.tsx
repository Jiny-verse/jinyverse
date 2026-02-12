'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTopic, getComments } from 'common/services';
import { formatRelativeOrAbsolute } from 'common';
import { ContentViewer } from 'common/components';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Comment } from 'common/types';
import { CommentSection, CommentWriteForm } from './_components';

export default function TopicDetailPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const topicId = params.topicId as string;
  const options = useApiOptions();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([getTopic(options, topicId), getComments(options, { topicId, size: 50 })])
      .then(([t, res]) => {
        setTopic(t);
        setComments(res.content);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [options.baseUrl, options.channel, topicId]);

  useEffect(() => {
    load();
  }, [load]);

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
          {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)} · 조회 {topic.viewCount ?? 0}
        </p>
        <ContentViewer content={topic.content} className="prose-invert max-w-none" />
      </article>
      <CommentWriteForm topicId={topicId} apiOptions={options} onSuccess={load} />
      <CommentSection topicId={topicId} comments={comments} apiOptions={options} onReload={load} />
    </div>
  );
}
