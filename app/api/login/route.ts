import crypto from "crypto";
import sha256 from "sha256";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";
import executeRedisQuery from "@/utils/execute-redis-query";

dotenv.config();

export async function POST(request: NextRequest): Promise<NextResponse<{ authToken?: string; user?: User }>> {
  const requestBody = await request.json();
  const username = requestBody.username;
  let authToken;
  let user;
  await executeRedisQuery(async (redis) => {
    const matchedUser = await redis.hGetAll(`user:${username}`);
    const pepper = process.env.USER_PASSWORD_PEPPER;
    const passwordHashed = sha256(matchedUser.salt + pepper + requestBody.password);
    if (matchedUser) {
      if (matchedUser.password === passwordHashed) {
        const sessionKey = crypto.randomBytes(24).toString("hex");
        await redis.setEx(`session:${sha256(sessionKey)}`, 60 * 30, matchedUser.username);
        authToken = sessionKey;
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
