'use client';

import { useMemo, useState } from 'react';
import { useAuth, formatRelativeOrAbsolute } from 'common';
import { createComment, updateComment, deleteComment } from 'common/services';
import type { ApiOptions } from 'common/types';
import type { Comment } from 'common/types';
import { Button, Textarea } from 'common/ui';
import { useLanguage } from 'common/utils';

export type CommentSectionProps = {
  topicId: string;
  comments: Comment[];
  apiOptions: ApiOptions;
  onReload: () => void;
};

/** 본인 댓글이거나 ADMIN이면 수정/삭제 가능 */
function canModify(comment: Comment, currentUserId: string | undefined, role: string | undefined): boolean {
  if (!currentUserId && role?.toLowerCase() !== 'admin') return false;
  return comment.author?.id === currentUserId || role?.toLowerCase() === 'admin';
}

function buildCommentTree(comments: Comment[]): { roots: Comment[]; repliesByParent: Map<string, Comment[]> } {
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
  for (const list of repliesByParent.values()) {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return { roots, repliesByParent };
}

export function CommentSection({ topicId, comments, apiOptions, onReload }: CommentSectionProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  const { roots, repliesByParent } = useMemo(() => buildCommentTree(comments), [comments]);
  const currentUserId = user?.userId;
  const role = user?.role;
  const totalVisible = comments.filter((c) => !c.isDeleted).length;

  const handleStartEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    setSubmitting(true);
    try {
      await updateComment(apiOptions, editingId, { content: editContent.trim() });
      setEditingId(null);
      setEditContent('');
      onReload();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('post.deleteComment'))) return;
    await deleteComment(apiOptions, id);
    if (editingId === id) {
      setEditingId(null);
      setEditContent('');
    }
    onReload();
  };

  const handleReplySubmit = async (upperCommentId: string) => {
    const trimmed = replyContent.trim();
    if (!trimmed || !user?.userId) return;
    setReplySubmitting(true);
    try {
      await createComment(apiOptions, {
        topicId,
        userId: user.userId,
        upperCommentId,
        content: trimmed,
      });
      setReplyingToId(null);
      setReplyContent('');
      onReload();
    } finally {
      setReplySubmitting(false);
    }
  };

  const renderComment = (c: Comment, isReply: boolean) => (
    <li key={c.id} className={isReply ? 'ml-4 mt-2 border-l-2 border-gray-600 pl-3' : undefined}>
      <div className="flex flex-col gap-2 rounded border border-gray-700 p-3 bg-gray-800/30">
        {editingId === c.id ? (
          <>
            <p className="text-sm text-gray-400">{c.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(c.createdAt)}</p>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:ring-gray-500"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={submitting || !editContent.trim()}>{t('ui.button.save')}</Button>
              <Button size="sm" variant="secondary" onClick={handleCancelEdit} disabled={submitting}>{t('ui.button.cancel')}</Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-400">{c.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(c.createdAt)}</p>
                <p className="mt-1 wrap-break-word">{c.content}</p>
              </div>
              <div className="flex gap-2 shrink-0 ml-2">
                {user?.userId && (
                  <button type="button" onClick={() => { setReplyingToId((prev) => (prev === c.id ? null : c.id)); setReplyContent(''); }} className="text-gray-400 text-sm hover:text-white hover:underline">{t('post.reply')}</button>
                )}
                {canModify(c, currentUserId, role) && (
                  <>
                    <button type="button" onClick={() => handleStartEdit(c)} className="text-gray-400 text-sm hover:text-white hover:underline">{t('ui.button.edit')}</button>
                    <button type="button" onClick={() => handleDelete(c.id)} className="text-red-400 text-sm hover:underline">{t('ui.button.delete')}</button>
                  </>
                )}
              </div>
            </div>
            {replyingToId === c.id && (
              <div className="mt-2 flex flex-col gap-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={t('post.replyPlaceholder')}
                  rows={2}
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:ring-gray-500 text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleReplySubmit(c.id)} disabled={replySubmitting || !replyContent.trim()}>
                    {replySubmitting ? t('post.submitting') : t('post.registerComment')}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => { setReplyingToId(null); setReplyContent(''); }} disabled={replySubmitting}>{t('ui.button.cancel')}</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {repliesByParent.get(c.id)?.length ? (
        <ul className="mt-2 space-y-2 list-none pl-0">{repliesByParent.get(c.id)!.map((reply) => renderComment(reply, true))}</ul>
      ) : null}
    </li>
  );

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{t('post.comments')} ({totalVisible})</h2>
      <ul className="space-y-3 list-none pl-0">
        {roots.map((c) => renderComment(c, false))}
      </ul>
    </section>
  );
}
