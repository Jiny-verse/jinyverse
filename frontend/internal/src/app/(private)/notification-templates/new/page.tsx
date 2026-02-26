'use client';

import { useRouter } from 'next/navigation';
import { createNotificationTemplate } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { TemplateForm } from '../[id]/_components/TemplateForm';
import type { NotificationTemplateInput } from 'common/types';

export default function NewNotificationTemplatePage() {
  const router = useRouter();
  const options = useApiOptions();

  const handleSubmit = async (data: NotificationTemplateInput) => {
    await createNotificationTemplate(options, data);
    router.push('/notification-templates');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">새 알림 템플릿</h1>
      <TemplateForm onSubmit={handleSubmit} submitLabel="생성" />
    </div>
  );
}
