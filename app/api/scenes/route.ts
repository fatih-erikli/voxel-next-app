import { kv } from "@vercel/kv";
import sha256 from "sha256";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import cleanVoxelContent from "@/utils/clean-voxel-content";

export async function POST(request: NextRequest): Promise<NextResponse<{ err?: string; createdSceneId?: string }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;
  const title = requestBody.title;

  if (!title || title.length < 5 || title.length > 40) {
    return NextResponse.json({ err: "Title should be min in 5 max 40 characters." }, { status: 400 });
  }

  const parsedContent = cleanVoxelContent(requestBody.voxels);
  if (!parsedContent.ok) {
    return NextResponse.json({ err: parsedContent.err }, { status: 400 });
  }

  const user = await kv.get(`session:${sha256(authToken)}`);
  if (!user) {
    return NextResponse.json({ err: "Authorization failed." }, { status: 400 });
  }

  const createdSceneId = crypto.randomBytes(24).toString("hex");
  await kv.hset(`scene:${createdSceneId}`, {
    user,
    voxels: JSON.stringify(parsedContent.voxels),
    title,
  });
  await kv.lpush(`user-scenes:${user}`, createdSceneId);
  return NextResponse.json({ createdSceneId }, { status: 201 });
}
