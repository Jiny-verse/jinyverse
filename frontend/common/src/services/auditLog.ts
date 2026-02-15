import type { ApiOptions, PageResponse } from '../types/api';
import { auditLogSchema, auditLogListParamsSchema } from '../schemas/auditLog';
import { pageResponseSchema } from '../schemas/common';
import type { AuditLog, AuditLogListParams } from '../schemas/auditLog';
import { apiGet } from './api';

const AUDIT_LOGS_PATH = 'api/audit-logs';

const auditLogPageSchema = pageResponseSchema(auditLogSchema);

export async function getAuditLogs(
  options: ApiOptions,
  params: AuditLogListParams = {}
): Promise<PageResponse<AuditLog>> {
  const parsed = auditLogListParamsSchema.parse(params);
  const query: Record<string, string | number | boolean | undefined> = {};
  if (parsed.page !== undefined) query.page = parsed.page;
  if (parsed.size !== undefined) query.size = parsed.size;
  if (parsed.sort !== undefined) query.sort = parsed.sort;
  if (parsed.q !== undefined && parsed.q !== '') query.q = parsed.q;
  if (parsed.targetType !== undefined && parsed.targetType !== '') query.targetType = parsed.targetType;
  if (parsed.action !== undefined && parsed.action !== '') query.action = parsed.action;
  const data = await apiGet<PageResponse<AuditLog>>(options, AUDIT_LOGS_PATH, query);
  return auditLogPageSchema.parse(data) as PageResponse<AuditLog>;
}

export async function getAuditLogById(options: ApiOptions, id: string): Promise<AuditLog> {
  const data = await apiGet<AuditLog>(options, `${AUDIT_LOGS_PATH}/${id}`);
  return auditLogSchema.parse(data);
}
