'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ApiOptions } from '../types';

export interface DomainServices<T, CreateInput, UpdateInput> {
  create: (opts: ApiOptions, input: CreateInput) => Promise<T>;
  update: (opts: ApiOptions, id: string, input: UpdateInput) => Promise<T>;
  delete: (opts: ApiOptions, id: string) => Promise<void>;
  getOne: (opts: ApiOptions, id: string) => Promise<T>;
}

export interface UseDomainContextOptions<T, CreateInput, UpdateInput> {
  apiOptions: ApiOptions;
  services: DomainServices<T, CreateInput, UpdateInput>;
  onReload?: () => void;
}

/**
 * 도메인 CRUD + 다이얼로그 + 미리보기 통합 hook
 */
export function useDomainContext<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>({
  apiOptions,
  services,
  onReload,
}: UseDomainContextOptions<T, CreateInput, UpdateInput>) {
  // 다이얼로그: 생성
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // 다이얼로그: 수정
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<T | null>(null);

  // 다이얼로그: 읽기 전용
  const [readOnlyDialogOpen, setReadOnlyDialogOpen] = useState(false);
  const [readOnlyTarget, setReadOnlyTarget] = useState<T | null>(null);

  // 미리보기
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<T | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // 미리보기 데이터 로드
  useEffect(() => {
    if (!previewId) {
      setPreviewData(null);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    services
      .getOne(apiOptions, previewId)
      .then((data) => {
        if (!cancelled) setPreviewData(data);
      })
      .catch(() => {
        if (!cancelled) setPreviewData(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiOptions.baseUrl, apiOptions.channel, previewId]);

  // 생성
  const handleCreate = useCallback(
    async (input: CreateInput) => {
      await services.create(apiOptions, input);
      setCreateDialogOpen(false);
      onReload?.();
    },
    [apiOptions, services.create, onReload]
  );

  // 수정
  const handleUpdate = useCallback(
    async (id: string, input: UpdateInput) => {
      await services.update(apiOptions, id, input);
      setUpdateDialogOpen(false);
      setUpdateTarget(null);
      onReload?.();
    },
    [apiOptions, services.update, onReload]
  );

  // 삭제
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('삭제하시겠습니까?')) return;
      await services.delete(apiOptions, id);
      onReload?.();
    },
    [apiOptions, services.delete, onReload]
  );

  // 일괄 삭제
  const handleBatchDelete = useCallback(
    async (ids: string[]) => {
      if (!confirm(`선택한 ${ids.length}개를 삭제하시겠습니까?`)) return;
      for (const id of ids) {
        await services.delete(apiOptions, id);
      }
      onReload?.();
    },
    [apiOptions, services.delete, onReload]
  );

  return {
    dialogs: {
      create: {
        open: createDialogOpen,
        onOpen: () => setCreateDialogOpen(true),
        onClose: () => setCreateDialogOpen(false),
        onSubmit: handleCreate,
      },
      update: {
        open: updateDialogOpen,
        board: updateTarget, // 또는 data
        onOpen: (item: T) => {
          setUpdateTarget(item);
          setUpdateDialogOpen(true);
        },
        onClose: () => {
          setUpdateDialogOpen(false);
          setUpdateTarget(null);
        },
        onSubmit: (input: UpdateInput) => {
          if (!updateTarget) return Promise.resolve();
          const id = (updateTarget as any).id;
          return handleUpdate(id, input);
        },
      },
      readOnly: {
        open: readOnlyDialogOpen,
        data: readOnlyTarget,
        onOpen: (item: T) => {
          setReadOnlyTarget(item);
          setReadOnlyDialogOpen(true);
        },
        onClose: () => {
          setReadOnlyDialogOpen(false);
          setReadOnlyTarget(null);
        },
      },
    },
    preview: {
      selectedId: previewId,
      data: previewData,
      isLoading: previewLoading,
      onSelect: setPreviewId,
    },
    crud: {
      delete: handleDelete,
      batchDelete: handleBatchDelete,
    },
  };
}
