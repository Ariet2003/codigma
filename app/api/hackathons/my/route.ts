import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "startDate";
    const order = searchParams.get("order") || "asc";

    // Базовый запрос для получения хакатонов пользователя
    const baseQuery = {
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        },
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        }),
        ...(status === 'upcoming' && {
          startDate: { gt: new Date() }
        }),
        ...(status === 'ongoing' && {
          AND: [
            { startDate: { lte: new Date() } },
            { endDate: { gte: new Date() } }
          ]
        }),
        ...(status === 'completed' && {
          endDate: { lt: new Date() }
        })
      },
      include: {
        _count: {
          select: { participants: true }
        },
        participants: {
          where: { userId: session.user.id },
          select: { userId: true }
        }
      },
      orderBy: {
        [sortBy]: order,
      },
      skip: (page - 1) * limit,
      take: limit,
    };

    // Получаем хакатоны с пагинацией
    const [hackathons, total] = await prisma.$transaction([
      prisma.hackathon.findMany(baseQuery),
      prisma.hackathon.count({ where: baseQuery.where })
    ]);

    // Форматируем данные для фронтенда
    const formattedHackathons = hackathons.map(hackathon => ({
      id: hackathon.id,
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      isOpen: hackathon.isOpen,
      participantsCount: hackathon._count.participants,
      isParticipating: hackathon.participants.length > 0
    }));

    return NextResponse.json({
      hackathons: formattedHackathons,
      total,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("[HACKATHONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 