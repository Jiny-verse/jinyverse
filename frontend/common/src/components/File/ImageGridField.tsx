'use client';

import { useCallback, useRef, useState } from 'react';
import type { ApiOptions } from '../../types/api';
import type { CommonFile, FileAttachmentItem } from '../../schemas/file';
import { uploadFile } from '../../services/file';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';

interface ImageGridItemProps {
  fileId: string;
  apiOptions: ApiOptions;
  isMain: boolean;
  onSetMain: () => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  isDragging: boolean;
}

function ImageGridItem({ fileId, apiOptions, isMain, onSetMain, onRemove, onDragStart, onDragOver, onDrop, isDragging }: ImageGridItemProps) {
  const url = useImageUrlFromFileId(fileId, apiOptions);

  return (
    <div
      draggable
      className={`relative aspect-square overflow-hidden rounded cursor-pointer border-2 transition-colors ${
        isMain ? 'border-yellow-400' : 'border-transparent hover:border-gray-300'
      } ${isDragging ? 'opacity-50' : ''}`}
      onClick={onSetMain}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      )}

      {isMain && (
        <div className="absolute top-1 left-1 bg-yellow-400 text-white text-xs rounded px-1 py-0.5 leading-none font-bold">
          ★
        </div>
      )}

      <button
        type="button"
        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="삭제"
      >
        ×
      </button>
    </div>
  );
}

export interface ImageGridFieldProps {
  apiOptions: ApiOptions;
  value: FileAttachmentItem[];
  onChange: (items: FileAttachmentItem[]) => void;
  maxCount?: number;
  minCount?: number;
  mainFileId?: string | null;
  onMainChange?: (fileId: string) => void;
  error?: string;
  disabled?: boolean;
}

export function ImageGridField({
  apiOptions,
  value,
  onChange,
  maxCount = 10,
  minCount,
  mainFileId,
  onMainChange,
  error,
  disabled = false,
}: ImageGridFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const canAdd = value.length < maxCount && !disabled && !uploading;

  const handleFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (!imageFiles.length) {
        setUploadError('이미지 파일만 업로드 가능합니다');
        return;
      }

      const remaining = maxCount - value.length;
      const toUpload = imageFiles.slice(0, remaining);

      setUploading(true);
      setUploadError(null);
      try {
        const results: CommonFile[] = await Promise.all(
          toUpload.map((file) => uploadFile(apiOptions, file))
        );
        const newItems: FileAttachmentItem[] = results.map((r, i) => ({
          fileId: r.id,
          order: value.length + i,
          isMain: false,
        }));
        const updated = [...value, ...newItems];
        onChange(updated);
        // 최초 업로드 시 첫 번째를 main으로
        if (value.length === 0 && updated.length > 0 && onMainChange) {
          onMainChange(updated[0].fileId);
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : '업로드 실패');
      } finally {
        setUploading(false);
      }
    },
    [apiOptions, value, onChange, maxCount, onMainChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleRemove = (fileId: string) => {
    const updated = value.filter((f) => f.fileId !== fileId);
    onChange(updated);
    if (mainFileId === fileId && onMainChange) {
      onMainChange(updated[0]?.fileId ?? '');
    }
  };

  const handleSetMain = (fileId: string) => {
    onMainChange?.(fileId);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {value.map((item, i) => (
          <ImageGridItem
            key={item.fileId}
            fileId={item.fileId}
            apiOptions={apiOptions}
            isMain={item.fileId === mainFileId}
            onSetMain={() => handleSetMain(item.fileId)}
            onRemove={() => handleRemove(item.fileId)}
            isDragging={draggedIndex === i}
            onDragStart={() => setDraggedIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (draggedIndex === null || draggedIndex === i) {
                setDraggedIndex(null);
                return;
              }
              const reordered = [...value];
              const [moved] = reordered.splice(draggedIndex, 1);
              reordered.splice(i, 0, moved);
              onChange(reordered);
              setDraggedIndex(null);
            }}
          />
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
            aria-label="이미지 추가"
          >
            {uploading ? (
              <span className="text-xs">...</span>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      <p className="text-xs text-gray-500">
        클릭하여 대표 이미지(★) 변경 · 최대 {maxCount}장
        {minCount ? ` (최소 ${minCount}장)` : ''}
      </p>

      {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
