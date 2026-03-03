'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CSSProperties } from 'react';

export type CtaType = 'text' | 'button' | 'image';

export interface LandingCtaProps {
  type: CtaType;
  href: string;
  label?: string | null;
  imageUrl?: string | null;
  className?: string;
  positionStyle?: CSSProperties;
}

const DEFAULT_BUTTON_CLASS = 'px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium';

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
}: LandingCtaProps) {
  const baseClasses =
    'absolute z-10 transition-transform hover:scale-105 cursor-pointer flex items-center justify-center';

  const displayLabel = label || href;
  const { external, href: resolvedHref } = resolveLink(href);
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {};

  if (type === 'image' && imageUrl) {
    return external ? (
      <a
        href={resolvedHref}
        className={`${baseClasses} ${className}`}
        style={positionStyle}
        {...externalProps}
      >
        <Image src={imageUrl} alt={label || 'CTA'} width={200} height={60} className="object-cover" />
      </a>
    ) : (
      <Link href={resolvedHref} className={`${baseClasses} ${className}`} style={positionStyle}>
        <Image src={imageUrl} alt={label || 'CTA'} width={200} height={60} className="object-cover" />
      </Link>
    );
  }

  if (type === 'text') {
    return external ? (
      <a
        href={resolvedHref}
        className={`${baseClasses} hover:underline ${className}`}
        style={positionStyle}
        {...externalProps}
      >
        {displayLabel}
      </a>
    ) : (
      <Link
        href={resolvedHref}
        className={`${baseClasses} hover:underline ${className}`}
        style={positionStyle}
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
      style={positionStyle}
      {...externalProps}
    >
      {displayLabel}
    </a>
  ) : (
    <Link href={resolvedHref} className={`${baseClasses} ${buttonClass}`} style={positionStyle}>
      {displayLabel}
    </Link>
  );
}
