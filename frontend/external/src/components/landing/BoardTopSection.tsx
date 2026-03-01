'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTopics } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
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
}

export function BoardTopSection({ section }: BoardTopSectionProps) {
  const options = useApiOptions();
  const { t } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>([]);
  const limit = (section.extraConfig?.limit as number) ?? 5;

  useEffect(() => {
    if (!section.boardId) return;
    getTopics(options, { boardId: section.boardId, size: limit, page: 0 })
      .then((res) => setTopics(res.content))
      .catch(() => setTopics([]));
  }, [section.boardId, options.baseUrl, limit]);

  return (
    <section className="relative w-full py-12 bg-background">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          {section.title || t('landing.board_top.title')}
        </h2>
        {topics.length === 0 ? (
          <p className="text-muted-foreground">{t('landing.board_top.no_posts')}</p>
        ) : (
          <ul className="divide-y divide-border">
            {topics.map((topic) => (
              <li key={topic.id} className="py-3">
                <Link
                  href={`/boards/${section.boardId}/topics/${topic.id}`}
                  className="flex justify-between items-center hover:text-primary transition-colors"
                >
                  <span className="text-sm font-medium truncate text-foreground">{topic.title}</span>
                  <span className="text-xs text-muted-foreground ml-4 shrink-0">
                    {topic.createdAt ? new Date(topic.createdAt).toLocaleDateString() : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {section.ctas.map((cta) => (
        <LandingCta
          key={cta.id}
          type={cta.type as 'text' | 'button' | 'image'}
          href={cta.href}
          label={cta.label}
          className={cta.className || ''}
          positionStyle={buildPositionStyle(cta)}
        />
      ))}
    </section>
  );
}
