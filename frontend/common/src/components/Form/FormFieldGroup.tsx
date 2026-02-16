'use client';

import React from 'react';
import { FormFieldGroupProps } from './types';

export function FormFieldGroup({
  children,
  layout = 'horizontal',
  columns = 2,
  gap = 'md',
  className = '',
}: FormFieldGroupProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  if (layout === 'vertical') {
    return <div className={`space-y-4 ${className}`}>{children}</div>;
  }

  // Horizontal layout with grid
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}
