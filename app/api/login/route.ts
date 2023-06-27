import crypto from "crypto";
import sha256 from "sha256";
import dotenv from "dotenv";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";

dotenv.config();

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ authToken?: string; user?: User; sceneIds?: string[] }>> {
  const requestBody = await request.json();
  const username = requestBody.username;
  let authToken;
  let user;
  let sceneIds;
  const matchedUser = await kv.hgetall<Record<string, string>>(`user:${username}`);
  if (matchedUser) {
    const pepper = process.env.USER_PASSWORD_PEPPER;
    const passwordHashed = sha256(matchedUser.salt + pepper! + requestBody.password);
    if (matchedUser.password === passwordHashed) {
      const sessionKey = crypto.randomBytes(24).toString("hex");
      await kv.setex(`session:${sha256(sessionKey)}`, 60 * 30, matchedUser.username);
      sceneIds = await kv.lrange(`user-scenes:${matchedUser.username}`, 0, -1);
      authToken = sessionKey;
      user = { username: matchedUser.username };
    }
  }

  return NextResponse.json(
    {
      authToken,
      user,
      sceneIds,
    },
    { status: authToken ? 202 : 401 }
  );
}
