'use client';

import { useCallback } from 'react';
import type { ApiOptions } from '../../types/api';
import type { CommonFile } from '../../schemas/file';
import { FileUpload } from './FileUpload';
import { FileDownloadLink } from './FileDownloadLink';

export interface SingleImageFieldProps {
  apiOptions: ApiOptions;
  value: string | null;
  onChange: (fileId: string | null) => void;
  uploadLabel?: React.ReactNode;
  accept?: string;
  showRemove?: boolean;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}

export function SingleImageField({
  apiOptions,
  value,
  onChange,
  uploadLabel = '이미지 선택',
  accept = 'image/*',
  showRemove = true,
  onError,
  disabled = false,
  className = '',
}: SingleImageFieldProps) {
  const handleUpload = useCallback(
    (files: CommonFile[]) => {
      if (files.length > 0) {
        onChange(files[0].id);
      }
    },
    [onChange]
  );

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <FileUpload
        apiOptions={apiOptions}
        multiple={false}
        accept={accept}
        onUpload={handleUpload}
        onError={onError}
        disabled={disabled}
      >
        {uploadLabel}
      </FileUpload>
      {value && (
        <>
          <span className="text-sm text-neutral-400">
            현재: <FileDownloadLink fileId={value} label="다운로드" apiOptions={apiOptions} />
          </span>
          {showRemove && (
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={disabled}
              className="text-sm text-red-400 hover:underline disabled:opacity-50"
            >
              제거
            </button>
          )}
        </>
      )}
    </div>
  );
}
