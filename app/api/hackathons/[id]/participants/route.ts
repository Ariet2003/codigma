import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort') || 'name';
    const order = (searchParams.get('order') || 'asc') as Prisma.SortOrder;
    const scoreFilter = searchParams.get('scoreFilter') || 'all';
    const search = searchParams.get('search') || '';

    // Формируем условия фильтрации
    const where: Prisma.HackathonParticipantWhereInput = {
      hackathonId: params.id,
      ...(search && {
        user: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    // Получаем общее количество участников
    const total = await prisma.hackathonParticipant.count({ where });

    // Формируем объект сортировки
    let orderBy: Prisma.HackathonParticipantOrderByWithRelationInput = {};
    if (sort === 'name') {
      orderBy = {
        user: {
          name: order,
        },
      };
    } else if (sort === 'joinedAt') {
      orderBy = { joinedAt: order };
    } else if (sort === 'totalScore') {
      orderBy = { totalScore: order };
    }

    // Получаем участников с пагинацией
    const participants = await prisma.hackathonParticipant.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Получаем статистику решений для каждого участника
    const participantsWithStats = await Promise.all(
      participants.map(async (participant) => {
        const submissions = await prisma.taskSubmission.groupBy({
          by: ['status'],
          where: {
            hackathonId: params.id,
            participantId: participant.id,
          },
          _count: {
            _all: true,
          },
        });

        const stats = {
          correctSolutions: 0,
          wrongSolutions: 0,
        };

        submissions.forEach((submission) => {
          if (submission.status === 'ACCEPTED') {
            stats.correctSolutions = submission._count._all;
          } else {
            stats.wrongSolutions += submission._count._all;
          }
        });

        return {
          ...participant,
          ...stats,
        };
      })
    );

    // Сортируем по количеству решений, если выбрана такая сортировка
    if (sort === 'correctSolutions' || sort === 'wrongSolutions') {
      participantsWithStats.sort((a, b) => {
        const aValue = a[sort];
        const bValue = b[sort];
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    // Фильтруем по уровню баллов
    let filteredParticipants = participantsWithStats;
    if (scoreFilter !== 'all') {
      const scoreRanges = {
        high: { min: 80, max: 100 },
        medium: { min: 50, max: 79 },
        low: { min: 0, max: 49 },
      };
      const range = scoreRanges[scoreFilter as keyof typeof scoreRanges];
      filteredParticipants = participantsWithStats.filter(
        (p) => p.totalScore >= range.min && p.totalScore <= range.max
      );
    }

    return NextResponse.json({
      participants: filteredParticipants,
      total: filteredParticipants.length,
      page,
      totalPages: Math.ceil(filteredParticipants.length / limit),
    });
  } catch (error) {
    console.error('Error fetching hackathon participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathon participants' },
      { status: 500 }
    );
  }
} 