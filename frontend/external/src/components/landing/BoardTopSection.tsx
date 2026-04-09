'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTopics, getBoard } from 'common/services';
import { useLanguage, getMainFileId, getExcerpt, formatRelativeOrAbsolute } from 'common/utils';
import { LandingCta } from './LandingCta';
import type { LandingSection } from 'common/schemas';
import type { Board } from 'common/schemas';
import type { Topic } from 'common/types';

function buildPositionStyle(cta: LandingSection['ctas'][number]): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (cta.positionTop != null) style.top = `${cta.positionTop}%`;
  if (cta.positionLeft != null) style.left = `${cta.positionLeft}%`;
  if (cta.positionBottom != null) style.bottom = `${cta.positionBottom}%`;
  if (cta.positionRight != null) style.right = `${cta.positionRight}%`;
  if (cta.positionTransform) style.transform = cta.positionTransform;
  return style;
}

interface BoardTopSectionProps {
  section: LandingSection;
  apiBaseUrl: string;
}

function GalleryGrid({ topics, boardId, apiBaseUrl }: { topics: Topic[]; boardId: string; apiBaseUrl: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {topics.map((topic) => {
        const fileId = getMainFileId(topic);
        const thumbUrl = fileId ? `${apiBaseUrl}/api/files/${fileId}/thumbnail` : null;
        return (
          <Link
            key={topic.id}
            href={`/boards/${boardId}/topics/${topic.id}`}
            className="relative aspect-square overflow-hidden group block bg-muted"
          >
            {thumbUrl ? (
              <Image src={thumbUrl} alt={topic.title} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-end p-3">
              <p className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 line-clamp-2">
                {topic.title}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ProjectGrid({ topics, boardId, apiBaseUrl }: { topics: Topic[]; boardId: string; apiBaseUrl: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {topics.map((topic) => {
        const fileId = getMainFileId(topic);
        const thumbUrl = fileId ? `${apiBaseUrl}/api/files/${fileId}/thumbnail` : null;
        const excerpt = getExcerpt(topic.content, 100);
        return (
          <Link
            key={topic.id}
            href={`/boards/${boardId}/topics/${topic.id}`}
            className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow block no-underline"
          >
            <div className="relative aspect-video bg-muted overflow-hidden">
              {thumbUrl ? (
                <Image
                  src={thumbUrl}
                  alt={topic.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
              )}
            </div>
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 px-4 pt-3">
                {topic.tags.slice(0, 4).map((tag) => (
                  <span key={tag.id} className="text-xs text-primary/80">
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}
            <div className="px-4 pb-4 pt-2">
              <h3 className="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {topic.title}
              </h3>
              {excerpt && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function BlogList({ topics, boardId, apiBaseUrl }: { topics: Topic[]; boardId: string; apiBaseUrl: string }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {topics.map((topic) => {
        const fileId = getMainFileId(topic);
        const thumbUrl = fileId ? `${apiBaseUrl}/api/files/${fileId}/thumbnail` : null;
        const excerpt = getExcerpt(topic.content, 120);
        return (
          <Link
            key={topic.id}
            href={`/boards/${boardId}/topics/${topic.id}`}
            className="flex gap-4 py-4 group no-underline"
          >
            <div className="shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted relative">
              {thumbUrl ? (
                <Image src={thumbUrl} alt={topic.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
              )}
            </div>
            <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5">
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {topic.title}
                </h3>
                {excerpt && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                {topic.tags?.slice(0, 3).map((tag) => (
                  <span key={tag.id} className="text-xs text-primary/80">
                    #{tag.name}
                  </span>
                ))}
                <span className="text-xs text-muted-foreground">
                  {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function NormalList({ topics, boardId }: { topics: Topic[]; boardId: string }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {topics.map((topic) => {
        const excerpt = getExcerpt(topic.content, 120);
        return (
          <Link
            key={topic.id}
            href={`/boards/${boardId}/topics/${topic.id}`}
            className="py-4 group block no-underline"
          >
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {topic.title}
            </h3>
            {excerpt && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
            )}
            <p className="mt-1.5 text-xs text-muted-foreground">
              {topic.author?.nickname ?? '-'} · {formatRelativeOrAbsolute(topic.createdAt)} · 조회{' '}
              {topic.viewCount ?? 0}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

function renderTopics(board: Board | null, topics: Topic[], boardId: string, apiBaseUrl: string) {
  switch (board?.type) {
    case 'gallery':
      return <GalleryGrid topics={topics} boardId={boardId} apiBaseUrl={apiBaseUrl} />;
    case 'project':
      return <ProjectGrid topics={topics} boardId={boardId} apiBaseUrl={apiBaseUrl} />;
    case 'blog':
      return <BlogList topics={topics} boardId={boardId} apiBaseUrl={apiBaseUrl} />;
    default:
      return <NormalList topics={topics} boardId={boardId} />;
  }
}

export function BoardTopSection({ section, apiBaseUrl }: BoardTopSectionProps) {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const limit = (section.extraConfig?.limit as number) ?? 5;

  const apiOptions = { baseUrl: apiBaseUrl, channel: 'EXTERNAL' as const };

  useEffect(() => {
    if (!section.boardId) return;
    Promise.all([
      getTopics(apiOptions, { boardId: section.boardId, size: limit, page: 0 }),
      getBoard(apiOptions, section.boardId),
    ])
      .then(([res, b]) => {
        setTopics(res.content);
        setBoard(b);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.boardId, apiBaseUrl, limit]);

  return (
    <section className="relative w-full py-12 bg-background">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          {board?.name ?? t('landing.board_top.title')}
        </h2>
        {topics.length === 0 ? (
          <p className="text-muted-foreground">{t('landing.board_top.no_posts')}</p>
        ) : (
          renderTopics(board, topics, section.boardId!, apiBaseUrl)
        )}
      </div>
      {section.ctas.map((cta) => (
        <LandingCta
          key={cta.id}
          type={cta.type as 'text' | 'button' | 'image'}
          href={cta.href}
          label={cta.label}
          imageUrl={cta.imageFileId ? `${apiBaseUrl}/api/files/${cta.imageFileId}/download` : undefined}
          className={cta.className || ''}
          positionStyle={buildPositionStyle(cta)}
          styleConfig={cta.styleConfig as Record<string, unknown> | null | undefined}
        />
      ))}
    </section>
  );
}
