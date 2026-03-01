'use client';

import Image from 'next/image';
import { LandingCta } from './LandingCta';
import type { LandingSection } from 'common/schemas';

function buildPositionStyle(cta: LandingSection['ctas'][number]): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (cta.positionTop != null) style.top = `${cta.positionTop}%`;
  if (cta.positionLeft != null) style.left = `${cta.positionLeft}%`;
  if (cta.positionBottom != null) style.bottom = `${cta.positionBottom}%`;
  if (cta.positionRight != null) style.right = `${cta.positionRight}%`;
  if (cta.positionTransform) style.transform = cta.positionTransform;
  return style;
}

interface HeroSectionProps {
  section: LandingSection;
  apiBaseUrl: string;
}

export function HeroSection({ section, apiBaseUrl }: HeroSectionProps) {
  const bgFileId = section.fileIds?.[0];
  const bgUrl = bgFileId ? `${apiBaseUrl}/api/files/${bgFileId}/download` : null;

  return (
    <section className="relative w-full h-[600px] overflow-hidden bg-slate-800">
      {bgUrl && (
        <Image
          src={bgUrl}
          alt={section.title || 'Hero'}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      )}
      <div className="absolute inset-0 bg-black/30" />
      {section.title && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">{section.title}</h1>
          {section.description && (
            <p className="mt-4 text-lg md:text-2xl drop-shadow">{section.description}</p>
          )}
        </div>
      )}
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
