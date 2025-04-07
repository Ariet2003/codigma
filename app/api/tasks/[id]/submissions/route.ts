import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const hackathonId = searchParams.get('hackathonId');

    if (!hackathonId) {
      return NextResponse.json(
        { error: 'Hackathon ID is required' },
        { status: 400 }
      );
    }

    // Получаем статистику решений для задачи в конкретном хакатоне
    const submissions = await prisma.taskSubmission.groupBy({
      by: ['status'],
      where: {
        taskId: params.id,
        hackathonId: hackathonId
      },
      _count: {
        _all: true,
      },
    });

    // Получаем среднее время и память для решений в хакатоне
    const avgStats = await prisma.taskSubmission.aggregate({
      where: {
        taskId: params.id,
        hackathonId: hackathonId
      },
      _avg: {
        executionTime: true,
        memory: true,
      },
      _count: {
        _all: true,
      },
    });

    const stats = {
      correctSolutions: 0,
      wrongSolutions: 0,
      totalSubmissions: avgStats._count._all || 0,
      avgExecutionTime: Math.round(avgStats._avg.executionTime || 0),
      avgMemory: Math.round(avgStats._avg.memory || 0),
    };

    submissions.forEach((submission) => {
      if (submission.status === 'ACCEPTED') {
        stats.correctSolutions = submission._count._all;
      } else {
        stats.wrongSolutions += submission._count._all;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching task submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task submissions' },
      { status: 500 }
    );
  }
} 