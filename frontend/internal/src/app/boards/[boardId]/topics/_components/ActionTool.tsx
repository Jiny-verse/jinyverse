'use client';

import { ActionTool as CommonActionTool } from 'common/components';
import { Button } from 'common/ui';

export function TopicActionTool({ selectedCount, onBatchDelete }: { selectedCount: number; onBatchDelete?: () => void }) {
  return <CommonActionTool selectedCount={selectedCount} onBatchDelete={onBatchDelete} />;
}

export function TopicToolbarAction({ onAdd }: { onAdd: () => void }) {
  return (
    <Button size="sm" onClick={onAdd}>
      게시글 추가
    </Button>
  );
}
