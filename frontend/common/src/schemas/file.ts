import { z } from 'zod';

const uuid = z.string().uuid();

export const commonFileSchema = z.object({
  id: uuid,
  sessionId: z.string().max(64).nullable(),
  originalName: z.string().max(255),
  storedName: z.string().max(255),
  filePath: z.string(),
  fileSize: z.number(),
  mimeType: z.string().max(100),
  fileExt: z.string().max(20).nullable(),
  createdAt: z.string(),
});

export type CommonFile = z.infer<typeof commonFileSchema>;

export const relTopicFileSchema = z.object({
  id: uuid,
  topicId: uuid,
  fileId: uuid,
  order: z.number().int(),
  isMain: z.boolean(),
  createdAt: z.string(),
});

export type RelTopicFile = z.infer<typeof relTopicFileSchema>;

export const fileAttachmentItemSchema = z.object({
  fileId: uuid,
  order: z.number().int().optional(),
  isMain: z.boolean().optional(),
});

export type FileAttachmentItem = z.infer<typeof fileAttachmentItemSchema>;
