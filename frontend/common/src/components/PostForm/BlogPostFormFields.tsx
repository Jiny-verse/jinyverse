'use client';

import type { ApiOptions } from '../../types/api';
import type { FileAttachmentItem } from '../../schemas/file';
import { ImagePreviewField } from '../File/ImagePreviewField';
import { FormSection } from '../Form/FormSection';
import { FormField } from '../Form/FormField';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

interface BlogPostFormFieldsProps {
  apiOptions: ApiOptions;
  thumbnailFile: FileAttachmentItem | null;
  onThumbnailChange: (v: FileAttachmentItem | null) => void;
  error?: string;
}

export function BlogPostFormFields({ apiOptions, thumbnailFile, onThumbnailChange, error }: BlogPostFormFieldsProps) {
  const { t } = useLanguage();
  return (
    <FormSection title={t('board.form.coverImage')} description={t('board.form.coverImageDesc')}>
      <FormField label={t('board.form.coverImage')} name="thumbnailFile" error={error}>
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
