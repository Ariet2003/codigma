import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Получаем общее количество пользователей
    const totalUsers = await db.user.count();

    // Получаем топ-10 пользователей по рейтингу
    const topUsers = await db.user.findMany({
      select: {
        name: true,
        email: true,
        totalScore: true,
        tasksCompleted: true,
        hackathonsParticipated: true,
      },
      orderBy: {
        totalScore: 'desc',
      },
      take: 10,
    });

    // Получаем статистику по решенным задачам
    const taskStats = await db.user.aggregate({
      _sum: {
        tasksCompleted: true,
      },
      _avg: {
        tasksCompleted: true,
      },
      _max: {
        tasksCompleted: true,
      },
    });

    // Получаем статистику по участию в хакатонах
    const hackathonStats = await db.user.aggregate({
      _sum: {
        hackathonsParticipated: true,
      },
      _avg: {
        hackathonsParticipated: true,
      },
      _max: {
        hackathonsParticipated: true,
      },
    });

    // Получаем распределение пользователей по количеству решенных задач
    const taskDistribution = await db.user.groupBy({
      by: ['tasksCompleted'],
      _count: true,
      orderBy: {
        tasksCompleted: 'asc',
      },
    });

    // Получаем распределение пользователей по количеству хакатонов
    const hackathonDistribution = await db.user.groupBy({
      by: ['hackathonsParticipated'],
      _count: true,
      orderBy: {
        hackathonsParticipated: 'asc',
      },
    });

    return NextResponse.json({
      totalUsers,
      topUsers: topUsers.map(user => ({
        ...user,
        displayName: user.name || user.email || 'Аноним',
      })),
      taskStats: {
        total: taskStats._sum.tasksCompleted || 0,
        average: Math.round((taskStats._avg.tasksCompleted || 0) * 10) / 10,
        max: taskStats._max.tasksCompleted || 0,
      },
      hackathonStats: {
        total: hackathonStats._sum.hackathonsParticipated || 0,
        average: Math.round((hackathonStats._avg.hackathonsParticipated || 0) * 10) / 10,
        max: hackathonStats._max.hackathonsParticipated || 0,
      },
      taskDistribution: taskDistribution.map(item => ({
        value: item.tasksCompleted,
        count: item._count,
      })),
      hackathonDistribution: hackathonDistribution.map(item => ({
        value: item.hackathonsParticipated,
        count: item._count,
      })),
    });
  } catch (error) {
    console.error('Error generating user report:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 