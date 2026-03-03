'use client';

import Image from 'next/image';
import Link from 'next/link';
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

function resolveLink(href: string): { external: boolean; href: string } {
  if (!href) return { external: false, href: '#' };
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))
    return { external: true, href };
  if (href.startsWith('/') || href.startsWith('#'))
    return { external: false, href };
  return { external: true, href: `https://${href}` };
}

interface HeroSectionProps {
  section: LandingSection;
  apiBaseUrl: string;
}

export function HeroSection({ section, apiBaseUrl }: HeroSectionProps) {
  const bgFileId = section.fileIds?.[0];
  const bgUrl = bgFileId ? `${apiBaseUrl}/api/files/${bgFileId}/download` : null;
  const hrefRaw = section.extraConfig?.href as string | undefined;

  const imageContent = bgUrl ? (
    <Image
      src={bgUrl}
      alt="Hero"
      fill
      className="object-cover"
      priority
      unoptimized
    />
  ) : null;

  const renderImageWrapper = () => {
    if (!hrefRaw) return imageContent;
    const { external, href } = resolveLink(hrefRaw);
    return external ? (
      <a href={href} className="block absolute inset-0" target="_blank" rel="noopener noreferrer">
        {imageContent}
      </a>
    ) : (
      <Link href={href} className="block absolute inset-0">
        {imageContent}
      </Link>
    );
  };

  return (
    <section className="relative w-full h-[600px] bg-slate-800">
      {/* Background image — isolated so overflow-hidden doesn't clip CTAs */}
      <div className="absolute inset-0 overflow-hidden">
        {renderImageWrapper()}
      </div>
      <div className="absolute inset-0 bg-black/30" />
      {section.ctas.map((cta) => (
        <LandingCta
          key={cta.id}
          type={cta.type as 'text' | 'button' | 'image'}
          href={cta.href}
          label={cta.label}
          imageUrl={cta.imageFileId ? `${apiBaseUrl}/api/files/${cta.imageFileId}/download` : undefined}
          className={cta.className || ''}
          positionStyle={buildPositionStyle(cta)}
        />
      ))}
    </section>
  );
}
