'use client';

import type { ApiOptions } from '../../types/api';
import type { FileAttachmentItem } from '../../schemas/file';
import { ImageGridField } from '../File/ImageGridField';
import { FormSection } from '../Form/FormSection';
import { FormField } from '../Form/FormField';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

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
  const { t } = useLanguage();
  return (
    <FormSection
      title={t('board.form.images')}
      description={t('board.form.projectImagesDesc')}
    >
      <FormField label={t('board.form.images')} name="images" required error={imagesError}>
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
