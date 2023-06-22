import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";
import executeRedisQuery from "@/utils/execute-redis-query";

dotenv.config();

export async function POST(request: NextRequest): Promise<NextResponse<{ user?: User }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;
  const deleteSession = requestBody.deleteSession;

  let sessionDeleted;
  let user;
  let jwtVerification;

  try {
    jwtVerification = jwt.verify(authToken, process.env.JWT_SECRET_KEY!) as JwtPayload;
  } catch (e) {
    console.log("invalid token", e);
  }

  if (jwtVerification) {
    const sessionKey = jwtVerification.sessionKey;
    if (deleteSession) {
      await executeRedisQuery((redis) => redis.del(`session:${sessionKey}`));
      sessionDeleted = true;
    } else {
      const username = await executeRedisQuery((redis) => redis.get(`session:${sessionKey}`));
      if (username) {
        user = { username };
      }
    }
  }

  return NextResponse.json({ user }, { status: sessionDeleted ? 202 : user ? 202 : 401 });
}
