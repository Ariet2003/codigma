import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface ActivityData {
  date: string;
  count: number;
}

// Вспомогательная функция для конвертации BigInt в Number
function convertBigIntToNumber(value: any): any {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (Array.isArray(value)) {
    return value.map(convertBigIntToNumber);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, convertBigIntToNumber(v)])
    );
  }
  return value;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Получаем год из query параметров
    const searchParams = new URL(req.url).searchParams;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        totalScore: true,
        tasksCompleted: true,
        hackathonsParticipated: true,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }),
        { status: 404 }
      );
    }

    // Получаем общее количество задач по сложности
    const totalTasksByDifficulty = await prisma.$queryRaw`
      SELECT 
        difficulty,
        COUNT(*)::integer as total_count
      FROM "Task"
      GROUP BY difficulty
    `;

    // Получаем количество уникально решенных задач по сложности
    const solvedTasksByDifficulty = await prisma.$queryRaw`
      SELECT 
        t.difficulty,
        COUNT(DISTINCT uts."taskId")::integer as solved_count
      FROM "Task" t
      LEFT JOIN (
        SELECT DISTINCT "taskId"
        FROM "UserTaskSubmission"
        WHERE "userId" = ${session.user.id}
        AND status = 'ACCEPTED'
      ) uts ON t.id = uts."taskId"
      GROUP BY t.difficulty
    `;

    // Получаем данные об активности за выбранный год
    const activityData = await prisma.$queryRaw`
      WITH RECURSIVE dates AS (
        SELECT date_trunc('day', ${startDate}::timestamp) as date
        UNION ALL
        SELECT date + interval '1 day'
        FROM dates
        WHERE date < ${endDate}::timestamp
      ),
      daily_submissions AS (
        SELECT 
          date_trunc('day', "createdAt") as submission_date,
          COUNT(*)::integer as submission_count
        FROM "UserTaskSubmission"
        WHERE 
          "userId" = ${session.user.id}
          AND "createdAt" BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
          AND status = 'ACCEPTED'
        GROUP BY date_trunc('day', "createdAt")
      )
      SELECT 
        to_char(d.date, 'YYYY-MM-DD') as date,
        COALESCE(ds.submission_count, 0)::integer as count
      FROM dates d
      LEFT JOIN daily_submissions ds ON d.date = ds.submission_date
      ORDER BY d.date
    `;

    // Получаем статистику активности
    const activityStats = await prisma.$queryRaw`
      WITH daily_activity AS (
        SELECT 
          date_trunc('day', "createdAt") as day,
          COUNT(DISTINCT date_trunc('day', "createdAt"))::integer as submissions
        FROM "UserTaskSubmission"
        WHERE 
          "userId" = ${session.user.id}
          AND status = 'ACCEPTED'
          AND "createdAt" BETWEEN ${startDate}::timestamp AND ${endDate}::timestamp
        GROUP BY date_trunc('day', "createdAt")
      ),
      streaks AS (
        SELECT 
          day,
          submissions,
          day - (ROW_NUMBER() OVER (ORDER BY day))::integer * interval '1 day' as grp
        FROM daily_activity
      )
      SELECT 
        COUNT(DISTINCT day)::integer as active_days,
        MAX(COUNT(*)) OVER ()::integer as max_streak
      FROM streaks
      GROUP BY grp
    `;

    // Получаем доступные годы активности
    const availableYears = await prisma.$queryRaw`
      SELECT DISTINCT 
        EXTRACT(YEAR FROM "createdAt")::integer as year
      FROM "UserTaskSubmission"
      WHERE "userId" = ${session.user.id}
      ORDER BY year DESC
    `;

    // Получаем общую статистику по сабмитам
    const submissionStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*)::integer as total_submissions,
        COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END)::integer as successful_submissions
      FROM "UserTaskSubmission"
      WHERE "userId" = ${session.user.id}
    `;

    // Получаем последние сабмиты
    const recentSubmissions = await prisma.userTaskSubmission.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        task: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Получаем позицию в рейтинге
    const userRank = await prisma.$queryRaw`
      SELECT position::integer 
      FROM (
        SELECT 
          id,
          ROW_NUMBER() OVER (ORDER BY "totalScore" DESC)::integer as position
        FROM "User"
      ) as rankings 
      WHERE id = ${session.user.id}
    `;

    // Формируем статистику по сложности
    const stats = {
      byDifficulty: {
        easy: { total: 0, solved: 0 },
        medium: { total: 0, solved: 0 },
        hard: { total: 0, solved: 0 }
      },
      total: 0,
      solved: 0
    };

    // Заполняем общее количество задач
    (totalTasksByDifficulty as any[]).forEach(stat => {
      const difficulty = stat.difficulty.toLowerCase();
      if (difficulty in stats.byDifficulty) {
        const totalCount = Number(stat.total_count);
        stats.byDifficulty[difficulty as keyof typeof stats.byDifficulty].total = totalCount;
        stats.total += totalCount;
      }
    });

    // Заполняем количество решенных задач
    (solvedTasksByDifficulty as any[]).forEach(stat => {
      const difficulty = stat.difficulty.toLowerCase();
      if (difficulty in stats.byDifficulty) {
        const solvedCount = Number(stat.solved_count || 0);
        stats.byDifficulty[difficulty as keyof typeof stats.byDifficulty].solved = solvedCount;
        stats.solved += solvedCount;
      }
    });

    // Форматируем данные для фронтенда
    const formattedStats = {
      ...stats,
      tasksCompleted: stats.solved,
      рейтинг: Number(user.totalScore),
      местоВРейтинге: Number((userRank as any[])[0]?.position || 0),
      успешныеОтправки: Number((submissionStats as any[])[0]?.successful_submissions || 0),
      всегоОтправок: Number((submissionStats as any[])[0]?.total_submissions || 0),
      процентУспеха: Math.round(
        (Number((submissionStats as any[])[0]?.successful_submissions || 0) /
          Number((submissionStats as any[])[0]?.total_submissions || 1)) * 100
      ),
      активныхДней: Number((activityStats as any[])[0]?.active_days || 0),
      максСерия: Number((activityStats as any[])[0]?.max_streak || 0),
      участиеВХакатонах: user.hackathonsParticipated,
      победыВХакатонах: 0, // TODO: Implement
      данныеАктивности: convertBigIntToNumber(activityData) as ActivityData[],
      доступныеГоды: (availableYears as any[]).map(y => Number(y.year)),
      выбранныйГод: year
    };

    const response = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        totalScore: Number(user.totalScore),
        tasksCompleted: user.tasksCompleted,
        hackathonsParticipated: user.hackathonsParticipated,
      },
      stats: formattedStats,
      submissions: recentSubmissions.map(sub => ({
        id: sub.id,
        date: sub.createdAt.toISOString().split('T')[0],
        taskId: sub.task.id,
        taskTitle: sub.task.title,
        type: sub.status === 'ACCEPTED' ? 'success' : 'error'
      })),
    };

    return NextResponse.json(convertBigIntToNumber(response));
  } catch (error) {
    console.error("[PROFILE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 