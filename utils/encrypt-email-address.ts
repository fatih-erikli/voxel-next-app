import crypto from "crypto";
export const encryptEmailAddress = (email: string) => {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.EMAIL_ENCRYPTION_SECRET_KEY!, 'hex'),
    Buffer.from(process.env.EMAIL_ENCRYPTION_INIT_VECTOR!, 'hex')
  );
  return cipher.update(email, "utf-8", "hex") + cipher.final("hex");
}
export const decryptEmailAddress = (email: string) => {
  const cipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.EMAIL_ENCRYPTION_SECRET_KEY!, 'hex'),
    Buffer.from(process.env.EMAIL_ENCRYPTION_INIT_VECTOR!, 'hex')
  );
  return cipher.update(email, "hex", "utf-8") + cipher.final("utf-8");
}
