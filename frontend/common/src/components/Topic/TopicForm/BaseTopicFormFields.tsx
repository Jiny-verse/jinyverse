'use client';

import { Input } from '../../../ui/Input';
import { Switch } from '../../../ui/Switch';
import { TagInput } from '../../../ui/TagInput';
import { DateTimePicker } from '../../../ui/DateTimePicker';
import { Editor } from '../../Editor/Editor';
import { FormSection } from '../../Form/FormSection';
import { FormField } from '../../Form/FormField';
import { FormFieldGroup } from '../../Form/FormFieldGroup';
import type { BoardType } from '../../../constants/boardType';
import type { TopicFormState, TopicFormHandlers } from './types';

interface BaseTopicFormFieldsProps {
  boardType: BoardType;
  state: TopicFormState;
  handlers: TopicFormHandlers;
}

export function BaseTopicFormFields({ boardType, state, handlers }: BaseTopicFormFieldsProps) {
  const isGallery = boardType === 'gallery';

  return (
    <>
      <FormSection title="기본 정보" description="게시글의 제목과 내용을 입력하세요">
        <FormField label="제목" name="title" required error={state.errors.title} description="게시글 제목 (최대 200자)">
          <Input
            value={state.title}
            onChange={(e) => handlers.setTitle(e.target.value)}
            maxLength={200}
            placeholder="제목을 입력하세요"
            autoFocus
          />
        </FormField>

        <FormField
          label="본문"
          name="content"
          required={!isGallery}
          error={state.errors.content}
          description={isGallery ? '갤러리 타입에서는 선택 사항입니다' : undefined}
        >
          <Editor
            defaultValue={state.content}
            onChange={handlers.setContent}
            defaultMode="text"
            minHeight="500px"
            placeholder="내용을 입력하세요..."
          />
        </FormField>
      </FormSection>

      <FormSection title="추가 설정" description="태그를 관리하세요">
        <FormField label="태그" name="tags" description="Enter 또는 콤마(,)로 추가">
          <TagInput selected={state.tags} onChange={handlers.setTags} maxTags={10} />
        </FormField>
      </FormSection>

      <FormSection title="게시 및 노출 설정">
        <FormFieldGroup columns={2} gap="lg">
          <FormField label="게시 일시" name="publishedAt" description="예약 게시가 필요한 경우 설정하세요">
            <DateTimePicker value={state.publishedAt} onChange={handlers.setPublishedAt} />
          </FormField>

          <div className="flex gap-6 pt-4">
            <FormField label="공개" name="isPublic">
              <Switch checked={state.isPublic} onChange={(e) => handlers.setIsPublic(e.target.checked)} />
            </FormField>
            <FormField label="공지" name="isNotice">
              <Switch checked={state.isNotice} onChange={(e) => handlers.setIsNotice(e.target.checked)} />
            </FormField>
            <FormField label="상단 고정" name="isPinned">
              <Switch checked={state.isPinned} onChange={(e) => handlers.setIsPinned(e.target.checked)} />
            </FormField>
          </div>
        </FormFieldGroup>
      </FormSection>
    </>
  );
}
