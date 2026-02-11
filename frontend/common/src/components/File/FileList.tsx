'use client';

import type { CommonFile } from '../../schemas/file';
import type { RelTopicFile } from '../../schemas/file';
import { FileDownloadLink } from './FileDownloadLink';
import type { ApiOptions } from '../../types/api';

export type FileListItem = { id: string; originalName?: string; fileSize?: number } | CommonFile | RelTopicFile;

function getFileId(item: FileListItem): string {
  if ('fileId' in item && typeof (item as RelTopicFile).fileId === 'string') return (item as RelTopicFile).fileId;
  return (item as { id: string }).id;
}
function getDisplayName(item: FileListItem): string {
  if ('originalName' in item && item.originalName) return item.originalName;
  return getFileId(item);
}
function getFileSize(item: FileListItem): number | undefined {
  if ('fileSize' in item) return item.fileSize;
  return undefined;
}

export interface FileListProps {
  files: FileListItem[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
  apiOptions: ApiOptions;
}

export function FileList({ files, onRemove, readOnly = false, apiOptions }: FileListProps) {
  if (files.length === 0) return null;
  return (
    <ul className="list-none space-y-1 p-0">
      {files.map((item) => {
        const id = getFileId(item);
        const name = getDisplayName(item);
        const size = getFileSize(item);
        return (
          <li key={id} className="flex items-center justify-between gap-2 rounded border border-[#333] bg-[#1f1f1f] px-3 py-2 text-sm">
            <span className="min-w-0 flex-1 truncate text-gray-300" title={name}>
              {name}
            </span>
            {size != null && <span className="shrink-0 text-gray-500">{formatSize(size)}</span>}
            <FileDownloadLink fileId={id} label="다운로드" apiOptions={apiOptions} className="shrink-0 text-blue-400 hover:underline" />
            {!readOnly && onRemove && (
              <button
                type="button"
                onClick={() => onRemove(id)}
                className="shrink-0 text-red-400 hover:underline"
              >
                삭제
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
