import executeRedisQuery from "./execute-redis-query";

export default async function isUsernameAvailable(username: string): Promise<boolean> {
  const userExists = await executeRedisQuery(db => db.exists(`user:${username}`));
  return !userExists;
}
