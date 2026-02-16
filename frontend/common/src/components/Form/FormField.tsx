'use client';

import React from 'react';
import { FormFieldProps } from './types';

export function FormField({
  label,
  name,
  required = false,
  description,
  error,
  children,
  className = '',
  layout = 'vertical',
}: FormFieldProps) {
  const fieldId = `field-${name}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  // Clone children to add accessibility attributes
  const enhancedChildren = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        id: fieldId,
        'aria-required': required,
        'aria-invalid': !!error,
        'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
      })
    : children;

  const isHorizontal = layout === 'horizontal';

  return (
    <div className={`${isHorizontal ? 'flex items-start gap-4' : 'space-y-2'} ${className}`}>
      <label
        htmlFor={fieldId}
        className={`block text-sm font-medium text-gray-900 dark:text-gray-100 ${
          isHorizontal ? 'w-1/4 pt-2' : ''
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className={isHorizontal ? 'flex-1' : ''}>
        {description && (
          <p id={descriptionId} className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {description}
          </p>
        )}

        {enhancedChildren}

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-sm text-red-500 dark:text-red-400 mt-1"
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
