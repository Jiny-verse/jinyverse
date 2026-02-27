'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { ContentViewer } from '../Editor/Viewer/ContentViewer';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';
import { getMainFileId } from '../../utils/post';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

interface BlogPostDetailProps {
  topic: Topic;
  apiOptions: ApiOptions;
}

export function BlogPostDetail({ topic, apiOptions }: BlogPostDetailProps) {
  const mainFileId = getMainFileId(topic);
  const coverUrl = useImageUrlFromFileId(mainFileId, apiOptions);
  const { t } = useLanguage();

  return (
    <article className="py-10 px-4">
      {coverUrl && (
        <div className="w-full aspect-video overflow-hidden shadow-lg mb-10">
          <img src={coverUrl} alt={topic.title} className="w-full h-full object-cover" />
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">{topic.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <span>{topic.author?.nickname ?? '-'}</span>
            <span>·</span>
            <span>{formatRelativeOrAbsolute(topic.createdAt)}</span>
            <span>·</span>
            <span>{t('post.viewCount', { count: topic.viewCount ?? 0 })}</span>
          </div>
        </div>
      </header>

      <hr className="border-border mb-10" />

      <ContentViewer content={topic.content} apiOptions={apiOptions} className="prose-lg" />

      {topic.tags?.length ? (
        <div className="mt-10 pt-8 border-t border-border flex flex-wrap gap-2">
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
