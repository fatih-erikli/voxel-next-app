import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import cleanVoxelContent from "@/utils/clean-voxel-content";
import executeRedisQuery from "@/utils/execute-redis-query";

export async function POST(request: NextRequest): Promise<NextResponse<{ err?: string; createdSceneId?: string }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;
  const title = requestBody.title;

  if (!title || title.length < 5 || title.length > 40) {
    const err = "Title should be min in 5 max 40 characters.";
    return NextResponse.json({ err }, { status: err ? 400 : 201 });
  }

  const parsedContent = cleanVoxelContent(requestBody.voxels);
  if (!parsedContent.ok) {
    return NextResponse.json({ err: parsedContent.err }, { status: 400 });
  }

  let createdSceneId;
  let err;

  await executeRedisQuery(async (redis) => {
    const user = await redis.get(`session:${authToken}`);

    if (!user) {
      err = "Authorization failed.";
      return;
    }

    createdSceneId = crypto.randomBytes(24).toString("hex");

    await redis.hSet(`scene:${createdSceneId}`, {
      user,
      voxels: JSON.stringify(parsedContent.voxels),
      title,
    });

    await redis.lPush(`user-scenes:${user}`, createdSceneId);
  });

  return NextResponse.json({ createdSceneId, err }, { status: err ? 400 : 201 });
}
