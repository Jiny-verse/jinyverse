'use client';

import { useEffect, useRef, useState } from 'react';
import type { ApiOptions } from '../types/api';
import { fetchFileAsBlob } from '../services/file';

export function useImageUrlFromFileId(
  fileId: string | null | undefined,
  apiOptions: ApiOptions | null | undefined
): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!fileId || !apiOptions) {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      setUrl(null);
      return;
    }

    let cancelled = false;
    fetchFileAsBlob(apiOptions, fileId)
      .then((blob) => {
        if (cancelled) {
          URL.revokeObjectURL(URL.createObjectURL(blob));
          return;
        }
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        const u = URL.createObjectURL(blob);
        urlRef.current = u;
        setUrl(u);
      })
      .catch(() => {
        if (!cancelled) {
          setUrl(null);
        }
      });

    return () => {
      cancelled = true;
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
      setUrl(null);
    };
  }, [fileId, apiOptions?.baseUrl, apiOptions?.channel]);

  return url;
}
