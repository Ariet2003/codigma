import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email и код подтверждения обязательны" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Пользователь не найден" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email уже подтвержден" },
        { status: 400 }
      );
    }

    if (!user.verificationToken || !user.verificationTokenExpires) {
      return NextResponse.json(
        { message: "Код подтверждения недействителен" },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpires < new Date()) {
      return NextResponse.json(
        { message: "Срок действия кода истек" },
        { status: 400 }
      );
    }

    if (user.verificationToken !== code) {
      return NextResponse.json(
        { message: "Неверный код подтверждения" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return NextResponse.json({ message: "Email успешно подтвержден" });
  } catch (error) {
    console.error("Ошибка при верификации:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при верификации" },
      { status: 500 }
    );
  }
} 