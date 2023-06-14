import executeRedisQuery from "./execute-redis-query";
import isUsernameValid from "./is-username-valid";

export default async function isUsernameAvailable(username: string): Promise<boolean> {
  return isUsernameValid(username) && !(await executeRedisQuery(db => db.exists(`user:${username}`)));
}
