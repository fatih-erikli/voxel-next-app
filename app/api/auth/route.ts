import dotenv from "dotenv";
import sha256 from "sha256";
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/Auth";

dotenv.config();

export async function POST(request: NextRequest): Promise<NextResponse<{ user?: User }>> {
  const requestBody = await request.json();
  const sessionKey = requestBody.authToken;
  const username = await kv.get<string>(`session:${sha256(sessionKey)}`);
  let user;
  if (username) {
    user = { username: username };
  }
  return NextResponse.json({ user }, { status: user ? 202 : 401 });
}
