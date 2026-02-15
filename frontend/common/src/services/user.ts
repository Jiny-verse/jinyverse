import type { ApiOptions, PageResponse } from '../types/api';
import type { User, UserUpdateInput, UserListParams } from '../schemas/user';
import { userSchema, userUpdateInputSchema, userListParamsSchema } from '../schemas/user';
import { pageResponseSchema } from '../schemas/common';
import { apiDelete, apiGet, apiPost } from './api';

const USERS_PATH = 'api/users';

export async function getMe(options: ApiOptions): Promise<User> {
  const data = await apiGet<User>(options, `${USERS_PATH}/me`);
  return userSchema.parse(data);
}

export async function setProfileImage(options: ApiOptions, fileId: string): Promise<User> {
  const data = await apiPost<User>(options, `${USERS_PATH}/me/profile-image`, { fileId });
  return userSchema.parse(data);
}

export async function clearProfileImage(options: ApiOptions): Promise<User> {
  await apiDelete(options, `${USERS_PATH}/me/profile-image`);
  return getMe(options);
}

const userPageSchema = pageResponseSchema(userSchema);

export async function getUsersForAdmin(
  options: ApiOptions,
  params: UserListParams = {}
): Promise<PageResponse<User>> {
  const parsed = userListParamsSchema.parse(params);
  const query: Record<string, string | number | boolean | undefined> = {};
  if (parsed.page !== undefined) query.page = parsed.page;
  if (parsed.size !== undefined) query.size = parsed.size;
  if (parsed.keyword !== undefined && parsed.keyword !== '') query.keyword = parsed.keyword;
  if (parsed.isActive !== undefined) query.isActive = parsed.isActive;
  if (parsed.isLocked !== undefined) query.isLocked = parsed.isLocked;
  if (parsed.role !== undefined && parsed.role !== '') query.role = parsed.role;
  const data = await apiGet<PageResponse<User>>(options, USERS_PATH, query);
  return userPageSchema.parse(data) as PageResponse<User>;
}

export async function getUserById(options: ApiOptions, id: string): Promise<User> {
  const data = await apiGet<User>(options, `${USERS_PATH}/${id}`);
  return userSchema.parse(data);
}

export async function updateUser(
  options: ApiOptions,
  id: string,
  body: UserUpdateInput
): Promise<User> {
  const parsed = userUpdateInputSchema.parse(body);
  const data = await apiPost<User>(options, `${USERS_PATH}/${id}`, parsed);
  return userSchema.parse(data);
}
