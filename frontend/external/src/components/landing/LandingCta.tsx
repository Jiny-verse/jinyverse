'use client';

import Link from 'next/link';
import { CSSProperties } from 'react';

export type CtaType = 'text' | 'button' | 'image';

export interface LandingCtaProps {
  type: CtaType;
  href: string;
  label?: string | null;
  imageUrl?: string | null;
  className?: string;
  positionStyle?: CSSProperties;
  styleConfig?: Record<string, unknown> | null;
}

const DEFAULT_BUTTON_CLASS = 'px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium';

const FONT_FAMILY_MAP: Record<string, string> = {
  sans: 'ui-sans-serif, system-ui, sans-serif',
  serif: 'ui-serif, Georgia, serif',
  mono: 'ui-monospace, SFMono-Regular, monospace',
};

function resolveLink(href: string): { external: boolean; href: string } {
  if (!href) return { external: false, href: '#' };
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//'))
    return { external: true, href };
  if (href.startsWith('/') || href.startsWith('#'))
    return { external: false, href };
  return { external: true, href: `https://${href}` };
}

export function LandingCta({
  type,
  href,
  label,
  imageUrl,
  className = '',
  positionStyle = {},
  styleConfig,
}: LandingCtaProps) {
  const baseClasses =
    'absolute z-10 transition-transform hover:scale-105 cursor-pointer flex items-center justify-center';

  const displayLabel = label || href;
  const { external, href: resolvedHref } = resolveLink(href);
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  const sc = styleConfig ?? {};

  const buttonStyle: CSSProperties = {
    ...(sc.bgColor ? { background: sc.bgColor as string } : {}),
    ...(sc.textColor ? { color: sc.textColor as string } : {}),
    ...(sc.borderColor ? { borderColor: sc.borderColor as string } : {}),
    ...(sc.borderWidth ? { borderWidth: `${sc.borderWidth}px`, borderStyle: 'solid' } : {}),
    ...(sc.opacity != null ? { opacity: (sc.opacity as number) / 100 } : {}),
  };

  const textStyle: CSSProperties = {
    ...(sc.lineHeight ? { lineHeight: sc.lineHeight as number } : {}),
    ...(sc.letterSpacing ? { letterSpacing: `${sc.letterSpacing}em` } : {}),
    ...(sc.fontFamily
      ? { fontFamily: FONT_FAMILY_MAP[sc.fontFamily as string] ?? (sc.fontFamily as string) }
      : {}),
    ...(sc.color ? { color: sc.color as string } : {}),
  };

  const imageStyle: CSSProperties = {
    ...(sc.opacity != null ? { opacity: (sc.opacity as number) / 100 } : {}),
    ...(sc.shadow ? { filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' } : {}),
    ...(sc.aspectRatio && sc.aspectRatio !== 'free'
      ? { aspectRatio: sc.aspectRatio as string }
      : {}),
  };

  if (type === 'image' && imageUrl) {
    const wrapperClass = 'absolute z-10 cursor-pointer inline-block';
    const imgClass = `object-contain block ${className || 'w-48 h-12'}`;
    return external ? (
      <a href={resolvedHref} className={wrapperClass} style={positionStyle} {...externalProps}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={label || 'CTA'} className={imgClass} style={imageStyle} />
      </a>
    ) : (
      <Link href={resolvedHref} className={wrapperClass} style={positionStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={label || 'CTA'} className={imgClass} style={imageStyle} />
      </Link>
    );
  }

  if (type === 'text') {
    return external ? (
      <a
        href={resolvedHref}
        className={`${baseClasses} hover:underline ${className}`}
        style={{ ...positionStyle, ...textStyle }}
        {...externalProps}
      >
        {displayLabel}
      </a>
    ) : (
      <Link
        href={resolvedHref}
        className={`${baseClasses} hover:underline ${className}`}
        style={{ ...positionStyle, ...textStyle }}
      >
        {displayLabel}
      </Link>
    );
  }

  // button type — apply default styling when no className provided
  const buttonClass = className || DEFAULT_BUTTON_CLASS;
  return external ? (
    <a
      href={resolvedHref}
      className={`${baseClasses} ${buttonClass}`}
      style={{ ...positionStyle, ...buttonStyle }}
      {...externalProps}
    >
      {displayLabel}
    </a>
  ) : (
    <Link
      href={resolvedHref}
      className={`${baseClasses} ${buttonClass}`}
      style={{ ...positionStyle, ...buttonStyle }}
    >
      {displayLabel}
    </Link>
  );
}
