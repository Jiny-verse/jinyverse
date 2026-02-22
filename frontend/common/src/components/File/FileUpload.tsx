'use client';

import { useRef, useState } from 'react';
import type { ApiOptions } from '../../types/api';
import type { CommonFile } from '../../schemas/file';
import { uploadFile } from '../../services/file';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

export interface FileUploadProps {
  apiOptions: ApiOptions;
  sessionId?: string;
  accept?: string;
  multiple?: boolean;
  onUpload: (files: CommonFile[]) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function FileUpload({
  apiOptions,
  sessionId,
  accept,
  multiple = true,
  onUpload,
  onError,
  disabled = false,
  children,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { t } = useLanguage();

  const handleFiles = async (fileList: FileList | File[]) => {
    if (!fileList.length) return;
    
    // multiple이 false면 첫 번째 파일만 사용
    const filesToUpload = multiple ? Array.from(fileList) : [fileList[0]];
    
    setUploading(true);
    try {
      const results = await Promise.all(
        filesToUpload.map(file => uploadFile(apiOptions, file, sessionId))
      );
      onUpload(results);
    } catch (err) {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="inline-block" onDragOver={handleDragOver} onDrop={handleDrop}>
      <input
        ref={inputRef}
        type="file"
        multiple={!!multiple}
        accept={accept}
        onChange={handleChange}
        disabled={disabled || uploading}
        className="hidden"
        aria-label={t('file.selectFile')}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="rounded border border-[#555] bg-[#333] px-3 py-1.5 text-sm text-white hover:bg-[#444] disabled:opacity-50"
      >
        {uploading ? t('file.uploading') : (children ?? t('file.add'))}
      </button>
    </div>
  );
}
