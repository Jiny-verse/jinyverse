import {
  landingSectionSchema,
  landingCtaSchema,
  landingSectionCreateSchema,
  landingSectionUpdateSchema,
  landingCtaCreateSchema,
  landingCtaUpdateSchema,
} from '../schemas';
import type { ApiOptions } from '../types/api';
import type {
  LandingSection,
  LandingCta,
  LandingSectionCreateInput,
  LandingSectionUpdateInput,
  LandingCtaCreateInput,
  LandingCtaUpdateInput,
} from '../schemas/landing';
import { apiGet, apiPost, apiDelete } from './api';
import { z } from 'zod';

const sectionListSchema = z.array(landingSectionSchema);

/** 공개 API: 활성 섹션 목록 */
export async function getActiveLandingSections(options: ApiOptions): Promise<LandingSection[]> {
  const data = await apiGet<LandingSection[]>(options, '/api/landing/sections');
  return sectionListSchema.parse(data);
}

/** 관리자 API: 전체 섹션 목록 */
export async function getAdminLandingSections(options: ApiOptions): Promise<LandingSection[]> {
  const data = await apiGet<LandingSection[]>(options, '/api/admin/landing/sections');
  return sectionListSchema.parse(data);
}

export async function createLandingSection(
  options: ApiOptions,
  body: LandingSectionCreateInput
): Promise<LandingSection> {
  const parsed = landingSectionCreateSchema.parse(body);
  const data = await apiPost<LandingSection>(options, '/api/admin/landing/sections', parsed);
  return landingSectionSchema.parse(data);
}

export async function updateLandingSection(
  options: ApiOptions,
  id: string,
  body: LandingSectionUpdateInput
): Promise<LandingSection> {
  const parsed = landingSectionUpdateSchema.parse(body);
  const data = await apiPost<LandingSection>(options, `/api/admin/landing/sections/${id}`, parsed);
  return landingSectionSchema.parse(data);
}

export async function deleteLandingSection(options: ApiOptions, id: string): Promise<void> {
  await apiDelete(options, `/api/admin/landing/sections/${id}`);
}

export async function createLandingCta(
  options: ApiOptions,
  sectionId: string,
  body: LandingCtaCreateInput
): Promise<LandingCta> {
  const parsed = landingCtaCreateSchema.parse(body);
  const data = await apiPost<LandingCta>(
    options,
    `/api/admin/landing/sections/${sectionId}/ctas`,
    parsed
  );
  return landingCtaSchema.parse(data);
}

export async function updateLandingCta(
  options: ApiOptions,
  id: string,
  body: LandingCtaUpdateInput
): Promise<LandingCta> {
  const parsed = landingCtaUpdateSchema.parse(body);
  const data = await apiPost<LandingCta>(options, `/api/admin/landing/ctas/${id}`, parsed);
  return landingCtaSchema.parse(data);
}

export async function deleteLandingCta(options: ApiOptions, id: string): Promise<void> {
  await apiDelete(options, `/api/admin/landing/ctas/${id}`);
}
