import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function POST(req: Request) {
  try {
    // Проверяем токен админа
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token");

    if (!token) {
      return new NextResponse("Не авторизован", { status: 401 });
    }

    // Декодируем JWT токен
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token.value, secret);

    // Получаем данные из запроса
    const { email, password } = await req.json();

    if (!email || !password) {
      return new NextResponse("Email и пароль обязательны", { status: 400 });
    }

    // Проверяем, не занят ли email другим пользователем
    const existingUser = await db.user.findFirst({
      where: {
        email,
        id: { not: payload.userId as string }
      }
    });

    if (existingUser) {
      return new NextResponse("Email уже используется", { status: 400 });
    }

    // Хешируем новый пароль
    const hashedPassword = await hash(password, 12);

    // Обновляем данные администратора
    await db.user.update({
      where: {
        id: payload.userId as string,
        role: "ADMIN"
      },
      data: {
        email,
        password: hashedPassword
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("UPDATE_CREDENTIALS_ERROR:", error);
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
  }
} 