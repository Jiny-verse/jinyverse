'use client';

import { useState } from 'react';
import { useAuth } from 'common';
import { createComment } from 'common/services';
import type { ApiOptions } from 'common/types';
import { Button, Textarea } from 'common/ui';

export type CommentWriteFormProps = {
  topicId: string;
  apiOptions: ApiOptions;
  onSuccess: () => void;
};

export function CommentWriteForm({ topicId, apiOptions, onSuccess }: CommentWriteFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!user?.userId) {
      setError('로그인이 필요합니다.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createComment(apiOptions, {
        topicId,
        userId: user.userId,
        content: trimmed,
      });
      setContent('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '댓글 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요."
        rows={3}
        disabled={!user?.userId}
        className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:ring-gray-500"
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      <div className="mt-2">
        <Button type="submit" disabled={submitting || !content.trim() || !user?.userId}>
          {submitting ? '등록 중…' : '댓글 등록'}
        </Button>
      </div>
    </form>
  );
}
