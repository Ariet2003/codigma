import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { randomBytes } from "crypto";
import { send2FACode } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Генерация случайного 6-значного кода
    const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
    const twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 минут

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: twoFactorCode,
        twoFactorEnabled: true,
      },
    });

    // Отправка кода на email
    await send2FACode(user.email, twoFactorCode);

    return NextResponse.json({
      message: "Код двухфакторной аутентификации отправлен на email",
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { error: "Ошибка при настройке 2FA" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { code } = await req.json();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Пользователь не найден или 2FA не настроена" },
        { status: 404 }
      );
    }

    if (code !== user.twoFactorSecret) {
      return NextResponse.json(
        { error: "Неверный код" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: null,
      },
    });

    return NextResponse.json({
      message: "Двухфакторная аутентификация успешно включена",
    });
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { error: "Ошибка при верификации 2FA" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return NextResponse.json({
      message: "Двухфакторная аутентификация отключена",
    });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { error: "Ошибка при отключении 2FA" },
      { status: 500 }
    );
  }
} 