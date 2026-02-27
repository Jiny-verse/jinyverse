'use client';

import React from 'react';
import { FormSectionProps } from './types';

export function FormSection({
  title,
  description,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <div className={`space-y-4 rounded-xl border border-border bg-card p-6 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-base font-semibold text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
