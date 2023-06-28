import sha256 from "sha256";
import crypto from "crypto";
import dotenv from "dotenv";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import isUsernameAvailable from "@/utils/is-username-available";
import isEmailAvailable from "@/utils/is-email-available";
import { encryptEmailAddress } from "@/utils/encrypt-email-address";

dotenv.config();

const schema = z
  .object({
    username: z
      .string()
      .min(5, { message: "Username must be min in 5 characters." })
      .max(20, { message: "Username must be max in 20 characters." })
      .regex(/^[a-z0-9_\.]+$/, { message: "Only lowercase letters, numbers, and underscore is allowed." })
      .refine(isUsernameAvailable, "Username has been taken."),
    email: z.string().toLowerCase().email().refine(isEmailAvailable, "There is an user registered with the email."),
    password: z.string().regex(/(?=^.{6,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*/, {
      message: "Choose a stronger password.",
    }),
    passwordConfirmation: z.string(),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: "Passwords don't match.",
    path: ["passwordConfirmation"],
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
    const emailEncrypted = encryptEmailAddress(validation.data.email);
    await kv.hset(`user:${username}`, {
      username: validation.data.username,
      password: passwordHashed,
      email: emailEncrypted,
      salt,
    });
    await kv.sadd("emails", emailEncrypted);
    return NextResponse.json({ ok: true }, { status: 201 });
  } else {
    const validationResult: RegistrationFormValidation = {};
    for (const issue of validation.error.issues) {
      validationResult[issue.path[0] as keyof RegistrationFormState] = { ok: false, err: issue.message };
    }
    return NextResponse.json(
      {
        ok: false,
        validationResult,
      },
      { status: 400 }
    );
  }
}
