import dotenv from "dotenv";
import sha256 from "sha256";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

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
