import type { ApiOptions } from '../types/api';
import { apiGet, apiPost } from './api';

export interface ThumbnailStatus {
  total: number;
  withThumbnail: number;
  withoutThumbnail: number;
}

export async function getThumbnailStatus(options: ApiOptions): Promise<ThumbnailStatus> {
  return apiGet<ThumbnailStatus>(options, 'api/admin/jobs/thumbnail-status');
}

export async function runThumbnailBackfill(options: ApiOptions): Promise<{ status: string; job: string }> {
  return apiPost<{ status: string; job: string }>(options, 'api/admin/jobs/thumbnail-backfill', {});
}
