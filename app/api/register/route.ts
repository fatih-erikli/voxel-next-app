import sha256 from "sha256";
import crypto from "crypto";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
import executeRedisQuery from "@/utils/execute-redis-query";

import { z } from "zod";
import isUsernameAvailable from "@/utils/is-username-available";
import isEmailAvailable from "@/utils/is-email-available";

dotenv.config();

const schema = z.object({
  username: z
    .string()
    .min(5, { message: "Username must be min in 5 characters." })
    .max(20, { message: "Username must be max in 20 characters." })
    .regex(/^[a-z0-9_\.]+$/, { message: "Username must not contain special characters." })
    .refine(isUsernameAvailable, "Username has been taken."),
  email: z.string().toLowerCase().email().refine(isEmailAvailable, "There is an user registered with the email."),
  password: z.string().regex(/(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*/, {
    message: "Choose a stronger password.",
  }),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ ok: boolean; validationResult?: RegistrationFormValidation }>> {
  const requestBody = await request.json();
  const username = requestBody.username;

  const validation = await schema.safeParseAsync(requestBody);

  if (validation.success) {
    const salt = crypto.randomBytes(16).toString("hex");
    const pepper = process.env.USER_PASSWORD_PEPPER;
    const passwordHashed = sha256(salt + pepper + requestBody.password);
    await executeRedisQuery(async (redis) => {
      await redis.hSet(`user:${username}`, {
        username: validation.data.username,
        password: passwordHashed,
        email: validation.data.email,
        salt,
      });
      await redis.sAdd("emails", validation.data.email);
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } else {
    const getIssue = (key: string) => {
      for (const issue of validation.error.issues) {
        if (issue.path[0] === key) {
          return { ok: false, err: issue.message };
        }
      }
      return {
        ok: true,
      };
    };
    return NextResponse.json(
      {
        ok: false,
        validationResult: {
          username: getIssue("username"),
          email: getIssue("email"),
          password: getIssue("password"),
        },
      },
      { status: 400 }
    );
  }
}
