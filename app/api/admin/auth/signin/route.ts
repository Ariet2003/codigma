import { db } from "@/lib/db";
import { sendAdminVerificationEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("Все поля обязательны", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { 
        email,
        role: "ADMIN"
      }
    });

    if (!user) {
      return new NextResponse("Неверные учетные данные", { status: 401 });
    }

    const passwordsMatch = await bcrypt.compare(password, user.password!);

    if (!passwordsMatch) {
      return new NextResponse("Неверные учетные данные", { status: 401 });
    }

    // Генерируем код подтверждения
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationId = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

    // Сохраняем код подтверждения
    await db.verificationToken.create({
      data: {
        email,
        identifier: verificationId,
        token: verificationCode,
        expires,
      }
    });

    // Отправляем код на почту
    await sendAdminVerificationEmail(email, verificationCode);

    return NextResponse.json({ verificationId });
  } catch (error) {
    console.error("ADMIN_SIGNIN_ERROR", error);
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
  }
} 