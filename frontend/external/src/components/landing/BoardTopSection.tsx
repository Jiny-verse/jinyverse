'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getTopics } from 'common/services';
import { useLanguage } from 'common/utils';
import { LandingCta } from './LandingCta';
import type { LandingSection } from 'common/schemas';
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

export function BoardTopSection({ section, apiBaseUrl }: BoardTopSectionProps) {
  const { t } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>([]);
  const limit = (section.extraConfig?.limit as number) ?? 5;

  const apiOptions = { baseUrl: apiBaseUrl, channel: 'EXTERNAL' as const };

  useEffect(() => {
    if (!section.boardId) return;
    getTopics(apiOptions, { boardId: section.boardId, size: limit, page: 0 })
      .then((res) => setTopics(res.content))
      .catch(() => setTopics([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.boardId, apiBaseUrl, limit]);

  return (
    <section className="relative w-full py-12 bg-background">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          {t('landing.board_top.title')}
        </h2>
        {topics.length === 0 ? (
          <p className="text-muted-foreground">{t('landing.board_top.no_posts')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => {
              const mainFile = topic.files?.find((f) => f.isMain) ?? topic.files?.[0];
              const thumbFileId = mainFile?.fileId ?? null;
              const thumbUrl = thumbFileId
                ? `${apiBaseUrl}/api/files/${thumbFileId}/download`
                : null;
              return (
                <Link
                  key={topic.id}
                  href={`/boards/${section.boardId}/topics/${topic.id}`}
                  className="group rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow bg-card"
                >
                  <div className="relative w-full h-40 overflow-hidden">
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
                  <div className="p-3">
                    <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {topic.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : ''}
                      </span>
                      {topic.viewCount != null && (
                        <span>{t('post.viewCount', { count: topic.viewCount })}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
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
