'use client';

import { useState } from 'react';
import { useAuth } from 'common';
import { createComment } from 'common/services';
import type { ApiOptions } from 'common/types';
import { Button, Textarea } from 'common/ui';
import { useLanguage } from 'common/utils';

export type CommentWriteFormProps = {
  topicId: string;
  apiOptions: ApiOptions;
  onSuccess: () => void;
};

export function CommentWriteForm({ topicId, apiOptions, onSuccess }: CommentWriteFormProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!user?.userId) {
      setError(t('message.loginRequired'));
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
      setError(err instanceof Error ? err.message : t('message.commentFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('post.commentPlaceholder')}
        rows={3}
        disabled={!user?.userId}
        className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:ring-ring"
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      <div className="mt-2">
        <Button type="submit" disabled={submitting || !content.trim() || !user?.userId}>
          {submitting ? t('post.submitting') : t('post.registerComment')}
        </Button>
      </div>
    </form>
  );
}
