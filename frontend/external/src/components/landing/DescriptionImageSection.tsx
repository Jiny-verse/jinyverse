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

interface DescriptionImageSectionProps {
  section: LandingSection;
  apiBaseUrl: string;
}

export function DescriptionImageSection({ section, apiBaseUrl }: DescriptionImageSectionProps) {
  const imgFileId = section.fileIds?.[0];
  const imgUrl = imgFileId ? `${apiBaseUrl}/api/files/${imgFileId}/download` : null;

  return (
    <section className="relative w-full min-h-[400px] overflow-hidden bg-muted">
      {imgUrl ? (
        <Image
          src={imgUrl}
          alt={section.title || 'Description'}
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="w-full h-[400px] bg-gradient-to-br from-slate-700 to-slate-900" />
      )}
      {(section.title || section.description) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-white text-center px-4">
          {section.title && <h2 className="text-3xl font-bold drop-shadow-lg">{section.title}</h2>}
          {section.description && (
            <p className="mt-2 text-base drop-shadow">{section.description}</p>
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
