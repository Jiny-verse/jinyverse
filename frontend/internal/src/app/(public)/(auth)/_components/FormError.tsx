'use client';

interface FormErrorProps {
  message: string;
  className?: string;
}

export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null;
  return <p className={`text-sm text-red-400 ${className}`}>{message}</p>;
}
