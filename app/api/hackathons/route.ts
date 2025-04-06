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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "startDate";
    const order = searchParams.get("order") || "desc";
    const status = searchParams.get("status") || "all";
    const type = searchParams.get("type") || "all";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Базовые условия фильтрации
    let where: any = {};

    // Поиск по названию и описанию
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Фильтрация по типу
    if (type !== "all") {
      where.isOpen = type === "open";
    }

    // Фильтрация по статусу
    const now = new Date();
    if (status !== "all") {
      switch (status) {
        case "upcoming":
          where.startDate = { gt: now };
          break;
        case "active":
          where.AND = [
            { startDate: { lte: now } },
            { endDate: { gte: now } },
          ];
          break;
        case "completed":
          where.endDate = { lt: now };
          break;
      }
    }

    // Определяем поле для сортировки
    let orderBy: any = {};
    switch (sort) {
      case "title":
      case "startDate":
      case "endDate":
      case "createdAt":
        orderBy[sort] = order;
        break;
      case "participants":
        orderBy = {
          participants: {
            _count: order,
          },
        };
        break;
      default:
        orderBy.startDate = "desc";
    }

    // Получаем общее количество хакатонов
    const total = await prisma.hackathon.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Получаем хакатоны с учетом фильтрации, сортировки и пагинации
    const hackathons = await prisma.hackathon.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        participants: true,
        applications: true,
        submissions: true,
      },
    });

    return NextResponse.json({
      hackathons,
      totalPages,
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Ошибка при получении хакатонов:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при получении хакатонов" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const id = req.url.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { message: "ID хакатона не указан" },
        { status: 400 }
      );
    }

    // Удаляем все связанные данные
    await prisma.$transaction([
      // Удаляем решения задач
      prisma.taskSubmission.deleteMany({
        where: { hackathonId: id },
      }),
      // Удаляем заявки на участие
      prisma.participationRequest.deleteMany({
        where: { hackathonId: id },
      }),
      // Удаляем участников
      prisma.hackathonParticipant.deleteMany({
        where: { hackathonId: id },
      }),
      // Удаляем сам хакатон
      prisma.hackathon.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: "Хакатон успешно удален" });
  } catch (error) {
    console.error("Ошибка при удалении хакатона:", error);
    return NextResponse.json(
      { message: "Произошла ошибка при удалении хакатона" },
      { status: 500 }
    );
  }
} 