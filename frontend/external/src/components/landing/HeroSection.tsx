'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
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

interface SlideSettings {
  enabled?: boolean;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}

interface HeroSectionProps {
  section: LandingSection;
  apiBaseUrl: string;
}

export function HeroSection({ section, apiBaseUrl }: HeroSectionProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const extraConfig = section.extraConfig ?? {};
  const slideSettings = (extraConfig.slideSettings ?? {}) as SlideSettings;
  const fileLinks = (extraConfig.fileLinks ?? {}) as Record<string, string>;
  const darkFileId = extraConfig.darkFileId as string | undefined;

  // 다크모드 + darkFileId 있으면 단일 이미지로 대체
  const fileIds = isDark && darkFileId ? [darkFileId] : (section.fileIds ?? []);
  const isCarousel = !isDark && slideSettings.enabled === true && (section.fileIds ?? []).length > 1;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isCarousel || !(slideSettings.autoPlay ?? true)) return;
    const ms = slideSettings.interval ?? 3000;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % fileIds.length);
    }, ms);
    return () => clearInterval(timer);
  }, [isCarousel, slideSettings.autoPlay, slideSettings.interval, fileIds.length]);

  // 다크모드 전환 시 인덱스 리셋
  useEffect(() => {
    setCurrentIndex(0);
  }, [isDark]);

  const renderSlideContent = (fileId: string, priority: boolean) => {
    const rawHref = fileLinks[fileId];
    const img = (
      <Image
        src={`${apiBaseUrl}/api/files/${fileId}/download`}
        alt="Hero"
        fill
        className="object-cover"
        priority={priority}
        unoptimized
      />
    );
    if (!rawHref) return img;
    const { external, href } = resolveLink(rawHref);
    return external ? (
      <a href={href} className="block absolute inset-0" target="_blank" rel="noopener noreferrer">
        {img}
      </a>
    ) : (
      <Link href={href} className="block absolute inset-0">
        {img}
      </Link>
    );
  };

  const customHeight = extraConfig.customHeight as number | undefined;
  // 캐러셀 또는 customHeight 지정 시: 고정 높이 + object-cover
  const useFixedHeight = isCarousel || !!customHeight;
  const heightStyle: React.CSSProperties = customHeight
    ? { height: `${customHeight}px` }
    : { minHeight: 'calc(100dvh - 3.5rem)' };

  return (
    <section
      className="relative w-full bg-slate-800"
      style={useFixedHeight ? heightStyle : undefined}
    >
      {/* Background image(s) */}
      {useFixedHeight ? (
        <div className="absolute inset-0 overflow-hidden">
          {isCarousel ? (
            fileIds.map((fileId, idx) => (
              <div
                key={fileId}
                className={`absolute inset-0 transition-opacity duration-700 ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                {renderSlideContent(fileId, idx === currentIndex)}
              </div>
            ))
          ) : fileIds[0] ? (
            renderSlideContent(fileIds[0], true)
          ) : null}
        </div>
      ) : fileIds[0] ? (
        // 단일 이미지 + customHeight 없음: 자연 높이
        (() => {
          const rawHref = fileLinks[fileIds[0]];
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`${apiBaseUrl}/api/files/${fileIds[0]}/download`}
              alt="Hero"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          );
          if (!rawHref) return img;
          const { external, href } = resolveLink(rawHref);
          return external ? (
            <a href={href} className="block" target="_blank" rel="noopener noreferrer">{img}</a>
          ) : (
            <Link href={href} className="block">{img}</Link>
          );
        })()
      ) : null}

      {/* Carousel prev/next controls */}
      {isCarousel && (slideSettings.showControls ?? true) && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + fileIds.length) % fileIds.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xl leading-none"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % fileIds.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 text-xl leading-none"
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}

      {/* Carousel indicators */}
      {isCarousel && (slideSettings.showIndicators ?? true) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
          {fileIds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* CTAs */}
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
