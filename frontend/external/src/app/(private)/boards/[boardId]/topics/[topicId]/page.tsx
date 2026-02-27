'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTopic, getComments, getBoard } from 'common/services';
import { formatRelativeOrAbsolute } from 'common';
import { PostDetailRenderer } from 'common/components';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { Topic, Comment } from 'common/types';
import type { Board } from 'common/types';
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
  const [board, setBoard] = useState<Board | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { roots, repliesByParent } = useMemo(() => buildCommentTree(comments), [comments]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.all([
      getBoard(options, boardId),
      getTopic(options, topicId),
      getComments(options, { topicId, size: 50 }),
    ])
      .then(([boardData, topicData, res]) => {
        if (!cancelled) {
          setBoard(boardData);
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
  }, [options.baseUrl, options.channel, boardId, topicId]);

  if (error) {
    return (
      <div className="min-h-screen pt-[90px]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!topic || !board) {
    return (
      <div className="min-h-screen pt-[90px]">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[90px]">
      <div className="max-w-7xl mx-auto">
        <article className="mb-8">
          <PostDetailRenderer board={board} topic={topic} apiOptions={options} />
        </article>
        <section>
          <h2 className="text-lg font-semibold mb-4">{t('post.comments')} ({comments.filter((c) => !c.isDeleted).length})</h2>
          {!options.role && (
            <p className="text-muted-foreground text-sm mb-4">{t('post.commentLoginHint')}</p>
          )}
          <ul className="space-y-3 list-none pl-0">
            {roots.map((c) => (
              <li key={c.id}>
                <div className="py-2 border-b border-border">
                  <p className="text-sm text-muted-foreground">{c.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(c.createdAt)}</p>
                  <p className="mt-1">{c.content}</p>
                </div>
                {repliesByParent.get(c.id)?.length ? (
                  <ul className="mt-2 space-y-2 list-none ml-4 border-l-2 border-border pl-3">
                    {repliesByParent.get(c.id)!.map((r) => (
                      <li key={r.id} className="py-2 border-b border-border">
                        <p className="text-sm text-muted-foreground">{r.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(r.createdAt)}</p>
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
    </div>
  );
}
