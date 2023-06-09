import { NextRequest, NextResponse } from "next/server";
import executeRedisQuery from "@/utils/execute-redis-query";

export async function POST(
  request: NextRequest,
  { params: { sceneId } }: { params: { sceneId: string } }
): Promise<NextResponse<{ isEditable: boolean }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;
  let err;
  let status;
  let isEditable = false;

  await executeRedisQuery(async (redis) => {
    const user = await redis.get(`session:${authToken}`);

    if (!user) {
      err = "Authentication failed.";
      status = 401;
      return;
    }

    const sceneExists = await redis.exists(`scene:${sceneId}`);
    if (!sceneExists) {
      err = "Scene not found."
      status = 404;
      return;
    }

    const scene = await redis.hGetAll(`scene:${sceneId}`);

    if (scene.user !== user) {
      err = "Authorization failed."
      status = 403;
      return;
    }

    status = 202;
    isEditable = true;
  });

  return NextResponse.json({ isEditable }, { status });
}
