import dotenv from "dotenv";
import { Db } from "mongodb";
import createConfiguredMongoClient from "./create-configured-mongo-client";

dotenv.config();

export async function executeMongodbQuery<T>(callback: (db: Db) => Promise<any>): Promise<T> {
  const client = createConfiguredMongoClient();
  let result: any;
  try {
    await client.connect();
    const db = await client.db(process.env.MONGODB_DB_NAME);
    result = await callback(db);
  } finally {
    await client.close();
  }
  return result;
}
