import { db } from "@/lib/db";
import crypto from "crypto";

export const generateVerificationToken = async (email: string) => {
  const token = crypto.randomInt(100000, 999999).toString();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 час

  const existingToken = await db.verificationToken.findFirst({
    where: { email }
  });

  if (existingToken) {
    await db.verificationToken.delete({
      where: { id: existingToken.id }
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return verificationToken;
}; 