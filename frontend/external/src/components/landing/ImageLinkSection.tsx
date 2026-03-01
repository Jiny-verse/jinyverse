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

interface ImageLinkSectionProps {
  section: LandingSection;
  apiBaseUrl: string;
}

export function ImageLinkSection({ section, apiBaseUrl }: ImageLinkSectionProps) {
  const imgFileId = section.fileIds?.[0];
  const imgUrl = imgFileId ? `${apiBaseUrl}/api/files/${imgFileId}/download` : null;

  return (
    <section className="relative w-full h-[400px] overflow-hidden bg-slate-700">
      {imgUrl && (
        <Image
          src={imgUrl}
          alt={section.title || 'Image Link'}
          fill
          className="object-cover"
          unoptimized
        />
      )}
      <div className="absolute inset-0 bg-black/20" />
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
