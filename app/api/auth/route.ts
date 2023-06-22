import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";
import executeRedisQuery from "@/utils/execute-redis-query";

dotenv.config();

export async function POST(request: NextRequest): Promise<NextResponse<{ user: User | null }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;
  const deleteSession = requestBody.deleteSession;

  let sessionDeleted;
  let userLoggedIn;
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
        userLoggedIn = { username };
      }
    }
  }

  return NextResponse.json(
    {
      user: userLoggedIn ? userLoggedIn : null,
    },
    { status: sessionDeleted ? 202 : userLoggedIn ? 202 : 401 }
  );
}
