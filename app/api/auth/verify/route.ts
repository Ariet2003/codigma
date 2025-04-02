import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return new NextResponse("Email и код обязательны", { status: 400 });
    }

    // Проверяем существование пользователя
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new NextResponse("Пользователь не найден", { status: 404 });
    }

    // Если email уже подтвержден
    if (user.emailVerified) {
      return new NextResponse("Email уже подтвержден", { status: 400 });
    }

    // Проверяем код верификации
    if (user.verificationToken !== code) {
      return new NextResponse("Неверный код подтверждения", { status: 400 });
    }

    // Проверяем срок действия кода
    if (!user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
      return new NextResponse("Срок действия кода истек", { status: 400 });
    }

    // Обновляем статус верификации пользователя
    await db.user.update({
      where: { id: user.id },
      data: { 
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null
      }
    });

    return new NextResponse("Email подтвержден", { status: 200 });
  } catch (error) {
    console.error("VERIFICATION_ERROR", error);
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
  }
} 