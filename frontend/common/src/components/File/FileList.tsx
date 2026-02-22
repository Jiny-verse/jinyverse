'use client';

import type { CommonFile } from '../../schemas/file';
import type { RelTopicFile } from '../../schemas/file';
import { FileDownloadLink } from './FileDownloadLink';
import type { ApiOptions } from '../../types/api';
import { useImageUrlFromFileId } from '../../hooks/useImageUrlFromFileId';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

export type FileListItem = { id: string; originalName?: string; fileSize?: number } | CommonFile | RelTopicFile;

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

function isImageFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTS.includes(ext);
}

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

interface FileListRowProps {
  item: FileListItem;
  onRemove?: (id: string) => void;
  readOnly: boolean;
  apiOptions: ApiOptions;
}

function FileListRow({ item, onRemove, readOnly, apiOptions }: FileListRowProps) {
  const id = getFileId(item);
  const name = getDisplayName(item);
  const size = getFileSize(item);
  const showThumb = isImageFile(name);
  const thumbUrl = useImageUrlFromFileId(showThumb ? id : null, apiOptions);
  const { t } = useLanguage();

  return (
    <li className="flex items-center justify-between gap-2 rounded border border-[#333] bg-[#1f1f1f] px-3 py-2 text-sm">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {showThumb && (
          <div className="shrink-0 w-10 h-10 rounded overflow-hidden bg-gray-700">
            {thumbUrl ? (
              <img src={thumbUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-600 animate-pulse" />
            )}
          </div>
        )}
        <span className="min-w-0 truncate text-gray-300" title={name}>
          {name}
        </span>
      </div>
      {size != null && <span className="shrink-0 text-gray-500">{formatSize(size)}</span>}
      <FileDownloadLink fileId={id} label={t('file.download')} apiOptions={apiOptions} className="shrink-0 text-blue-400 hover:underline" />
      {!readOnly && onRemove && (
        <button
          type="button"
          onClick={() => onRemove(id)}
          className="shrink-0 text-red-400 hover:underline"
        >
          {t('file.delete')}
        </button>
      )}
    </li>
  );
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
      {files.map((item) => (
        <FileListRow
          key={getFileId(item)}
          item={item}
          onRemove={onRemove}
          readOnly={readOnly}
          apiOptions={apiOptions}
        />
      ))}
    </ul>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
