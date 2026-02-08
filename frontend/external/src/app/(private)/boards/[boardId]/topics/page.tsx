'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getTopics, getTopic, getComments } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { DetailPreviewPanel } from 'common/components';
import type { Topic, Comment } from 'common/types';
import { TopicTable } from './_components/Table';

export default function TopicsPage() {
  const params = useParams();
  const boardId = params.boardId as string;
  const options = useApiOptions();
  const [data, setData] = useState<{
    content: Topic[];
    totalElements: number;
    totalPages: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [previewTopic, setPreviewTopic] = useState<Topic | null>(null);
  const [previewComments, setPreviewComments] = useState<Comment[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    getTopics(options, { page, size, boardId })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [options.baseUrl, options.channel, options.role, boardId, page, size]);

  useEffect(() => {
    if (!selectedTopicId) {
      setPreviewTopic(null);
      setPreviewComments([]);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    Promise.all([
      getTopic(options, selectedTopicId),
      getComments(options, { topicId: selectedTopicId, size: 50 }),
    ])
      .then(([t, res]) => {
        if (!cancelled) {
          setPreviewTopic(t);
          setPreviewComments(res.content);
        }
      })
      .catch(() => {
        if (!cancelled) setPreviewTopic(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [options.baseUrl, options.channel, selectedTopicId]);

  if (error) {
    return (
      <div className="min-h-screen pt-[90px]">
        <p className="text-red-400">{error}</p>
        <Link href="/landing" className="mt-4 inline-block text-gray-400 hover:text-white">
          게시판 목록
        </Link>
      </div>
    );
  }

  const hasPreview = selectedTopicId != null;

  return (
    <div className="min-h-screen pt-[90px]">
      <Link href="/landing" className="text-gray-400 hover:text-white mb-4 inline-block">
        ← 게시판 목록
      </Link>
      <h1 className="text-2xl font-bold mb-6">게시글</h1>
      <div className={hasPreview ? 'flex gap-0 h-[calc(100vh-12rem)] min-h-[400px]' : ''}>
        <div className={hasPreview ? 'w-1/2 min-w-0 pr-4 flex flex-col' : ''}>
          <TopicTable
            boardId={boardId}
            data={data?.content ?? []}
            isLoading={!data}
            pagination={
              data
                ? {
                    page,
                    size,
                    totalElements: data.totalElements,
                    totalPages: data.totalPages,
                    onPageChange: setPage,
                    onSizeChange: (s) => {
                      setSize(s);
                      setPage(0);
                    },
                  }
                : undefined
            }
            onRowClick={(row) => setSelectedTopicId(row.id)}
            selectedRowId={selectedTopicId}
          />
        </div>
        {hasPreview && (
          <div className="w-1/2 min-w-0 flex flex-col">
            <DetailPreviewPanel
              onClose={() => setSelectedTopicId(null)}
              expandHref={`/boards/${boardId}/topics/${selectedTopicId}`}
              isLoading={previewLoading}
              title={previewTopic?.title}
            >
              {previewTopic && (
                <>
                  <article className="rounded-lg border border-gray-200 bg-white p-4 mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      작성일 {previewTopic.createdAt} · 조회 {previewTopic.viewCount ?? 0}
                    </p>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-900">
                      {previewTopic.content}
                    </div>
                  </article>
                  <section>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">
                      댓글 ({previewComments.length})
                    </h2>
                    <ul className="space-y-2">
                      {previewComments
                        .filter((c) => !c.isDeleted)
                        .map((c) => (
                          <li
                            key={c.id}
                            className="rounded border border-gray-200 p-2 bg-white text-sm"
                          >
                            <p className="text-gray-500 text-xs">작성자 {c.userId}</p>
                            <p className="mt-0.5 text-gray-900">{c.content}</p>
                          </li>
                        ))}
                    </ul>
                  </section>
                </>
              )}
            </DetailPreviewPanel>
          </div>
        )}
      </div>
    </div>
  );
}
