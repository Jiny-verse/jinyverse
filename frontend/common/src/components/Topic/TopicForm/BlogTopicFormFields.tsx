'use client';

import type { ApiOptions } from '../../../types/api';
import type { FileAttachmentItem } from '../../../schemas/file';
import { FileAttachmentField } from '../../File/FileAttachmentField';
import { FormSection } from '../../Form/FormSection';
import { FormField } from '../../Form/FormField';

interface BlogTopicFormFieldsProps {
  apiOptions: ApiOptions;
  thumbnailFile: FileAttachmentItem[];
  onThumbnailChange: (v: FileAttachmentItem[]) => void;
}

export function BlogTopicFormFields({ apiOptions, thumbnailFile, onThumbnailChange }: BlogTopicFormFieldsProps) {
  return (
    <FormSection title="썸네일 이미지" description="목록에 표시될 대표 이미지를 업로드하세요">
      <FormField label="썸네일" name="thumbnailFile">
        <FileAttachmentField
          apiOptions={apiOptions}
          value={thumbnailFile}
          onChange={onThumbnailChange}
          multiple={false}
        />
      </FormField>
    </FormSection>
  );
}
