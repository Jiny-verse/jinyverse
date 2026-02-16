'use client';

import React from 'react';
import { Button } from '../../ui/Button';
import { FormActionsProps } from './types';

export function FormActions({
  submitLabel = '저장',
  cancelLabel = '취소',
  onCancel,
  isSubmitting = false,
  submitDisabled = false,
  extraActions,
  align = 'right',
  submitVariant = 'primary',
  className = '',
}: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={`flex ${alignClasses[align]} gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}
    >
      {extraActions}
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        variant={submitVariant}
        disabled={submitDisabled || isSubmitting}
        isLoading={isSubmitting}
      >
        {isSubmitting ? '저장 중...' : submitLabel}
      </Button>
    </div>
  );
}
