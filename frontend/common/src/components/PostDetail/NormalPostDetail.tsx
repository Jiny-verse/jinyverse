'use client';

import type { ApiOptions } from '../../types/api';
import type { Topic } from '../../schemas/topic';
import { ContentViewer } from '../Editor/Viewer/ContentViewer';
import { FileList } from '../File/FileList';
import { Badge } from '../../ui/Badge';
import { formatRelativeOrAbsolute } from '../../utils/formatDateTime';

interface NormalPostDetailProps {
  topic: Topic;
  apiOptions: ApiOptions;
}

export function NormalPostDetail({ topic, apiOptions }: NormalPostDetailProps) {
  const attachedFiles = topic.files?.filter((f) => !f.isMain) ?? [];

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {topic.isNotice && <Badge variant="default">공지</Badge>}
          {topic.isPinned && <Badge variant="info">고정</Badge>}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{topic.title}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>{topic.author?.nickname ?? '-'}</span>
          <span>·</span>
          <span>{formatRelativeOrAbsolute(topic.createdAt)}</span>
          <span>·</span>
          <span>조회 {topic.viewCount ?? 0}</span>
        </div>
      </header>

      <hr className="border-gray-200 mb-6" />

      <ContentViewer content={topic.content} apiOptions={apiOptions} />

      {attachedFiles.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">첨부파일</h2>
          <FileList files={attachedFiles} readOnly apiOptions={apiOptions} />
        </div>
      )}

      {topic.tags?.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {topic.tags.map((t) => (
            <Badge key={t.id} variant="info">
              #{t.name}
            </Badge>
          ))}
        </div>
      ) : null}
    </article>
  );
}
