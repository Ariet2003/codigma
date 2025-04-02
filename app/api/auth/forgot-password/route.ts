import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
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

    // Генерируем код сброса пароля
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const resetTokenExpires = new Date(Date.now() + 3600000); // +1 час

    // Обновляем пользователя с новым кодом сброса
    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      }
    });

    // Отправляем код на email
    await sendPasswordResetEmail(email, resetToken);

    return new NextResponse("Код отправлен", { status: 200 });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
  }
} 