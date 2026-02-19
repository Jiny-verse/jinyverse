'use client';

import type { ApiOptions } from '../../types/api';
import type { FileAttachmentItem } from '../../schemas/file';
import { ImagePreviewField } from '../File/ImagePreviewField';
import { FormSection } from '../Form/FormSection';
import { FormField } from '../Form/FormField';

interface BlogPostFormFieldsProps {
  apiOptions: ApiOptions;
  thumbnailFile: FileAttachmentItem | null;
  onThumbnailChange: (v: FileAttachmentItem | null) => void;
  error?: string;
}

export function BlogPostFormFields({ apiOptions, thumbnailFile, onThumbnailChange, error }: BlogPostFormFieldsProps) {
  return (
    <FormSection title="커버 이미지" description="목록에 표시될 대표 이미지를 업로드하세요 (선택)">
      <FormField label="커버 이미지" name="thumbnailFile" error={error}>
        <ImagePreviewField
          apiOptions={apiOptions}
          value={thumbnailFile}
          onChange={onThumbnailChange}
          aspectRatio="16:9"
        />
      </FormField>
    </FormSection>
  );
}
