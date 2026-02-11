'use client';

import { useCallback, useState } from 'react';
import type { ApiOptions } from '../../types/api';
import type { CommonFile, FileAttachmentItem } from '../../schemas/file';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { uploadFile } from '../../services/file';

export interface FileAttachmentFieldProps {
  apiOptions: ApiOptions;
  value: FileAttachmentItem[];
  onChange: (value: FileAttachmentItem[]) => void;
  fileMeta?: Record<string, { originalName: string; fileSize?: number }>;
  sessionId?: string;
  onUploadError?: (error: Error) => void;
  multiple?: boolean;
}

export function FileAttachmentField({ apiOptions, value, onChange, fileMeta = {}, sessionId, onUploadError, multiple = true }: FileAttachmentFieldProps) {
  const [uploadedMeta, setUploadedMeta] = useState<Record<string, { originalName: string; fileSize?: number }>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = useCallback(
    (files: CommonFile[]) => {
      setUploadError(null);
      setUploadedMeta((prev) => {
        const nextMeta = { ...prev };
        files.forEach((file) => {
          nextMeta[file.id] = { originalName: file.originalName, fileSize: file.fileSize };
        });
        return nextMeta;
      });

      onChange([
        ...value,
        ...files.map((file, index) => ({
          fileId: file.id,
          order: value.length + index,
          isMain: value.length === 0 && index === 0,
        })),
      ]);
    },
    [value, onChange]
  );

  const handleError = useCallback(
    (err: Error) => {
      const msg = err.message || String(err);
      setUploadError(msg);
      onUploadError?.(err);
    },
    [onUploadError]
  );

  const handleRemove = useCallback(
    (id: string) => {
      setUploadedMeta((prev) => { const n = { ...prev }; delete n[id]; return n; });
      onChange(value.filter((f) => f.fileId !== id));
    },
    [value, onChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const fileList = e.dataTransfer.files;
    if (!fileList.length) return;

    // multiple 체크
    const filesToUpload = multiple ? Array.from(fileList) : [fileList[0]];
    
    try {
      setUploadError(null);
      const results = await Promise.all(
        filesToUpload.map(file => uploadFile(apiOptions, file, sessionId))
      );
      handleUpload(results);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const listItems = value.map((f) => {
    const meta = uploadedMeta[f.fileId] ?? fileMeta[f.fileId];
    return { id: f.fileId, originalName: meta?.originalName, fileSize: meta?.fileSize };
  });

  return (
    <div 
      className="space-y-2"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2">
        <FileUpload
          apiOptions={apiOptions}
          sessionId={sessionId}
          multiple={multiple}
          onUpload={handleUpload}
          onError={handleError}
        >
          파일 추가
        </FileUpload>
      </div>
      {uploadError && (
        <p className="text-sm text-red-500" role="alert">
          업로드 실패: {uploadError}
        </p>
      )}
      <FileList
        files={listItems}
        onRemove={handleRemove}
        readOnly={false}
        apiOptions={apiOptions}
      />
    </div>
  );
}
