'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const iconStyles: Record<AlertVariant, string> = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
};

export function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 ${variantStyles[variant]} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {title && <p className="font-medium text-sm mb-0.5">{title}</p>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`shrink-0 p-1 rounded hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-1 ${iconStyles[variant]}`}
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
