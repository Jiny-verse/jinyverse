'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  footer?: ReactNode;
}

export function Card({ children, className = '', title, footer }: CardProps) {
  return (
    <div className={`bg-card rounded-xl border border-border shadow-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && <div className="px-6 py-4 border-t">{footer}</div>}
    </div>
  );
}
