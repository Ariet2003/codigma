import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfMonth, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { verifyAdminToken } from "@/lib/auth-admin";

export async function GET() {
  try {
    const adminPayload = await verifyAdminToken();
    
    if (!adminPayload) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    // Получаем текущую дату
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const lastMonth = subMonths(now, 1);
    const startOfLastMonth = startOfMonth(lastMonth);

    // Получаем даты начала и конца текущей недели
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Получаем статистику по хакатонам
    const hackathons = await prisma.hackathon.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now }
      }
    });

    const totalHackathons = await prisma.hackathon.count();
    const activeHackathons = hackathons.length;

    // Получаем статистику по пользователям
    const totalUsers = await prisma.user.count({
      where: { role: "USER" }
    });

    // Получаем количество новых пользователей за последний месяц
    const newUsers = await prisma.user.count({
      where: {
        role: "USER",
        emailVerified: {
          gte: startOfLastMonth
        }
      }
    });

    // Получаем статистику по решениям задач
    const submissions = await prisma.taskSubmission.findMany({
      where: {
        createdAt: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    });

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === "ACCEPTED").length;
    const submissionRate = totalSubmissions > 0 
      ? (acceptedSubmissions / totalSubmissions * 100).toFixed(1)
      : 0;

    // Получаем статистику по росту пользователей за последние 6 месяцев
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const nextMonthStart = startOfMonth(subMonths(now, i - 1));
      
      const count = await prisma.user.count({
        where: {
          role: "USER",
          emailVerified: {
            gte: monthStart,
            lt: nextMonthStart
          }
        }
      });
      
      userGrowth.push({
        name: monthStart.toLocaleString('ru', { month: 'short' }),
        value: count
      });
    }

    // Получаем статистику активности по дням недели
    const weeklyActivity = [];
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(weekStart);
      dayStart.setDate(weekStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Получаем количество решений задач
      const submissionsCount = await prisma.taskSubmission.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      // Получаем количество новых заявок на участие
      const requestsCount = await prisma.participationRequest.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      // Получаем количество новых участников хакатонов
      const participantsCount = await prisma.hackathonParticipant.count({
        where: {
          joinedAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      // Получаем количество новых пользователей
      const newUsersCount = await prisma.user.count({
        where: {
          role: "USER",
          emailVerified: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });
      
      // Суммируем все активности
      const totalActivity = submissionsCount + requestsCount + participantsCount + newUsersCount;
      
      weeklyActivity.push({
        name: daysOfWeek[i],
        value: totalActivity,
        details: {
          submissions: submissionsCount,
          requests: requestsCount,
          participants: participantsCount,
          newUsers: newUsersCount
        }
      });
    }

    // Получаем статистику по статусам хакатонов
    const hackathonStatuses = [
      { name: 'Активные', value: activeHackathons },
      { name: 'Завершенные', value: await prisma.hackathon.count({
        where: {
          endDate: { lt: now }
        }
      })},
      { name: 'Предстоящие', value: await prisma.hackathon.count({
        where: {
          startDate: { gt: now }
        }
      })}
    ];

    // Получаем статистику по статусам заявок
    const requestStatuses = await prisma.participationRequest.groupBy({
      by: ['status'],
      _count: true,
    });

    const requestStatusMap: Record<string, string> = {
      PENDING: "На рассмотрении",
      APPROVED: "Одобрена",
      REJECTED: "Отклонена"
    };

    const formattedRequestStatuses = requestStatuses.map(status => ({
      name: requestStatusMap[status.status] || status.status,
      value: status._count,
    }));

    return NextResponse.json({
      stats: {
        activeHackathons,
        totalUsers,
        newUsers,
        submissionRate
      },
      userGrowth,
      weeklyActivity,
      hackathonStatuses,
      requestStatuses: formattedRequestStatuses,
    });
  } catch (error) {
    console.error("Ошибка при получении статистики:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 