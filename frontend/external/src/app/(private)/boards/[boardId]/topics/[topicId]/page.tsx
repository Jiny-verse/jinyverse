'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTopic, getComments } from 'common/services';
import { formatRelativeOrAbsolute } from 'common';
import { ContentViewer } from 'common/components';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Comment } from 'common/types';
import { useLanguage } from 'common/utils';

function buildCommentTree(comments: Comment[]) {
  const visible = comments.filter((c) => !c.isDeleted);
  const roots = visible.filter((c) => !c.upperCommentId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const repliesByParent = new Map<string, Comment[]>();
  for (const c of visible) {
    if (c.upperCommentId) {
      const list = repliesByParent.get(c.upperCommentId) ?? [];
      list.push(c);
      repliesByParent.set(c.upperCommentId, list);
    }
  }
  for (const list of repliesByParent.values()) list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return { roots, repliesByParent };
}

export default function TopicDetailPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const topicId = params.topicId as string;
  const options = useApiOptions();
  const { t } = useLanguage();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { roots, repliesByParent } = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.all([getTopic(options, topicId), getComments(options, { topicId, size: 50 })])
      .then(([topicData, res]) => {
        if (!cancelled) {
          setTopic(topicData);
          setComments(res.content);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [options.baseUrl, options.channel, topicId]);

  if (error) {
    return (
      <div className="min-h-screen pt-[90px]">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen pt-[90px]">
        <p className="text-gray-400">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[90px]">
      <article className="rounded-lg border border-gray-700 bg-gray-800/50 p-6 mb-8">
        <h1 className="text-2xl font-bold mb-2">{topic.title}</h1>
        <p className="text-sm text-gray-400 mb-4">
          {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)} · {t('post.viewCount', { count: topic.viewCount ?? 0 })}
        </p>
        <ContentViewer content={topic.content} className="prose-invert max-w-none" />
      </article>
      <section>
        <h2 className="text-lg font-semibold mb-4">{t('post.comments')} ({comments.filter((c) => !c.isDeleted).length})</h2>
        {!options.role && (
          <p className="text-gray-500 text-sm mb-4">{t('post.commentLoginHint')}</p>
        )}
        <ul className="space-y-3 list-none pl-0">
          {roots.map((c) => (
            <li key={c.id}>
              <div className="rounded border border-gray-700 p-3 bg-gray-800/30">
                <p className="text-sm text-gray-400">{c.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(c.createdAt)}</p>
                <p className="mt-1">{c.content}</p>
              </div>
              {repliesByParent.get(c.id)?.length ? (
                <ul className="mt-2 space-y-2 list-none ml-4 border-l-2 border-gray-600 pl-3">
                  {repliesByParent.get(c.id)!.map((r) => (
                    <li key={r.id} className="rounded border border-gray-700 p-3 bg-gray-800/30">
                      <p className="text-sm text-gray-400">{r.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(r.createdAt)}</p>
                      <p className="mt-1">{r.content}</p>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
