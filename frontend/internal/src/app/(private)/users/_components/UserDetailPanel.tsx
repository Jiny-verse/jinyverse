'use client';

import { useState } from 'react';
import { DetailPreviewPanel } from 'common/components';
import { Avatar, Badge, Switch } from 'common/ui';
import { ConfirmDialog } from 'common/components';
import { updateUser } from 'common/services';
import type { ApiOptions, User } from 'common/types';

const ROLE_OPTIONS = [
  { value: 'user', label: '일반 (user)' },
  { value: 'admin', label: '관리자 (admin)' },
];

interface UserDetailPanelProps {
  user: User;
  apiOptions: ApiOptions;
  onClose: () => void;
  onUpdated: (user: User) => void;
}

export function UserDetailPanel({ user, apiOptions, onClose, onUpdated }: UserDetailPanelProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | {
    title: string;
    message: string;
    onConfirm: () => void;
  }>(null);

  const handleUpdate = async (body: Parameters<typeof updateUser>[2]) => {
    setMessage(null);
    setSaving(true);
    try {
      const updated = await updateUser(apiOptions, user.id, body);
      onUpdated(updated);
      setMessage({ type: 'ok', text: '변경되었습니다.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : '변경에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmThen = (title: string, message: string, action: () => void) => {
    setConfirmAction({ title, message, onConfirm: action });
  };

  return (
    <>
      <DetailPreviewPanel
        title={user.username}
        onClose={onClose}
      >
        <div className="space-y-5">
          {/* 기본 정보 */}
          <div className="flex items-center gap-3">
            <Avatar
              fileId={user.profileImageFileId}
              apiOptions={apiOptions}
              alt={user.nickname}
              size="lg"
            />
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">@{user.username}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          {/* 상태 배지 */}
          <div className="flex flex-wrap gap-1.5">
            {user.role && (
              <Badge variant={user.role === 'admin' ? 'error' : 'default'}>{user.role}</Badge>
            )}
            {user.isLocked && <Badge variant="warning">잠금</Badge>}
            {user.isActive === false && <Badge variant="error">비활성</Badge>}
            {!user.isLocked && user.isActive !== false && <Badge variant="success">정상</Badge>}
          </div>

          {message && (
            <p className={`text-xs ${message.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
              {message.text}
            </p>
          )}

          <div className="border-t border-gray-100 pt-4 space-y-4">
            {/* 잠금 해제 */}
            {user.isLocked && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">계정 잠금 해제</span>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    confirmThen('잠금 해제', '이 계정의 잠금을 해제하시겠습니까?', () =>
                      handleUpdate({ isLocked: false })
                    )
                  }
                  className="rounded border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-100 disabled:opacity-50"
                >
                  잠금 해제
                </button>
              </div>
            )}

            {/* 활성/비활성 토글 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">계정 활성화</span>
              <Switch
                checked={user.isActive !== false}
                disabled={saving}
                onChange={(e) => {
                  const next = e.target.checked;
                  const msg = next
                    ? '이 계정을 활성화하시겠습니까?'
                    : '이 계정을 비활성화하시겠습니까?';
                  confirmThen(next ? '계정 활성화' : '계정 비활성화', msg, () =>
                    handleUpdate({ isActive: next })
                  );
                }}
              />
            </div>

            {/* 권한 변경 */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-gray-700">권한</span>
              <select
                value={user.role ?? 'user'}
                disabled={saving}
                onChange={(e) => {
                  const next = e.target.value;
                  confirmThen(
                    '권한 변경',
                    `이 계정의 권한을 '${next}'으로 변경하시겠습니까?`,
                    () => handleUpdate({ role: next })
                  );
                }}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 메타 정보 */}
          {user.createdAt && (
            <p className="text-xs text-gray-400">
              가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>
      </DetailPreviewPanel>

      {confirmAction && (
        <ConfirmDialog
          isOpen={true}
          title={confirmAction.title}
          message={confirmAction.message}
          variant="danger"
          onClose={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </>
  );
}
