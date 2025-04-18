import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Функция для сериализации хакатона
const serializeHackathon = (hackathon: any) => ({
  ...hackathon,
  id: String(hackathon.id),
  participants: hackathon.participants?.map((p: any) => ({
    ...p,
    id: String(p.id),
    userId: String(p.userId),
    hackathonId: String(p.hackathonId)
  })) || [],
  applications: hackathon.applications?.map((a: any) => ({
    ...a,
    id: String(a.id),
    userId: String(a.userId),
    hackathonId: String(a.hackathonId)
  })) || [],
  submissions: hackathon.submissions?.map((s: any) => ({
    ...s,
    id: String(s.id),
    participantId: String(s.participantId),
    taskId: String(s.taskId),
    hackathonId: String(s.hackathonId),
    memory: s.memory ? Number(s.memory) : null,
    executionTime: s.executionTime ? Number(s.executionTime) : null
  })) || []
});

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
        tasks: tasks
      },
      include: {
        participants: true,
        applications: true,
        submissions: true,
      }
    });

    return NextResponse.json(serializeHackathon(hackathon));
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "startDate";
    const order = searchParams.get("order") || "asc";
    const status = searchParams.get("status") || "all";

    const now = new Date();
    const skip = (page - 1) * limit;

    // Базовые условия для WHERE
    let where: any = {
      isOpen: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Фильтрация по статусу
    if (status === 'upcoming') {
          where.startDate = { gt: now };
    } else if (status === 'ongoing') {
          where.AND = [
            { startDate: { lte: now } },
        { endDate: { gt: now } }
          ];
    } else if (status === 'completed') {
          where.endDate = { lt: now };
    }

    // Настройка сортировки
    let orderBy: any = {};
    if (sortBy === 'participantsCount') {
        orderBy = {
          participants: {
          _count: order
        }
        };
    } else {
      orderBy = {
        [sortBy]: order
      };
    }

    // Получаем хакатоны с информацией об участии пользователя
    const hackathons = await prisma.hackathon.findMany({
      where,
      take: limit,
      skip,
      orderBy,
      include: {
        participants: {
          where: {
            userId: session.user.id
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    // Получаем общее количество хакатонов для пагинации
    const total = await prisma.hackathon.count({ where });

    // Форматируем данные для фронтенда
    const formattedHackathons = hackathons.map(hackathon => ({
      ...hackathon,
      isParticipating: hackathon.participants.length > 0,
      participantsCount: hackathon._count.participants,
      participants: undefined,
      _count: undefined
    }));

    return NextResponse.json({
      hackathons: formattedHackathons,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("[HACKATHONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
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