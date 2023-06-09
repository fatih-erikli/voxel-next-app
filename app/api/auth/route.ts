import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";
import executeRedisQuery from "@/utils/execute-redis-query";

export async function POST(request: NextRequest): Promise<NextResponse<{ user?: User }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;
  let userLoggedIn;
  await executeRedisQuery(async (redis) => {
    const session = await redis.hGetAll(`session:${authToken}`);
    if (session) {
      userLoggedIn = {
        username: session.user,
      }
    }
  })
  return NextResponse.json(
    {
      user: userLoggedIn,
    },
    { status: userLoggedIn ? 202 : 401 }
  );
}
