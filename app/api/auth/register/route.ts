import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Проверяем обязательные поля
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 10);

    // Генерируем код верификации (6 цифр)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Создаем пользователя
      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          verificationToken,
          verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 часа
        },
      });

      // Отправляем email с кодом верификации
      await sendVerificationEmail(email, verificationToken);

      return NextResponse.json(
        { 
          message: "Пользователь успешно создан. Проверьте email для подтверждения.",
          user: { id: user.id, email: user.email }
        },
        { status: 201 }
      );
    } catch (error) {
      // Если произошла ошибка после создания пользователя, удаляем его
      if (existingUser) {
        await db.user.delete({
          where: { email },
        });
      }
      console.error("Ошибка при регистрации:", error);
      throw error;
    }
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при регистрации" },
      { status: 500 }
    );
  }
} 