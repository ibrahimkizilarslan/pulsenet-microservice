import { usersApi } from '@/lib/api';

export type StoredUser = {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
};

/** Ensures `pulsenet_user` has Users service profile `id` (Mongo ObjectId), not only username. */
export async function ensureStoredUserHasId(): Promise<StoredUser | null> {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('pulsenet_user');
  if (!raw) return null;
  let u = JSON.parse(raw) as Partial<StoredUser> & { username?: string };
  if (u.id) return u as StoredUser;
  if (!u.username) return null;
  const { data } = await usersApi.getByUsername(u.username);
  localStorage.setItem('pulsenet_user', JSON.stringify(data));
  return data as StoredUser;
}
