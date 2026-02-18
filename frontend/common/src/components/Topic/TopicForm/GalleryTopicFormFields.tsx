'use client';

import type { ApiOptions } from '../../../types/api';
import type { FileAttachmentItem } from '../../../schemas/file';
import { FileAttachmentField } from '../../File/FileAttachmentField';
import { FormSection } from '../../Form/FormSection';
import { FormField } from '../../Form/FormField';

interface GalleryTopicFormFieldsProps {
  apiOptions: ApiOptions;
  thumbnailFile: FileAttachmentItem[];
  additionalFiles: FileAttachmentItem[];
  onThumbnailChange: (v: FileAttachmentItem[]) => void;
  onAdditionalFilesChange: (v: FileAttachmentItem[]) => void;
  thumbnailError?: string;
}

export function GalleryTopicFormFields({
  apiOptions,
  thumbnailFile,
  additionalFiles,
  onThumbnailChange,
  onAdditionalFilesChange,
  thumbnailError,
}: GalleryTopicFormFieldsProps) {
  return (
    <FormSection title="이미지" description="갤러리에 표시될 이미지를 업로드하세요">
      <FormField label="대표 이미지" name="thumbnailFile" required error={thumbnailError}>
        <FileAttachmentField
          apiOptions={apiOptions}
          value={thumbnailFile}
          onChange={onThumbnailChange}
          multiple={false}
        />
      </FormField>

      <FormField label="추가 이미지" name="additionalFiles" description="최대 10장까지 추가 가능합니다">
        <FileAttachmentField
          apiOptions={apiOptions}
          value={additionalFiles}
          onChange={onAdditionalFilesChange}
          multiple={true}
        />
      </FormField>
    </FormSection>
  );
}
