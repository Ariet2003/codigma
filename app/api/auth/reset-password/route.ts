import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, password } = body;

    if (!email || !code || !password) {
      return new NextResponse("Все поля обязательны", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new NextResponse("Пользователь не найден", { status: 404 });
    }

    // Проверяем код сброса пароля
    if (user.resetToken !== code) {
      return new NextResponse("Неверный код", { status: 400 });
    }

    // Проверяем срок действия кода
    if (!user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return new NextResponse("Срок действия кода истек", { status: 400 });
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Обновляем пароль и очищаем токены сброса
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      }
    });

    return new NextResponse("Пароль успешно изменен", { status: 200 });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
  }
} 