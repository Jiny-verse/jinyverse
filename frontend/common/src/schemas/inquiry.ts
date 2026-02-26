import { z } from 'zod';

export const inquiryThreadSchema = z.object({
  id: z.string().uuid(),
  inquiryId: z.string().uuid(),
  authorId: z.string().uuid().optional(),
  authorEmail: z.string().optional(),
  authorName: z.string().optional(),
  typeCode: z.enum(['customer_message', 'staff_reply', 'internal_note', 'status_change']),
  content: z.string(),
  emailSent: z.boolean(),
  createdAt: z.string(),
});

export const inquirySchema = z.object({
  id: z.string().uuid(),
  ticketNo: z.string(),
  userId: z.string().uuid().optional(),
  guestEmail: z.string().optional(),
  categoryCode: z.string(),
  title: z.string(),
  statusCode: z.string(),
  priorityCode: z.string(),
  assigneeId: z.string().uuid().optional(),
  assigneeName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  threads: z.array(inquiryThreadSchema).optional(),
});

export const inquiryCreateSchema = z.object({
  guestEmail: z.string().email().optional(),
  categoryCode: z.string().min(1).max(40),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
});

export const inquiryThreadCreateSchema = z.object({
  typeCode: z.string().min(1).max(40),
  content: z.string().min(1),
  sendEmail: z.boolean().optional().default(false),
});

export type Inquiry = z.infer<typeof inquirySchema>;
export type InquiryThread = z.infer<typeof inquiryThreadSchema>;
export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>;
export type InquiryThreadCreateInput = z.infer<typeof inquiryThreadCreateSchema>;
