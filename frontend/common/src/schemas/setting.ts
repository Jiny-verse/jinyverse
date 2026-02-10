import { z } from 'zod';

/** 파일 저장소 설정 (관리단) */
export const fileStorageSettingSchema = z.object({
  basePath: z.string().nullable(),
});

export type FileStorageSetting = z.infer<typeof fileStorageSettingSchema>;

/** 파일 저장소 설정 수정 요청 */
export const fileStorageSettingUpdateSchema = z.object({
  basePath: z.string().max(500).optional().nullable(),
});

export type FileStorageSettingUpdate = z.infer<typeof fileStorageSettingUpdateSchema>;
