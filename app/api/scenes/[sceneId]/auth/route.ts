import { kv } from "@vercel/kv";
import sha256 from "sha256";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params: { sceneId } }: { params: { sceneId: string } }
): Promise<NextResponse<{ isEditable: boolean; err?: string }>> {
  const requestBody = await request.json();
  const authToken = requestBody.authToken;
  const user = await kv.get(`session:${sha256(authToken)}`);

  if (!user) {
    return NextResponse.json({ isEditable: false, err: "Authentication failed." }, { status: 401 });
  }

  const sceneExists = await kv.exists(`scene:${sceneId}`);
  if (!sceneExists) {
    return NextResponse.json({ isEditable: false, err: "Scene not found." }, { status: 404 });
  }

  const scene = await kv.hgetall(`scene:${sceneId}`);

  if (scene!.user !== user) {
    return NextResponse.json({ isEditable: false, err: "Authorization failed." }, { status: 403 });
  }

  return NextResponse.json({ isEditable: true }, { status: 202 });
}
