'use client';

import { useState } from 'react';
import { useAuth } from 'common';
import { updateComment, deleteComment } from 'common/services';
import type { ApiOptions } from 'common/types';
import type { Comment } from 'common/types';
import { Button, Textarea } from 'common/ui';

export type CommentSectionProps = {
  comments: Comment[];
  apiOptions: ApiOptions;
  onReload: () => void;
};

/** 본인 댓글이거나 ADMIN이면 수정/삭제 가능 */
function canModify(comment: Comment, currentUserId: string | undefined, role: string | undefined): boolean {
  if (!currentUserId && role?.toLowerCase() !== 'admin') return false;
  return comment.userId === currentUserId || role?.toLowerCase() === 'admin';
}

export function CommentSection({ comments, apiOptions, onReload }: CommentSectionProps) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const visible = comments.filter((c) => !c.isDeleted);
  const currentUserId = user?.userId;
  const role = user?.role;

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
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    await deleteComment(apiOptions, id);
    if (editingId === id) {
      setEditingId(null);
      setEditContent('');
    }
    onReload();
  };

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">댓글 ({visible.length})</h2>
      <ul className="space-y-3">
        {visible.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-2 rounded border border-gray-700 p-3 bg-gray-800/30"
          >
            {editingId === c.id ? (
              <>
                <p className="text-sm text-gray-400">작성자 {c.userId}</p>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:ring-gray-500"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={submitting || !editContent.trim()}
                  >
                    저장
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleCancelEdit} disabled={submitting}>
                    취소
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-400">작성자 {c.userId}</p>
                    <p className="mt-1 wrap-break-word">{c.content}</p>
                  </div>
                  {canModify(c, currentUserId, role) && (
                    <div className="flex gap-2 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(c)}
                        className="text-gray-400 text-sm hover:text-white hover:underline"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="text-red-400 text-sm hover:underline"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
