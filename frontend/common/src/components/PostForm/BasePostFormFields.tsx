'use client';

import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';
import { TagInput } from '../../ui/TagInput';
import { DateTimePicker } from '../../ui/DateTimePicker';
import { Editor } from '../Editor/Editor';
import { FormSection } from '../Form/FormSection';
import { FormField } from '../Form/FormField';
import { FormFieldGroup } from '../Form/FormFieldGroup';
import type { BoardType } from '../../constants/boardType';
import type { PostFormState, PostFormHandlers } from './types';
import type { ApiOptions } from '../../types/api';
import { uploadFile } from '../../services/file';
import { getPublicImageUrl } from '../../utils/file';
import useLanguage from '../../utils/i18n/hooks/useLanguage';

interface BasePostFormFieldsProps {
  boardType: BoardType;
  state: PostFormState;
  handlers: PostFormHandlers;
  apiOptions?: ApiOptions;
}

export function BasePostFormFields({ boardType, state, handlers, apiOptions }: BasePostFormFieldsProps) {
  const isGallery = boardType === 'gallery';
  const { t } = useLanguage();

  const handleUploadImage = apiOptions
    ? async (file: File): Promise<string> => {
        const uploaded = await uploadFile(apiOptions, file);
        return getPublicImageUrl(uploaded.id, apiOptions);
      }
    : undefined;

  return (
    <>
      <FormSection title={t('board.form.basicInfo')} description={t('board.form.basicInfoDesc')}>
        <FormField label={t('form.label.title')} name="title" required error={state.errors.title} description={t('board.form.titleMaxLen')}>
          <Input
            value={state.title}
            onChange={(e) => handlers.setTitle(e.target.value)}
            maxLength={200}
            placeholder={t('form.placeholder.title')}
            autoFocus
          />
        </FormField>

        {!isGallery && (
          <FormField label={t('board.form.body')} name="content" required error={state.errors.content}>
            <Editor
              defaultValue={state.content}
              onChange={handlers.setContent}
              defaultMode="text"
              minHeight="500px"
              placeholder={t('form.placeholder.content')}
              onUploadImage={handleUploadImage}
            />
          </FormField>
        )}
      </FormSection>

      <FormSection title={t('board.form.extraSettings')} description={t('board.form.tagDesc')}>
        <FormField label={t('form.label.tags')} name="tags" description={t('board.form.tagDesc')}>
          <TagInput selected={state.tags} onChange={handlers.setTags} maxTags={10} />
        </FormField>
      </FormSection>

      <FormSection title={t('board.form.publishSettings')}>
        <FormFieldGroup columns={2} gap="lg">
          <FormField label={t('board.form.publishAt')} name="publishedAt" description={t('board.form.publishAtDesc')}>
            <DateTimePicker value={state.publishedAt} onChange={handlers.setPublishedAt} />
          </FormField>

          <div className="flex gap-6 pt-4">
            <FormField label={t('board.form.isPublic')} name="isPublic">
              <Switch checked={state.isPublic} onChange={(e) => handlers.setIsPublic(e.target.checked)} />
            </FormField>
            <FormField label={t('board.form.isNotice')} name="isNotice">
              <Switch checked={state.isNotice} onChange={(e) => handlers.setIsNotice(e.target.checked)} />
            </FormField>
            <FormField label={t('board.form.isPinned')} name="isPinned">
              <Switch checked={state.isPinned} onChange={(e) => handlers.setIsPinned(e.target.checked)} />
            </FormField>
          </div>
        </FormFieldGroup>
      </FormSection>
    </>
  );
}
