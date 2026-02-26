import { z } from 'zod';

export const notificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  typeCategoryCode: z.string(),
  type: z.string(),
  message: z.string(),
  link: z.string().optional(),
  isRead: z.boolean(),
  sendEmail: z.boolean(),
  emailSent: z.boolean(),
  createdAt: z.string(),
  readAt: z.string().optional(),
});

export const notificationSettingSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  systemEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  emailOverride: z.string().optional(),
  typeSettings: z.record(z.boolean()),
});

export const notificationSettingInputSchema = z.object({
  systemEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  emailOverride: z.string().optional(),
  typeSettings: z.record(z.boolean()).optional(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationSetting = z.infer<typeof notificationSettingSchema>;
export type NotificationSettingInput = z.infer<typeof notificationSettingInputSchema>;
