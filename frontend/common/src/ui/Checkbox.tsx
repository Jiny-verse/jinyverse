'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`w-4 h-4 text-primary border-input bg-background rounded focus:ring-ring ${className}`}
          {...props}
        />
        {label && <label className="ml-2 text-sm font-medium text-foreground">{label}</label>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
