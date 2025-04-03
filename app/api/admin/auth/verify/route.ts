import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { verificationId, code } = body;

    if (!verificationId || !code) {
      return new NextResponse("Все поля обязательны", { status: 400 });
    }

    // Проверяем код подтверждения
    const verificationToken = await db.verificationToken.findUnique({
      where: {
        identifier: verificationId,
        token: code,
        expires: {
          gt: new Date()
        }
      }
    });

    if (!verificationToken) {
      return new NextResponse("Неверный или просроченный код", { status: 400 });
    }

    // Проверяем, что пользователь является админом
    const user = await db.user.findUnique({
      where: {
        email: verificationToken.email,
        role: "ADMIN"
      }
    });

    if (!user) {
      return new NextResponse("Доступ запрещен", { status: 403 });
    }

    // Удаляем использованный код
    await db.verificationToken.delete({
      where: {
        id: verificationToken.id
      }
    });

    // Создаем JWT токен
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ 
      userId: user.id,
      email: user.email,
      role: "ADMIN"
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Устанавливаем куки после успешной верификации
    const cookieStore = cookies();
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Куки будет действительна 7 дней
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_VERIFY_ERROR", error);
    return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
  }
} 