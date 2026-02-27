'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { ContentViewer } from '../Editor/Viewer/ContentViewer';
import { FileList } from '../File/FileList';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

interface NormalPostDetailProps {
  topic: Topic;
  apiOptions: ApiOptions;
}

export function NormalPostDetail({ topic, apiOptions }: NormalPostDetailProps) {
  const attachedFiles = topic.files?.filter((f) => !f.isMain) ?? [];
  const { t } = useLanguage();

  return (
    <article className="py-10 px-4">
      <header className="mb-6">
        {(topic.isNotice || topic.isPinned) && (
          <div className="flex items-center gap-2 mb-2">
            {topic.isNotice && <Badge variant="default">{t('post.notice')}</Badge>}
            {topic.isPinned && <Badge variant="info">{t('post.pinned')}</Badge>}
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{topic.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <span>{topic.author?.nickname ?? '-'}</span>
            <span>·</span>
            <span>{formatRelativeOrAbsolute(topic.createdAt)}</span>
            <span>·</span>
            <span>{t('post.viewCount', { count: topic.viewCount ?? 0 })}</span>
          </div>
        </div>
      </header>

      <hr className="border-border mb-8" />

      <ContentViewer content={topic.content} apiOptions={apiOptions} />

      {attachedFiles.length > 0 && (
        <div className="mt-10 pt-8 border-t border-border">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('post.attachments')}</h2>
          <FileList files={attachedFiles} readOnly apiOptions={apiOptions} />
        </div>
      )}

      {topic.tags?.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {topic.tags.map((tag) => (
            <Badge key={tag.id} variant="info">
              #{tag.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </article>
  );
}
