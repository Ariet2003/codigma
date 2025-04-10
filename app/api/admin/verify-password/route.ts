import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
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
    const { password } = await req.json();

    if (!password) {
      return new NextResponse("Пароль обязателен", { status: 400 });
    }

    // Находим администратора
    const admin = await db.user.findFirst({
      where: {
        id: payload.userId as string,
        role: "ADMIN"
      }
    });

    if (!admin) {
      return new NextResponse("Администратор не найден", { status: 404 });
    }

    // Проверяем пароль
    const isPasswordValid = await compare(password, admin.password!);

    if (!isPasswordValid) {
      return new NextResponse("Неверный пароль", { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("VERIFY_PASSWORD_ERROR:", error);
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
  }
} 