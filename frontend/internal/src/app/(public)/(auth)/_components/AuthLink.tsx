'use client';

import Link from 'next/link';

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthLink({ href, children, className = '' }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className={`text-sm text-muted-foreground hover:text-foreground transition-colors ${className}`}
    >
      {children}
    </Link>
  );
}
