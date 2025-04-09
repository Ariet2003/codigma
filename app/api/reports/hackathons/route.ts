import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 10;

    // Получаем общее количество хакатонов
    const totalHackathons = await db.hackathon.count();

    // Получаем статистику по типам хакатонов (открытые/закрытые)
    const hackathonTypes = await db.hackathon.groupBy({
      by: ['isOpen'],
      _count: true,
    });

    // Получаем статистику по статусам хакатонов (предстоящие/текущие/завершенные)
    const now = new Date();
    const statusCounts = {
      upcoming: await db.hackathon.count({
        where: { startDate: { gt: now } },
      }),
      active: await db.hackathon.count({
        where: {
          AND: [
            { startDate: { lte: now } },
            { endDate: { gt: now } },
          ],
        },
      }),
      completed: await db.hackathon.count({
        where: { endDate: { lte: now } },
      }),
    };

    // Получаем список хакатонов с пагинацией и всей необходимой информацией
    const hackathons = await db.hackathon.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        participants: {
          select: {
            totalScore: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Форматируем данные для ответа
    const formattedHackathons = hackathons.map(hackathon => {
      const totalParticipantScore = hackathon.participants.reduce(
        (sum, participant) => sum + participant.totalScore,
        0
      );
      const averageScore = hackathon.participants.length > 0
        ? totalParticipantScore / hackathon.participants.length
        : 0;

      return {
        id: hackathon.id,
        title: hackathon.title,
        isOpen: hackathon.isOpen,
        startDate: hackathon.startDate,
        endDate: hackathon.endDate,
        participantsCount: hackathon._count.participants,
        totalScore: totalParticipantScore,
        averageScore: Math.round(averageScore * 10) / 10,
        status: now < hackathon.startDate
          ? 'upcoming'
          : now > hackathon.endDate
            ? 'completed'
            : 'active',
      };
    });

    return NextResponse.json({
      totalHackathons,
      types: {
        open: hackathonTypes.find(t => t.isOpen)?._count || 0,
        closed: hackathonTypes.find(t => !t.isOpen)?._count || 0,
      },
      status: statusCounts,
      hackathons: formattedHackathons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalHackathons / pageSize),
        pageSize,
      },
    });
  } catch (error) {
    console.error('Error generating hackathon report:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 