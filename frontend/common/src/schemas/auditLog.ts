import { z } from 'zod';

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  targetType: z.string(),
  targetId: z.string().uuid().nullable().optional(),
  action: z.string(),
  beforeData: z.string().nullable().optional(),
  afterData: z.string().nullable().optional(),
  actorUserId: z.string().uuid().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type AuditLog = z.infer<typeof auditLogSchema>;

export const auditLogListParamsSchema = z.object({
  page: z.number().int().min(0).optional(),
  size: z.number().int().positive().optional(),
  sort: z.string().optional(),
  q: z.string().optional(),
  targetType: z.string().optional(),
  action: z.string().optional(),
});
export type AuditLogListParams = z.infer<typeof auditLogListParamsSchema>;
