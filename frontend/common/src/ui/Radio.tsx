'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="radio"
          className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${className}`}
          {...props}
        />
        {label && (
          <label className="ml-2 text-sm font-medium text-gray-700">{label}</label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';
