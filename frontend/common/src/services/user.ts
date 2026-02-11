import type { ApiOptions } from '../types/api';
import type { User } from '../schemas/user';
import { userSchema } from '../schemas/user';
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
