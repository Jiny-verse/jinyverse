import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, '8자 이상')
  .max(100)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/,
    '영문, 숫자, 특수문자를 포함해야 합니다'
  );

export const loginRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(100),
});

/** 로그인/리프레시 응답. 토큰은 httpOnly 쿠키로 전달되므로 body에는 null 또는 생략됨 */
export const loginResponseSchema = z.object({
  userId: z.string().uuid(),
  username: z.string(),
  role: z.string(),
  accessToken: z.string().nullish(),
  refreshToken: z.string().nullish(),
  expiresAt: z.string().nullish(),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const registerRequestSchema = z.object({
  username: z.string().min(3).max(50),
  password: passwordSchema,
  email: z.string().email().max(256),
  name: z.string().min(1).max(20),
  nickname: z.string().min(1).max(20),
});

export const verifyEmailRequestSchema = z.object({
  email: z.string().email().max(256),
  code: z.string().min(1).max(50),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email().max(256),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email().max(256),
  code: z.string().min(1).max(50),
  newPassword: passwordSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type RequestPasswordResetRequest = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
