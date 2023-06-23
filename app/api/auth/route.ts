import dotenv from "dotenv";
import sha256 from "sha256";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";
import executeRedisQuery from "@/utils/execute-redis-query";

dotenv.config();

export async function POST(request: NextRequest): Promise<NextResponse<{ user?: User }>> {
  const requestBody = await request.json();
  const sessionKey = requestBody.authToken;
  const deleteSession = requestBody.deleteSession;

  let sessionDeleted;
  let user;

  if (deleteSession) {
    await executeRedisQuery((redis) => redis.del(`session:${sha256(sessionKey)}`));
    sessionDeleted = true;
  } else {
    const username = await executeRedisQuery((redis) => redis.get(`session:${sha256(sessionKey)}`));
    if (username) {
      user = { username };
    }
  }

  return NextResponse.json({ user }, { status: sessionDeleted ? 202 : user ? 202 : 401 });
}
