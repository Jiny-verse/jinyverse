'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useDomainContext } from 'common';
import { getBoard, createBoard, updateBoard, deleteBoard } from 'common/services';
import type { Board, BoardCreateInput, BoardUpdateInput } from 'common/types';
import type { ApiOptions } from 'common/types';

type BoardContextValue = ReturnType<
  typeof useDomainContext<Board, BoardCreateInput, BoardUpdateInput>
>;

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({
  apiOptions,
  children,
}: {
  apiOptions: ApiOptions;
  children: ReactNode;
}) {
  const value = useDomainContext<Board, BoardCreateInput, BoardUpdateInput>({
    apiOptions,
    services: {
      create: createBoard,
      update: updateBoard,
      delete: deleteBoard,
      getOne: getBoard,
    },
  });

  return React.createElement(BoardContext.Provider, { value }, children);
}

export function useBoardContext() {
  const context = useContext(BoardContext);
  if (!context) throw new Error('useBoardContext must be used within BoardProvider');
  return context;
}
