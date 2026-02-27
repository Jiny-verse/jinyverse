'use client';

import { TopicForm as CommonTopicForm } from 'common/components';
import type { TopicFormProps as CommonTopicFormProps } from 'common/components';
import { useApiOptions } from '@/app/providers/ApiProvider';

export type TopicFormProps = Omit<CommonTopicFormProps, 'apiOptions'>;

export function TopicForm(props: TopicFormProps) {
  const apiOptions = useApiOptions();
  return <CommonTopicForm {...props} apiOptions={apiOptions} />;
}
