'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getNotificationTemplateById,
  updateNotificationTemplate,
} from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { TemplateForm } from './_components/TemplateForm';
import { TemplatePreview } from './_components/TemplatePreview';
import type { NotificationTemplate, NotificationTemplateInput } from 'common/types';

export default function NotificationTemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const options = useApiOptions();
  const [template, setTemplate] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    getNotificationTemplateById(options, id)
      .then(setTemplate)
      .catch(() => router.push('/notification-templates'))
      .finally(() => setLoading(false));
  }, [id, options.baseUrl]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (data: NotificationTemplateInput) => {
    if (!id) return;
    const updated = await updateNotificationTemplate(options, id, data);
    setTemplate(updated);
  };

  if (loading) return <p className="text-muted-foreground">로딩 중...</p>;
  if (!template) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">템플릿 편집</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TemplateForm
          initial={{
            name: template.name,
            channel: template.channel,
            emailSubject: template.emailSubject,
            body: template.body,
            variables: template.variables,
            description: template.description,
          }}
          onSubmit={handleSubmit}
        />
        <TemplatePreview
          body={template.body}
          emailSubject={template.emailSubject}
          variables={template.variables}
        />
      </div>
    </div>
  );
}
