import { NextRequest, NextResponse } from "next/server";
import { getQueryParameter } from "@/utils/get-query-parameter";
import isUsernameAvailable from "@/utils/is-username-available";
import isUsernameValid from "@/utils/is-username-valid";

export async function GET(request: NextRequest) {
  const username = getQueryParameter(request.url!, "username");
  let response;
  if (username && isUsernameValid(username)) {
    response = {
      ok: await isUsernameAvailable(username),
    };
  } else {
    response = {
      ok: false,
    };
  }
  return NextResponse.json(response, { status: response.ok ? 200 : 400 });
}
