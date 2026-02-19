'use client';

import { useCallback, useRef, useState } from 'react';
import type { ApiOptions } from '../../types/api';
import type { CommonFile, FileAttachmentItem } from '../../schemas/file';
import { uploadFile } from '../../services/file';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';

const ASPECT_RATIO_CLASS: Record<string, string> = {
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
};

export interface ImagePreviewFieldProps {
  apiOptions: ApiOptions;
  value: FileAttachmentItem | null;
  onChange: (item: FileAttachmentItem | null) => void;
  aspectRatio?: '1:1' | '16:9' | '4:3';
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function ImagePreviewField({
  apiOptions,
  value,
  onChange,
  aspectRatio = '16:9',
  label,
  required,
  error,
  disabled = false,
}: ImagePreviewFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const serverUrl = useImageUrlFromFileId(value?.fileId ?? null, apiOptions);
  const previewUrl = localPreviewUrl ?? serverUrl;

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setUploadError('이미지 파일만 업로드 가능합니다');
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(objectUrl);
      setUploadError(null);
      setUploading(true);

      try {
        const result: CommonFile = await uploadFile(apiOptions, file);
        onChange({ fileId: result.id, order: 0, isMain: true });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : '업로드 실패');
        setLocalPreviewUrl(null);
      } finally {
        URL.revokeObjectURL(objectUrl);
        setLocalPreviewUrl(null);
        setUploading(false);
      }
    },
    [apiOptions, onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange(null);
    setLocalPreviewUrl(null);
    setUploadError(null);
  };

  const aspectClass = ASPECT_RATIO_CLASS[aspectRatio] ?? 'aspect-video';

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </p>
      )}

      <div
        className={`relative w-full ${aspectClass} max-h-60 rounded-md border-2 border-dashed overflow-hidden transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-300 bg-gray-50'
        } ${!disabled && !uploading ? 'cursor-pointer hover:border-gray-400' : ''}`}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">
              {uploading ? '업로드 중...' : '이미지를 드래그하거나 클릭하세요'}
            </span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-sm text-gray-600">업로드 중...</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      {value && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || uploading}
            className="text-sm text-red-500 hover:underline disabled:opacity-50"
          >
            제거
          </button>
        </div>
      )}

      {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
