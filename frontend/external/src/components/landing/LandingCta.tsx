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

  if (type === 'image' && imageUrl) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`} style={positionStyle}>
        <Image src={imageUrl} alt={label || 'CTA'} width={200} height={60} className="object-cover" />
      </Link>
    );
  }

  if (type === 'text') {
    return (
      <Link
        href={href}
        className={`${baseClasses} hover:underline ${className}`}
        style={positionStyle}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link href={href} className={`${baseClasses} ${className}`} style={positionStyle}>
      {label}
    </Link>
  );
}
