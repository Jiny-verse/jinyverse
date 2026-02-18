'use client';

import type { ApiOptions } from '../../../types/api';
import type { FileAttachmentItem } from '../../../schemas/file';
import { FileAttachmentField } from '../../File/FileAttachmentField';
import { FormSection } from '../../Form/FormSection';
import { FormField } from '../../Form/FormField';

interface ProjectTopicFormFieldsProps {
  apiOptions: ApiOptions;
  thumbnailFile: FileAttachmentItem[];
  onThumbnailChange: (v: FileAttachmentItem[]) => void;
}

export function ProjectTopicFormFields({ apiOptions, thumbnailFile, onThumbnailChange }: ProjectTopicFormFieldsProps) {
  return (
    <FormSection title="커버 이미지" description="프로젝트 카드 상단에 표시될 커버 이미지를 업로드하세요">
      <FormField label="커버 이미지" name="thumbnailFile">
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
