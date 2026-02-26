import type { ApiOptions, PageResponse } from '../types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { NotificationTemplate, NotificationTemplateInput } from '../schemas/notificationTemplate';

const TEMPLATE_PATH = 'api/notification-templates';

export async function getNotificationTemplates(
  options: ApiOptions,
  params?: { page?: number; size?: number; channel?: string; q?: string }
): Promise<PageResponse<NotificationTemplate>> {
  return apiGet<PageResponse<NotificationTemplate>>(options, TEMPLATE_PATH, {
    page: params?.page ?? 0,
    size: params?.size ?? 20,
    channel: params?.channel,
    q: params?.q,
  });
}

export async function getNotificationTemplateById(
  options: ApiOptions,
  id: string
): Promise<NotificationTemplate> {
  return apiGet<NotificationTemplate>(options, `${TEMPLATE_PATH}/${id}`);
}

export async function createNotificationTemplate(
  options: ApiOptions,
  data: NotificationTemplateInput
): Promise<NotificationTemplate> {
  return apiPost<NotificationTemplate>(options, TEMPLATE_PATH, data);
}

export async function updateNotificationTemplate(
  options: ApiOptions,
  id: string,
  data: Partial<NotificationTemplateInput>
): Promise<NotificationTemplate> {
  return apiPut<NotificationTemplate>(options, `${TEMPLATE_PATH}/${id}`, data);
}

export async function deleteNotificationTemplate(options: ApiOptions, id: string): Promise<void> {
  return apiDelete(options, `${TEMPLATE_PATH}/${id}`);
}

/**
 * 로컬에서 변수 치환 미리보기
 */
export function renderTemplatePreview(body: string, values: Record<string, string>): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? `{{${key}}}`);
}
