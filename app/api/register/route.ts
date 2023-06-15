import sha256 from "sha256";
import crypto from "crypto";
import isUsernameAvailable from "@/utils/is-username-available";
import isUsernameValid from "@/utils/is-username-valid";
import { NextRequest, NextResponse } from "next/server";
import executeRedisQuery from "@/utils/execute-redis-query";

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ ok: boolean; validationResult?: RegistrationFormValidation }>> {
  const requestBody = await request.json();
  const username = requestBody.username;
  let usernameValidity;
  if (isUsernameValid(username)) {
    const usernameAvailable = await isUsernameAvailable(username);
    if (usernameAvailable) {
      usernameValidity = {
        ok: true,
      };
    } else {
      usernameValidity = {
        ok: false,
        err: "Username is taken.",
      };
    }
  } else {
    usernameValidity = {
      ok: false,
      err: "Username is not valid.",
    };
  }

  let passwordValidity;
  if (requestBody.password) {
    passwordValidity = {
      ok: true,
    };
  } else {
    passwordValidity = {
      ok: false,
      err: "A password required.",
    };
  }

  const isOk = usernameValidity.ok && passwordValidity.ok;

  if (isOk) {
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHashed = sha256(salt + requestBody.password);
    await executeRedisQuery(async (redis) => {
      await redis.hSet(`user:${username}`, {
        username: requestBody.username,
        password: passwordHashed,
        salt,
      });
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } else {
    return NextResponse.json(
      {
        ok: false,
        validationResult: {
          username: usernameValidity,
          password: passwordValidity,
        },
      },
      { status: 400 }
    );
  }
}
