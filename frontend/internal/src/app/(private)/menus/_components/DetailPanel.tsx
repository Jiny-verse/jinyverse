'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Menu } from 'common/types';
import type { ApiOptions } from 'common/types';
import type { Board, Topic } from 'common/types';
import { getBoards, getTopics, updateBoard, updateTopic } from 'common/services';
import { Pencil, Trash2, Link2, Unlink } from 'lucide-react';
import { useLanguage } from 'common/utils';

const getChannelLabels = (t: (key: string, options?: any) => string): Record<string, string> => ({
  INTERNAL: t('channel.internal', { defaultValue: '내부' }),
  EXTERNAL: t('channel.external', { defaultValue: '외부' }),
  PUBLIC: t('channel.public', { defaultValue: '공개' }),
});

export interface DetailPanelProps {
  menu: Menu | null;
  apiOptions: ApiOptions;
  onEdit: (menu: Menu) => void;
  onDelete: (id: string) => void;
  onLinkChange?: () => void;
}

export function DetailPanel({
  menu,
  apiOptions,
  onEdit,
  onDelete,
  onLinkChange,
}: DetailPanelProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [linkedBoard, setLinkedBoard] = useState<Board | null>(null);
  const [linkedTopic, setLinkedTopic] = useState<Topic | null>(null);
  const [boardOptions, setBoardOptions] = useState<{ value: string; label: string }[]>([]);
  const [topicOptions, setTopicOptions] = useState<{ value: string; label: string }[]>([]);
  const [linkBoardId, setLinkBoardId] = useState('');
  const [linkTopicId, setLinkTopicId] = useState('');
  const [linking, setLinking] = useState(false);
  const { t } = useLanguage();
  const CHANNEL_LABELS = getChannelLabels(t);

  const loadLinked = useCallback(() => {
    if (!menu?.code) return;
    getBoards(apiOptions, { menuCode: menu.code, size: 1 })
      .then((res) => setLinkedBoard(res.content[0] ?? null))
      .catch(() => setLinkedBoard(null));
    getTopics(apiOptions, { menuCode: menu.code, size: 1 })
      .then((res) => setLinkedTopic(res.content[0] ?? null))
      .catch(() => setLinkedTopic(null));
  }, [menu?.code, apiOptions.baseUrl]);

  useEffect(() => {
    if (menu) {
      setShowDetail(false);
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShowDetail(true));
      });
      return () => cancelAnimationFrame(id);
    }
    setShowDetail(false);
  }, [menu?.id]);

  useEffect(() => {
    if (!menu) return;
    loadLinked();
    getBoards(apiOptions, { size: 100 })
      .then((res) =>
        setBoardOptions(res.content.map((b) => ({ value: b.id, label: b.name ?? b.id })))
      )
      .catch(() => setBoardOptions([]));
    getTopics(apiOptions, { size: 100 })
      .then((res) =>
        setTopicOptions(res.content.map((t) => ({ value: t.id, label: t.title ?? t.id })))
      )
      .catch(() => setTopicOptions([]));
  }, [menu?.id, menu?.code, apiOptions.baseUrl, loadLinked]);

  const handleLinkBoard = async () => {
    if (!menu?.code || !linkBoardId) return;
    setLinking(true);
    try {
      await updateBoard(apiOptions, linkBoardId, { menuCode: menu.code });
      loadLinked();
      setLinkBoardId('');
      onLinkChange?.();
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkBoard = async () => {
    if (!linkedBoard) return;
    setLinking(true);
    try {
      await updateBoard(apiOptions, linkedBoard.id, { menuCode: '' });
      loadLinked();
      onLinkChange?.();
    } finally {
      setLinking(false);
    }
  };

  const handleLinkTopic = async () => {
    if (!menu?.code || !linkTopicId) return;
    setLinking(true);
    try {
      await updateTopic(apiOptions, linkTopicId, { menuCode: menu.code });
      loadLinked();
      setLinkTopicId('');
      onLinkChange?.();
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkTopic = async () => {
    if (!linkedTopic) return;
    setLinking(true);
    try {
      await updateTopic(apiOptions, linkedTopic.id, { menuCode: '' });
      loadLinked();
      onLinkChange?.();
    } finally {
      setLinking(false);
    }
  };

  if (!menu) {
    return null;
  }

  return (
    <div
      className={`min-h-full rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 ease-out ${
        showDetail ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
      }`}
      role="region"
      aria-label={t('menu.detail', { defaultValue: '메뉴 상세' })}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">{t('common.detail', { defaultValue: '상세' })}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-800"
            onClick={() => onEdit(menu)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {t('ui.button.edit', { defaultValue: '수정' })}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
            onClick={() => onDelete(menu.code)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t('ui.button.delete', { defaultValue: '삭제' })}
          </button>
        </div>
      </div>
      <dl className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-3 px-4 py-4 text-sm">
        <dt className="text-gray-500">{t('form.label.code', { defaultValue: '코드' })}</dt>
        <dd className="font-mono text-gray-900">{menu.code}</dd>
        <dt className="text-gray-500">{t('form.label.name', { defaultValue: '이름' })}</dt>
        <dd className="text-gray-900">{menu.name ?? '—'}</dd>
        <dt className="text-gray-500">{t('form.label.description', { defaultValue: '설명' })}</dt>
        <dd className="text-gray-700">{menu.description || '—'}</dd>
        <dt className="text-gray-500">{t('form.label.channel', { defaultValue: '채널' })}</dt>
        <dd className="text-gray-900">{CHANNEL_LABELS[menu.channel ?? ''] ?? menu.channel ?? '—'}</dd>
        <dt className="text-gray-500">{t('form.label.path', { defaultValue: '경로' })}</dt>
        <dd className="break-all text-gray-700">{menu.path || '—'}</dd>
        <dt className="text-gray-500">{t('form.label.order', { defaultValue: '순서' })}</dt>
        <dd className="text-gray-900">{menu.order ?? '—'}</dd>
        <dt className="text-gray-500">{t('form.label.isActive', { defaultValue: '활성' })}</dt>
        <dd>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              menu.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {menu.isActive ? t('common.yes', { defaultValue: 'Y' }) : t('common.no', { defaultValue: 'N' })}
          </span>
        </dd>
        <dt className="text-gray-500">{t('form.label.isAdmin', { defaultValue: '관리자 전용' })}</dt>
        <dd>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              menu.isAdmin ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {menu.isAdmin ? t('common.yes', { defaultValue: 'Y' }) : t('common.no', { defaultValue: 'N' })}
          </span>
        </dd>
      </dl>

      <div className="border-t border-gray-100 px-4 py-3">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-gray-700">
          <Link2 className="h-3.5 w-3.5" />
          {t('menu.link.title', { defaultValue: '연동 (클릭 시 이동)' })}
        </h3>
        <p className="mb-3 text-xs text-gray-500">
          {t('menu.link.description', { defaultValue: '게시판 연동 시 리스트로, 게시글 연동 시 해당 글로 이동합니다. 우선순위: 게시판 → 게시글 → 경로.' })}
        </p>

        <div className="space-y-3">
          <div>
            <div className="mb-1 text-xs font-medium text-gray-600">{t('board.title.main', { defaultValue: '게시판' })}</div>
            {linkedBoard ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-800">{linkedBoard.name}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
                  onClick={handleUnlinkBoard}
                  disabled={linking}
                >
                  <Unlink className="h-3 w-3" /> {t('menu.link.unlink', { defaultValue: '연동 해제' })}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={linkBoardId}
                  onChange={(e) => setLinkBoardId(e.target.value)}
                  className="rounded border border-gray-300 px-2 py-1 text-xs"
                >
                  <option value="">{t('common.select', { defaultValue: '선택' })}</option>
                  {boardOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700 disabled:opacity-50"
                  onClick={handleLinkBoard}
                  disabled={!linkBoardId || linking}
                >
                  {t('menu.link.link', { defaultValue: '연동' })}
                </button>
              </div>
            )}
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-gray-600">{t('board.topic.title', { defaultValue: '게시글' })}</div>
            {linkedTopic ? (
              <div className="flex items-center gap-2">
                <span className="truncate text-sm text-gray-800">{linkedTopic.title}</span>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-50"
                  onClick={handleUnlinkTopic}
                  disabled={linking}
                >
                  <Unlink className="h-3 w-3" /> {t('menu.link.unlink', { defaultValue: '연동 해제' })}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={linkTopicId}
                  onChange={(e) => setLinkTopicId(e.target.value)}
                  className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
                >
                  <option value="">{t('common.select', { defaultValue: '선택' })}</option>
                  {topicOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1 rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700 disabled:opacity-50"
                  onClick={handleLinkTopic}
                  disabled={!linkTopicId || linking}
                >
                  {t('menu.link.link', { defaultValue: '연동' })}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}