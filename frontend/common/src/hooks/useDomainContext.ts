'use client';

import { useState, useCallback } from 'react';
import type { ApiOptions } from '../types';

export interface DomainServices<T, CreateInput, UpdateInput> {
  create: (opts: ApiOptions, input: CreateInput) => Promise<T>;
  update: (opts: ApiOptions, id: string, input: UpdateInput) => Promise<T>;
  delete: (opts: ApiOptions, id: string) => Promise<void>;
}

export interface UseDomainContextOptions<T, CreateInput, UpdateInput> {
  apiOptions: ApiOptions;
  services: DomainServices<T, CreateInput, UpdateInput>;
  onReload?: () => void;
  idKey?: keyof T;
}

/**
 * 도메인 CRUD + 다이얼로그 통합 hook
 */
export function useDomainContext<T, CreateInput = Partial<T>, UpdateInput = Partial<T>>({
  apiOptions,
  services,
  onReload,
  idKey = 'id' as keyof T,
}: UseDomainContextOptions<T, CreateInput, UpdateInput>) {
  // 다이얼로그: 생성
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // 다이얼로그: 수정
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<T | null>(null);

  // 다이얼로그: 읽기 전용
  const [readOnlyDialogOpen, setReadOnlyDialogOpen] = useState(false);
  const [readOnlyTarget, setReadOnlyTarget] = useState<T | null>(null);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  const triggerReload = useCallback(() => {
    setReloadTrigger((t) => t + 1);
    onReload?.();
  }, [onReload]);

  // 생성
  const handleCreate = useCallback(
    async (input: CreateInput) => {
      await services.create(apiOptions, input);
      setCreateDialogOpen(false);
      triggerReload();
    },
    [apiOptions, services.create, triggerReload]
  );

  // 수정
  const handleUpdate = useCallback(
    async (id: string, input: UpdateInput) => {
      await services.update(apiOptions, id, input);
      setUpdateDialogOpen(false);
      setUpdateTarget(null);
      triggerReload();
    },
    [apiOptions, services.update, triggerReload]
  );

  // 삭제
  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('삭제하시겠습니까?')) return;
      await services.delete(apiOptions, id);
      triggerReload();
    },
    [apiOptions, services.delete, triggerReload]
  );

  // 일괄 삭제
  const handleBatchDelete = useCallback(
    async (ids: string[]) => {
      if (!confirm(`선택한 ${ids.length}개를 삭제하시겠습니까?`)) return;
      for (const id of ids) {
        await services.delete(apiOptions, id);
      }
      triggerReload();
    },
    [apiOptions, services.delete, triggerReload]
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
          const id = String((updateTarget as Record<string, unknown>)[idKey as string]);
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
    crud: {
      delete: handleDelete,
      batchDelete: handleBatchDelete,
    },
    reloadTrigger,
  };
}
