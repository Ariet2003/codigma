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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "startDate";
    const order = searchParams.get("order") || "asc";
    
    const skip = (page - 1) * limit;

    // Базовые условия для where
    const where: any = {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    };

    // Добавляем условие для закрытых хакатонов
    where.OR = [
      { isOpen: true }, // Открытые хакатоны показываем всем
      {
        // Закрытые хакатоны показываем только участникам
        AND: [
          { isOpen: false },
          {
            participants: {
              some: {
                userId: session?.user?.id
              }
            }
          }
        ]
      }
    ];

    // Добавляем фильтрацию по статусу
    if (status) {
      const now = new Date();
      switch (status) {
        case "upcoming":
          where.startDate = { gt: now };
          break;
        case "ongoing":
          where.AND = [
            { startDate: { lte: now } },
            { endDate: { gte: now } }
          ];
          break;
        case "completed":
          where.endDate = { lt: now };
          break;
      }
    }

    // Получаем общее количество хакатонов
    const total = await prisma.hackathon.count({ where });
    
    // Получаем хакатоны с учетом пагинации и сортировки
    const hackathons = await prisma.hackathon.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: order,
      },
      include: {
        participants: {
          where: session?.user?.id ? { userId: session.user.id } : undefined,
          select: {
            id: true,
            totalScore: true,
            submissions: {
              select: {
                id: true,
                status: true,
                taskId: true,
              },
            },
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    // Форматируем данные для ответа
    const formattedHackathons = hackathons.map((hackathon) => {
      const isParticipating = hackathon.participants.length > 0;
      const participant = hackathon.participants[0];
      
      // Создаем Set для хранения уникальных решенных задач
      const uniqueSolvedTasks = new Set(
        participant?.submissions
          .filter(s => s.status === "ACCEPTED")
          .map(s => s.taskId)
      );

      return {
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        isOpen: hackathon.isOpen,
        isParticipating,
        participantsCount: hackathon._count.participants,
        solvedTasksCount: isParticipating ? uniqueSolvedTasks.size : 0,
        totalTasksCount: hackathon.tasks.length,
        totalScore: isParticipating ? participant.totalScore : 0,
      };
    });

    return NextResponse.json({
      hackathons: formattedHackathons,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[HACKATHONS]", error);
    return NextResponse.json(
      { error: "Произошла внутренняя ошибка сервера" },
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