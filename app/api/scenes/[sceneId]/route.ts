import { kv } from "@vercel/kv";
import sha256 from "sha256";
import { NextRequest, NextResponse } from "next/server";
import cleanVoxelContent from "@/utils/clean-voxel-content";

export async function PUT(
  request: NextRequest,
  { params: { sceneId } }: { params: { sceneId: string } }
): Promise<NextResponse<{ ok: boolean; err?: string }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;

  const user = await kv.get(`session:${sha256(authToken)}`);

  if (!user) {
    return NextResponse.json({ ok: false, err: "Authentication failed." }, { status: 401 });
  }

  const sceneExists = await kv.exists(`scene:${sceneId}`);
  if (!sceneExists) {
    return NextResponse.json({ ok: false, err: "Scene not found." }, { status: 404 });
  }

  const scene = await kv.hgetall(`scene:${sceneId}`);

  if (scene!.user !== user) {
    return NextResponse.json({ ok: false, err: "Authorization failed." }, { status: 403 });
  }

  const title = requestBody.title;
  if (!title || title.length < 5 || title.length > 40) {
    return NextResponse.json({ ok: false, err: "Title should be min in 5 max 40 characters." }, { status: 400 });
  }

  const parsedContent = cleanVoxelContent(requestBody.voxels);
  if (!parsedContent.ok) {
    return NextResponse.json({ ok: false, err: parsedContent.err }, { status: 400 });
  }

  await kv.hset(`scene:${sceneId}`, {
    title,
    voxels: JSON.stringify(parsedContent.voxels),
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
