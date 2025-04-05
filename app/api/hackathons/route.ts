import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, description, startDate, endDate, isOpen, tasks } = data;

    // Валидация данных
    if (!title || !description || !startDate || !endDate || !Array.isArray(tasks)) {
      return NextResponse.json(
        { message: "Не все обязательные поля заполнены" },
        { status: 400 }
      );
    }

    // Создаем хакатон
    const hackathon = await prisma.hackathon.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isOpen: Boolean(isOpen),
        tasks: tasks // Передаем массив как есть
      },
    });

    return NextResponse.json(hackathon);
  } catch (error) {
    console.error("Ошибка при создании хакатона:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при создании хакатона" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const hackathons = await prisma.hackathon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(hackathons);
  } catch (error) {
    console.error("Ошибка при получении хакатонов:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при получении хакатонов" },
      { status: 500 }
    );
  }
} 