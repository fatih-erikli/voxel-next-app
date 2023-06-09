import dotenv from "dotenv";
import { createClient } from "redis";
dotenv.config();

type RedisClient = ReturnType<typeof createClient>

export default async function executeRedisQuery(callback: (redis: RedisClient) => any) {
  const client = createClient({ url: process.env.REDIS_URI });
  let result;
  try {
    await client.connect();
    result = await callback(client);
  } finally {
    await client.disconnect();
  }
  return result;
}
