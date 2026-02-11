'use client';

import { ImgHTMLAttributes } from 'react';
import type { ApiOptions } from '../types/api';
import { useImageUrlFromFileId } from '../hooks/useImageUrlFromFileId';

interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src?: string;
  fileId?: string | null;
  apiOptions?: ApiOptions | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  fallback?: string;
}

export function Avatar({
  src: srcProp,
  fileId,
  apiOptions,
  alt = '',
  size = 'md',
  fallback,
  className = '',
  ...props
}: AvatarProps) {
  const urlFromFile = useImageUrlFromFileId(fileId ?? null, apiOptions ?? null);
  const src = (fileId && apiOptions ? urlFromFile : null) ?? srcProp;

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`${sizeStyles[size]} rounded-full overflow-hidden bg-gray-200 flex items-center justify-center ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" {...props} />
      ) : (
        <span className="text-gray-600 font-medium">
          {fallback || alt?.charAt(0).toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
}
