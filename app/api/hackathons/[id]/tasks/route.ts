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
    const sort = searchParams.get('sort') || 'title';
    const order = searchParams.get('order') || 'asc';
    const difficulty = searchParams.get('difficulty') || 'all';
    const search = searchParams.get('search') || '';

    // Получаем хакатон для проверки существования и получения списка задач
    const hackathon = await prisma.hackathon.findUnique({
      where: { id: params.id },
    });

    if (!hackathon) {
      return NextResponse.json(
        { error: 'Хакатон не найден' },
        { status: 404 }
      );
    }

    // Формируем условия фильтрации
    const where = {
      id: {
        in: hackathon.tasks as string[],
      },
      ...(difficulty !== 'all' && {
        difficulty: difficulty,
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Получаем общее количество задач
    const total = await prisma.task.count({ where });

    // Создаем подзапрос для подсчета решений для конкретного хакатона
    const taskSolutions = await prisma.taskSubmission.groupBy({
      by: ['taskId'],
      where: {
        taskId: {
          in: hackathon.tasks as string[],
        },
        hackathonId: params.id,
        status: 'ACCEPTED',
      },
      _count: {
        _all: true,
      },
    });

    // Создаем мапу для быстрого доступа к количеству решений
    const solutionsMap = new Map(
      taskSolutions.map(solution => [solution.taskId, solution._count._all])
    );

    // Получаем задачи с пагинацией
    const tasks = await prisma.task.findMany({
      where,
      orderBy: sort === 'solvedCount' 
        ? undefined // Будем сортировать после получения данных
        : { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Добавляем количество решений к каждой задаче
    let tasksWithSolvedCount = tasks.map(task => ({
      ...task,
      solvedCount: solutionsMap.get(task.id) || 0,
    }));

    // Сортируем по количеству решений, если выбрана такая сортировка
    if (sort === 'solvedCount') {
      tasksWithSolvedCount.sort((a, b) => {
        return order === 'asc' 
          ? a.solvedCount - b.solvedCount
          : b.solvedCount - a.solvedCount;
      });
    }

    return NextResponse.json({
      tasks: tasksWithSolvedCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching hackathon tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hackathon tasks' },
      { status: 500 }
    );
  }
} 