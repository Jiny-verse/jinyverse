'use client';

import React from 'react';
import { FormContainerProps } from './types';

export function FormContainer({
  children,
  onSubmit,
  className = '',
  disabled = false,
}: FormContainerProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-8 ${className}`}
      aria-disabled={disabled}
    >
      <fieldset disabled={disabled} className="space-y-8">
        {children}
      </fieldset>
    </form>
  );
}
