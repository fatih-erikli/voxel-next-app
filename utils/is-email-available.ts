import { encryptEmailAddress } from "./encrypt-email-address";
import { kv } from '@vercel/kv';

export default async function isEmailAvailable(email: string): Promise<boolean> {
  const emailAvailable = await kv.sismember(`emails`, encryptEmailAddress(email));
  return !emailAvailable;
}
