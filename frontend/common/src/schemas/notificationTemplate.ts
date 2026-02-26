import { z } from 'zod';

export const notificationTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  channel: z.enum(['system', 'email', 'both']),
  emailSubject: z.string().optional(),
  body: z.string(),
  variables: z.array(z.string()),
  description: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const notificationTemplateInputSchema = z.object({
  name: z.string().min(1).max(255),
  channel: z.enum(['system', 'email', 'both']),
  emailSubject: z.string().max(255).optional(),
  body: z.string().min(1),
  variables: z.array(z.string()).optional().default([]),
  description: z.string().optional(),
});

export type NotificationTemplate = z.infer<typeof notificationTemplateSchema>;
export type NotificationTemplateInput = z.infer<typeof notificationTemplateInputSchema>;
