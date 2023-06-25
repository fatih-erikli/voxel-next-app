import { encryptEmailAddress } from "./encrypt-email-address";
import executeRedisQuery from "./execute-redis-query";

export default async function isEmailAvailable(email: string): Promise<boolean> {
  const emailAvailable = await executeRedisQuery(db => db.sIsMember(`emails`, encryptEmailAddress(email)));
  return !emailAvailable;
}
