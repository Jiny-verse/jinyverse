'use client';

import type { ApiOptions } from '../../types/api';
import type { FileAttachmentItem } from '../../schemas/file';
import { ImageGridField } from '../File/ImageGridField';
import { FormSection } from '../Form/FormSection';
import { FormField } from '../Form/FormField';
import { Textarea } from '../../ui/Textarea';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

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
  const { t } = useLanguage();
  return (
    <>
      <FormSection
        title={t('board.form.images')}
        description={t('board.form.galleryImagesDesc')}
      >
        <FormField label={t('board.form.images')} name="images" required error={imagesError}>
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
          <p className="text-xs text-muted-foreground mt-1">Click the ★ icon on an image to set it as the main/cover image.</p>
        </FormField>
      </FormSection>

      <FormSection title={t('board.form.galleryDesc')} description={t('board.form.galleryDescSub')}>
        <FormField label={t('board.form.galleryDesc')} name="content">
          <Textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={t('form.placeholder.description')}
            rows={4}
          />
        </FormField>
      </FormSection>
    </>
  );
}
