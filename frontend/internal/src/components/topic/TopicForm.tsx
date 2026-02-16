'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FormContainer,
  FormSection,
  FormField,
  FormFieldGroup,
  FormActions,
  Editor,
  FileAttachmentField,
} from 'common/components';
import { Input, Switch, TagInput, DateTimePicker } from 'common/ui';
import { createTopic, updateTopic } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useAuth } from 'common';
import type { Topic, TopicCreateInput, FileAttachmentItem } from 'common/schemas';

interface TopicFormProps {
  mode: 'create' | 'edit';
  boardId: string;
  topicId?: string;
  initialData?: Partial<Topic>;
  onSuccess?: (topicId: string) => void;
  onCancel?: () => void;
}

export function TopicForm({
  mode,
  boardId,
  topicId,
  initialData,
  onSuccess,
  onCancel,
}: TopicFormProps) {
  const router = useRouter();
  const apiOptions = useApiOptions();
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isNotice, setIsNotice] = useState(initialData?.isNotice ?? false);
  const [isPinned, setIsPinned] = useState(initialData?.isPinned ?? false);
  const [tags, setTags] = useState<string[]>(initialData?.tags?.map(t => t.name) || []);
  const [files, setFiles] = useState<FileAttachmentItem[]>(
    initialData?.files?.map(f => ({ fileId: f.fileId, order: f.order, isMain: f.isMain })) || []
  );
  const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt || '');
  
  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);

  // File metadata for preview if editing
  const initialFileMeta = useMemo(() => {
    const meta: Record<string, { originalName: string }> = {};
    // Topic 상세 조회 데이터에 file 정보가 포함되어 있다고 가정
    // fileId만으로는 이름을 알 수 없으므로 topic 데이터의 관계 필드를 활용해야 함
    // (이 예시는 단순화를 위해 생략하거나 topic schema에 따라 구성)
    return meta;
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = '제목을 입력하세요';
    } else if (title.length > 200) {
      newErrors.title = '제목은 최대 200자까지 입력 가능합니다';
    }
    
    if (!content.trim()) {
      newErrors.content = '내용을 입력하세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveTopic = async (status: string) => {
    if (!validateForm()) return;
    
    if (status === 'created') setIsSaving(true);
    else setIsDraftSaving(true);
    
    try {
      // 태그 처리: 현재 프로젝트는 string[]이 아닌 tagIds 또는 tagNames를 기대할 수 있음
      // topicCreateSchema 확인 결과 tagIds를 받음 (UUID[])
      // 여기서는 단순화를 위해 태그 이름 그대로 사용하거나 백엔드 요구사항에 맞춰 변환 필요
      // TODO: Tag 처리는 실제 백엔드 API 명세에 따라 고도화 필요
      
      const payload: TopicCreateInput = {
        authorUserId: user?.userId || '',
        boardId,
        title: title.trim(),
        content: content.trim(),
        isNotice,
        isPinned,
        isPublic,
        status,
        publishedAt: publishedAt || undefined,
        files: files,
        // tagIds: tags... // 태그 구현 방식에 따라 추가
      };
      
      let resultId: string;
      
      if (mode === 'create') {
        const result = await createTopic(apiOptions, payload);
        resultId = result.id;
      } else {
        const result = await updateTopic(apiOptions, topicId!, payload);
        resultId = result.id;
      }
      
      if (status === 'created') {
        onSuccess?.(resultId);
      } else {
        // 임시저장 성공 시
        if (mode === 'create') {
          router.push(`/boards/${boardId}/topics/${resultId}/edit`);
        }
      }
    } catch (error: any) {
      console.error('Failed to save topic:', error);
      setErrors({ submit: error.message || '저장에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSaving(false);
      setIsDraftSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <FormContainer onSubmit={(e) => { e.preventDefault(); saveTopic('created'); }} disabled={isSaving || isDraftSaving}>
        <FormSection 
          title="기본 정보" 
          description="게시글의 제목과 내용을 입력하세요"
        >
          <FormField
            label="제목"
            name="title"
            required
            error={errors.title}
            description="게시글 제목 (최대 200자)"
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="제목을 입력하세요"
              autoFocus
            />
          </FormField>

          <FormField
            label="본문"
            name="content"
            required
            error={errors.content}
          >
            <Editor
              defaultValue={content}
              onChange={setContent}
              defaultMode="text"
              minHeight="500px"
              placeholder="내용을 입력하세요..."
            />
          </FormField>
        </FormSection>

        <FormSection title="추가 설정" description="태그와 파일을 관리하세요">
          <FormFieldGroup columns={2} gap="lg">
            <FormField label="태그" name="tags" description="Enter 또는 콤마(,)로 추가">
              <TagInput selected={tags} onChange={setTags} maxTags={10} />
            </FormField>
            
            <FormField label="파일 첨부" name="files" description="드래그 앤 드롭 지원">
              <FileAttachmentField
                apiOptions={apiOptions}
                value={files}
                onChange={setFiles}
                fileMeta={initialFileMeta}
                multiple={true}
              />
            </FormField>
          </FormFieldGroup>
        </FormSection>

        <FormSection title="게시 및 노출 설정">
          <FormFieldGroup columns={2} gap="lg">
            <FormField label="게시 일시" name="publishedAt" description="예약 게시가 필요한 경우 설정하세요">
              <DateTimePicker value={publishedAt} onChange={setPublishedAt} />
            </FormField>
            
            <div className="flex gap-6 pt-4">
              <FormField label="공개" name="isPublic">
                <Switch checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              </FormField>
              
              <FormField label="공지" name="isNotice">
                <Switch checked={isNotice} onChange={(e) => setIsNotice(e.target.checked)} />
              </FormField>
              
              <FormField label="상단 고정" name="isPinned">
                <Switch checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
              </FormField>
            </div>
          </FormFieldGroup>
        </FormSection>

        {errors.submit && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm mb-4">
            {errors.submit}
          </div>
        )}

        <FormActions
          submitLabel={mode === 'create' ? '게시' : '수정 완료'}
          onCancel={handleCancel}
          isSubmitting={isSaving}
          extraActions={
            <button
              type="button"
              onClick={() => saveTopic('temporary')}
              disabled={isSaving || isDraftSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isDraftSaving ? '저장 중...' : '임시저장'}
            </button>
          }
        />
      </FormContainer>
    </div>
  );
}
