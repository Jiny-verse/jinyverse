'use client';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-gray-300 self-stretch ${className}`} />;
  }

  return <div className={`h-px bg-gray-300 w-full ${className}`} />;
}
