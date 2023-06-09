import { NextRequest, NextResponse } from "next/server";
import createConfiguredMongoClient from "@/utils/create-configured-mongo-client";
import executeRedisQuery from "@/utils/execute-redis-query";
import cleanVoxelContent from "@/utils/clean-voxel-content";

export async function PUT(
  request: NextRequest,
  { params: { sceneId } }: { params: { sceneId: string } }
): Promise<NextResponse<{ err?: string }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;

  let err;
  let status;

  await executeRedisQuery(async (redis) => {
    const user = await redis.get(`session:${authToken}`);

    if (!user) {
      err = "Authentication failed.";
      status = 401;
      return;
    }

    const sceneExists = await redis.exists(`scene:${sceneId}`);
    if (!sceneExists) {
      err = "Scene not found.";
      status = 404;
      return;
    }

    const scene = await redis.hGetAll(`scene:${sceneId}`);

    if (scene.user !== user) {
      err = "Authorization failed.";
      status = 403;
      return;
    }

    const title = requestBody.title;
    if (!title || title.length < 5 || title.length > 40) {
      err = "Title should be min in 5 max 40 characters.";
      status = 400;
      return;
    }

    const parsedContent = cleanVoxelContent(requestBody.voxels);
    if (!parsedContent.ok) {
      err = parsedContent.err;
      status = 400;
      return;
    }

    await redis.hSet(`scene:${sceneId}`, {
      title,
      voxels: JSON.stringify(parsedContent.voxels),
    });

    status = 202;
  });

  return NextResponse.json({ err }, { status });
}
