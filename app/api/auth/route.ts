import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";
import executeRedisQuery from "@/utils/execute-redis-query";

export async function POST(request: NextRequest): Promise<NextResponse<{ user?: User }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;
  const deleteSession = requestBody.deleteSession;
  let userLoggedIn;
  let sessionDeleted;
  if (deleteSession) {
    await executeRedisQuery((redis) => redis.del(`session:${authToken}`));
    sessionDeleted = true;
  } else {
    const username = await executeRedisQuery((redis) => redis.get(`session:${authToken}`));
    console.log(username)
    if (username) {
      userLoggedIn = { username };
    }
  }
  return NextResponse.json(
    {
      user: userLoggedIn,
    },
    { status: sessionDeleted ? 202 : userLoggedIn ? 202 : 401 }
  );
}
