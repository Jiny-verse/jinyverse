'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useDomainContext } from 'common';
import { createTag, updateTag, deleteTag } from 'common/services';
import type { Tag, TagCreateInput, TagUpdateInput } from 'common/types';
import type { ApiOptions } from 'common/types';

type TagContextValue = ReturnType<
  typeof useDomainContext<Tag, TagCreateInput, TagUpdateInput>
>;

const TagContext = createContext<TagContextValue | null>(null);

export function TagProvider({
  apiOptions,
  children,
}: {
  apiOptions: ApiOptions;
  children: ReactNode;
}) {
  const value = useDomainContext<Tag, TagCreateInput, TagUpdateInput>({
    apiOptions,
    services: {
      create: createTag,
      update: updateTag,
      delete: deleteTag,
    },
  });

  return React.createElement(TagContext.Provider, { value }, children);
}

export function useTagContext() {
  const context = useContext(TagContext);
  if (!context) throw new Error('useTagContext must be used within TagProvider');
  return context;
}
