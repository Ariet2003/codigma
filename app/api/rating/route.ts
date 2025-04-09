import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'totalScore';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 200;

    // Определяем поле для сортировки
    let orderBy: any = {};

    // Для полей, которые есть в базе данных
    if (['totalScore', 'tasksCompleted', 'hackathonsParticipated', 'name', 'email'].includes(sortBy)) {
      orderBy = {
        [sortBy]: order.toLowerCase()
      };
    } else {
      // По умолчанию сортируем по общему баллу
      orderBy = {
        totalScore: 'desc'
      };
    }

    // Получаем общее количество пользователей
    const totalUsers = await db.user.count();

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        totalScore: true,
        tasksCompleted: true,
        hackathonsParticipated: true,
        participations: {
          select: {
            submissions: {
              select: {
                id: true
              }
            }
          }
        }
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    // Подсчитываем общее количество отправок для каждого пользователя
    let usersWithSubmissions = users.map(user => {
      const totalSubmissions = user.participations.reduce(
        (acc, participation) => acc + participation.submissions.length,
        0
      );

      // Удаляем ненужные данные о participations из ответа
      const { participations, ...userData } = user;

      return {
        ...userData,
        totalSubmissions
      };
    });

    // Если сортировка по totalSubmissions, применяем её после подсчёта
    if (sortBy === 'totalSubmissions') {
      usersWithSubmissions = usersWithSubmissions.sort((a, b) => {
        return order.toLowerCase() === 'desc' 
          ? b.totalSubmissions - a.totalSubmissions
          : a.totalSubmissions - b.totalSubmissions;
      });
    }

    return NextResponse.json({
      users: usersWithSubmissions,
      pagination: {
        total: totalUsers,
        pageSize,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 