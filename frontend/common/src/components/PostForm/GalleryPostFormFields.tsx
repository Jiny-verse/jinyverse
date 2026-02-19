'use client';

import type { ApiOptions } from '../../types/api';
import type { FileAttachmentItem } from '../../schemas/file';
import { ImageGridField } from '../File/ImageGridField';
import { FormSection } from '../Form/FormSection';
import { FormField } from '../Form/FormField';
import { Textarea } from '../../ui/Textarea';

interface GalleryPostFormFieldsProps {
  apiOptions: ApiOptions;
  images: FileAttachmentItem[];
  onImagesChange: (v: FileAttachmentItem[]) => void;
  mainFileId: string | null;
  onMainFileIdChange: (id: string) => void;
  content: string;
  onContentChange: (v: string) => void;
  imagesError?: string;
}

export function GalleryPostFormFields({
  apiOptions,
  images,
  onImagesChange,
  mainFileId,
  onMainFileIdChange,
  content,
  onContentChange,
  imagesError,
}: GalleryPostFormFieldsProps) {
  return (
    <>
      <FormSection
        title="이미지"
        description="갤러리에 표시될 이미지를 업로드하세요 (필수, 최소 1장, 최대 10장)"
      >
        <FormField label="이미지" name="images" required error={imagesError}>
          <ImageGridField
            apiOptions={apiOptions}
            value={images}
            onChange={onImagesChange}
            maxCount={10}
            minCount={1}
            mainFileId={mainFileId}
            onMainChange={onMainFileIdChange}
            error={imagesError}
          />
        </FormField>
      </FormSection>

      <FormSection title="설명" description="이미지에 대한 간단한 설명을 입력하세요 (선택)">
        <FormField label="설명" name="content">
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="설명을 입력하세요..."
            rows={4}
          />
        </FormField>
      </FormSection>
    </>
  );
}
