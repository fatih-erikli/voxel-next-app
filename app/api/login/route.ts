import crypto from "crypto";
import sha256 from "sha256";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";
import executeRedisQuery from "@/utils/execute-redis-query";

export async function POST(request: NextRequest): Promise<NextResponse<{ authToken?: string; user?: User }>> {
  const requestBody = await request.json();
  const username = requestBody.username;
  let authToken;
  let user;
  await executeRedisQuery(async (redis) => {
    const matchedUser = await redis.hGetAll(`user:${username}`);
    const passwordHashed = sha256(matchedUser.salt + requestBody.password);
    if (matchedUser) {
      if (matchedUser.password === passwordHashed) {
        authToken = crypto.randomBytes(24).toString("hex");
        await redis.setEx(`session:${authToken}`, 60 * 60 * 30, matchedUser.username);
        user = { username: matchedUser.username }; // user model has only a username publicly available for now
      }
    }
  });
  return NextResponse.json(
    {
      authToken,
      user,
    },
    { status: authToken ? 202 : 401 }
  );
}
