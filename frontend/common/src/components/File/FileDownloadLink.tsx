'use client';

import { getDownloadUrl } from '../../services/file';
import type { ApiOptions } from '../../types/api';

export interface FileDownloadLinkProps {
  fileId: string;
  label?: string;
  apiOptions: ApiOptions;
  className?: string;
}

export function FileDownloadLink({
  fileId,
  label = '다운로드',
  apiOptions,
  className,
}: FileDownloadLinkProps) {
  const url = getDownloadUrl(apiOptions, fileId);
  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className={className ?? 'text-sm text-blue-400 hover:underline'}
    >
      {label}
    </a>
  );
}
