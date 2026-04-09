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

interface DescriptionImageSectionProps {
  section: LandingSection;
  apiBaseUrl: string;
}

export function DescriptionImageSection({ section, apiBaseUrl }: DescriptionImageSectionProps) {
  const imgFileId = section.fileIds?.[0];
  const imgUrl = imgFileId ? `${apiBaseUrl}/api/files/${imgFileId}/download` : null;
  const fileLinks = (section.extraConfig?.fileLinks ?? {}) as Record<string, string>;
  const hrefRaw = imgFileId ? fileLinks[imgFileId] : undefined;
  const customHeight = section.extraConfig?.customHeight as number | undefined;

  const wrapWithLink = (content: React.ReactNode) => {
    if (!hrefRaw) return <>{content}</>;
    const { external, href } = resolveLink(hrefRaw);
    return external ? (
      <a href={href} className="block" target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    ) : (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  };

  // customHeight 지정 시: 고정 높이 + object-cover
  if (customHeight) {
    return (
      <section
        className="relative w-full bg-muted"
        style={{ height: `${customHeight}px` }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {imgUrl
            ? wrapWithLink(
                <Image
                  src={imgUrl}
                  alt="Image"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )
            : <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />}
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

  // customHeight 없음: 이미지 자연 높이 그대로 표시
  return (
    <section className="relative w-full bg-muted">
      {imgUrl
        ? wrapWithLink(
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt="Image" style={{ width: '100%', height: 'auto', display: 'block' }} />
          )
        : <div className="w-full h-64 bg-gradient-to-br from-slate-700 to-slate-900" />}
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
