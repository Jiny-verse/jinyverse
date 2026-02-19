'use client';

import type { ApiOptions } from '../../types/api';
import type { FileAttachmentItem } from '../../schemas/file';
import { ImageGridField } from '../File/ImageGridField';
import { FormSection } from '../Form/FormSection';
import { FormField } from '../Form/FormField';

interface ProjectPostFormFieldsProps {
  apiOptions: ApiOptions;
  images: FileAttachmentItem[];
  onImagesChange: (v: FileAttachmentItem[]) => void;
  mainFileId: string | null;
  onMainChange: (id: string) => void;
  imagesError?: string;
}

export function ProjectPostFormFields({
  apiOptions,
  images,
  onImagesChange,
  mainFileId,
  onMainChange,
  imagesError,
}: ProjectPostFormFieldsProps) {
  return (
    <FormSection
      title="이미지"
      description="프로젝트 이미지를 업로드하세요. 클릭하여 커버(★)를 지정하세요 (필수, 최소 1장, 최대 10장)"
    >
      <FormField label="이미지" name="images" required error={imagesError}>
        <ImageGridField
          apiOptions={apiOptions}
          value={images}
          onChange={onImagesChange}
          maxCount={10}
          minCount={1}
          mainFileId={mainFileId}
          onMainChange={onMainChange}
          error={imagesError}
        />
      </FormField>
    </FormSection>
  );
}
