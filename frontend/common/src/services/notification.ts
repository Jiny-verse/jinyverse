import type { ApiOptions, PageResponse } from '../types/api';
import { apiGet, apiPost } from './api';
import type { Notification, NotificationSetting, NotificationSettingInput } from '../schemas/notification';

const NOTIFICATION_PATH = 'api/notifications';

export async function getNotifications(
  options: ApiOptions,
  params?: { page?: number; size?: number; isRead?: boolean }
): Promise<PageResponse<Notification>> {
  return apiGet<PageResponse<Notification>>(options, NOTIFICATION_PATH, {
    page: params?.page ?? 0,
    size: params?.size ?? 20,
    isRead: params?.isRead,
  });
}

export async function getUnreadCount(options: ApiOptions): Promise<{ count: number }> {
  return apiGet<{ count: number }>(options, `${NOTIFICATION_PATH}/unread-count`);
}

export async function markNotificationRead(
  options: ApiOptions,
  id: string
): Promise<Notification> {
  return apiPost<Notification>(options, `${NOTIFICATION_PATH}/${id}/mark-read`, {});
}

export async function markAllNotificationsRead(options: ApiOptions): Promise<void> {
  return apiPost<void>(options, `${NOTIFICATION_PATH}/mark-all-read`, {});
}

export async function getNotificationSetting(
  options: ApiOptions
): Promise<NotificationSetting> {
  return apiGet<NotificationSetting>(options, `${NOTIFICATION_PATH}/settings`);
}

export async function updateNotificationSetting(
  options: ApiOptions,
  data: NotificationSettingInput
): Promise<NotificationSetting> {
  return apiPost<NotificationSetting>(options, `${NOTIFICATION_PATH}/settings/update`, data);
}
