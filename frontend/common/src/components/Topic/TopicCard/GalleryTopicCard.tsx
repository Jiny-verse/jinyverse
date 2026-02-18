'use client';

import type { ApiOptions } from '../../../types/api';
import type { Topic } from '../../../schemas/topic';
import { getMainFileId } from '../../../utils/topic';
import { useImageUrlFromFileId } from '../../../hooks/useImageUrlFromFileId';

interface GalleryTopicCardProps {
  topic: Topic;
  apiOptions: ApiOptions;
  onClick?: () => void;
}

export function GalleryTopicCard({ topic, apiOptions, onClick }: GalleryTopicCardProps) {
  const mainFileId = getMainFileId(topic);
  const imageUrl = useImageUrlFromFileId(mainFileId, apiOptions);

  return (
    <div
      className="relative aspect-square overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={topic.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-200" />
      )}
      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
        <p className="text-white text-sm font-semibold truncate">{topic.title}</p>
        <p className="text-white/70 text-xs mt-0.5">조회 {topic.viewCount ?? 0}</p>
      </div>
    </div>
  );
}
