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

interface ImageLinkSectionProps {
  section: LandingSection;
  apiBaseUrl: string;
}

export function ImageLinkSection({ section, apiBaseUrl }: ImageLinkSectionProps) {
  const imgFileId = section.fileIds?.[0];
  const imgUrl = imgFileId ? `${apiBaseUrl}/api/files/${imgFileId}/download` : null;
  const fileLinks = (section.extraConfig?.fileLinks ?? {}) as Record<string, string>;
  const hrefRaw = imgFileId ? fileLinks[imgFileId] : undefined;

  const imageContent = imgUrl ? (
    <Image
      src={imgUrl}
      alt="Image Link"
      fill
      className="object-cover"
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

  const customHeight = section.extraConfig?.customHeight as number | undefined;
  const heightStyle: React.CSSProperties = customHeight
    ? { height: `${customHeight}px` }
    : { minHeight: '100vh' };

  return (
    <section className="relative w-full bg-slate-700" style={heightStyle}>
      {/* Background image — isolated so overflow-hidden doesn't clip CTAs */}
      <div className="absolute inset-0 overflow-hidden">
        {renderImageWrapper()}
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
