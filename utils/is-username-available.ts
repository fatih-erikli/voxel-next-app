import { kv } from '@vercel/kv';

export default async function isUsernameAvailable(username: string): Promise<boolean> {
  const userExists = await kv.exists(`user:${username}`);
  return !userExists;
}
