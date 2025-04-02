import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return new NextResponse("Email обязателен", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new NextResponse("Пользователь не найден", { status: 404 });
    }

    if (user.emailVerified) {
      return new NextResponse("Email уже подтвержден", { status: 400 });
    }

    // Генерируем новый код верификации
    const verificationToken = crypto.randomInt(100000, 999999).toString();
    const verificationTokenExpires = new Date(Date.now() + 3600000); // +1 час

    // Обновляем код верификации пользователя
    await db.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpires,
      }
    });

    // Отправляем новый код на email
    await sendVerificationEmail(email, verificationToken);

    return new NextResponse("Код отправлен", { status: 200 });
  } catch (error) {
    console.error("RESEND_ERROR", error);
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
  }
} 