'use client';

import { BoardTable } from 'common/components';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLanguage } from 'common/utils';

export default function BoardsPage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pt-[90px]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('board.title.main')}</h1>
        <p className="text-muted-foreground mb-6">{t('board.title.desc')}</p>
        <BoardTable apiOptions={options} linkPrefix="/boards" />
      </div>
    </div>
  );
}
