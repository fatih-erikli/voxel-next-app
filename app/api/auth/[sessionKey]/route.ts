import dotenv from "dotenv";
import sha256 from "sha256";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";

dotenv.config();

export async function DELETE(
  request: NextRequest,
  { params: { sessionKey } }: { params: { sessionKey: string } }
): Promise<NextResponse> {
  let ok;
  const sessionKeyHashed = `session:${sha256(sessionKey)}`;
  if (await kv.exists(sessionKeyHashed)) {
    await kv.del(sessionKeyHashed);
    ok = true;
  } else {
    ok = false;
  }
  if (ok) {
    return new NextResponse(null, { status: 204 });
  } else {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
}

export async function GET(
  request: NextRequest,
  { params: { sessionKey } }: { params: { sessionKey: string } }
): Promise<NextResponse<{ user?: User; sceneIds?: string[] }>> {
  const username = await kv.get<string>(`session:${sha256(sessionKey)}`);
  let user;
  let sceneIds;
  if (username) {
    sceneIds = await kv.lrange(`user-scenes:${username}`, 0, -1);
    user = { username: username };
  }
  return NextResponse.json({ user, sceneIds }, { status: user ? 202 : 401 });
}
