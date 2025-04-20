import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Получаем общее количество задач и их распределение по сложности
    const tasksStats = await prisma.$queryRaw`
      SELECT 
        difficulty,
        COUNT(*) as total_count
      FROM "Task"
      GROUP BY difficulty
    `;

    // Получаем количество решенных задач из таблицы User
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tasksCompleted: true }
    });

    // Получаем количество решенных задач по сложности
    const solvedByDifficulty = await prisma.$queryRaw`
      WITH UserSolvedTasks AS (
        SELECT DISTINCT "taskId"
        FROM "UserTaskSubmission"
        WHERE "userId" = ${session.user.id}
        AND status = 'ACCEPTED'
      )
      SELECT 
        t.difficulty,
        COUNT(DISTINCT ust."taskId") as solved_count,
        (
          SELECT COUNT(DISTINCT t2.id)
          FROM "Task" t2
          WHERE t2.difficulty = t.difficulty
        ) as total_count
      FROM "Task" t
      LEFT JOIN UserSolvedTasks ust ON t.id = ust."taskId"
      GROUP BY t.difficulty
    `;

    // Получаем статистику по дням за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Получаем все сабмиты за последние 30 дней с учетом уникальных решенных задач
    const submissions = await prisma.userTaskSubmission.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
        status: true,
        taskId: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Группируем сабмиты по дням в локальном времени
    const dailyStats = new Map();
    const solvedTasks = new Set(); // Для отслеживания уникально решенных задач
    
    submissions.forEach(submission => {
      const date = new Date(submission.createdAt);
      const localDate = date.toLocaleDateString('en-CA'); // формат YYYY-MM-DD
      
      if (!dailyStats.has(localDate)) {
        dailyStats.set(localDate, {
          correct: 0,
          incorrect: 0,
          total: 0,
          uniqueSolved: 0
        });
      }
      
      const stats = dailyStats.get(localDate);
      stats.total += 1;
      
      if (submission.status === 'ACCEPTED') {
        stats.correct += 1;
        if (!solvedTasks.has(submission.taskId)) {
          solvedTasks.add(submission.taskId);
          stats.uniqueSolved += 1;
        }
      } else {
        stats.incorrect += 1;
      }
    });

    // Преобразуем данные в нужный формат
    const stats = {
      total: 0,
      tasksCompleted: solvedTasks.size, // Используем реальное количество решенных задач
      byDifficulty: {
        easy: { total: 0, solved: 0 },
        medium: { total: 0, solved: 0 },
        hard: { total: 0, solved: 0 }
      },
      submissionDates: Array.from(dailyStats.keys()),
      dailyStats: Array.from(dailyStats.entries()).map(([date, data]) => ({
        date,
        correct: data.correct,
        incorrect: data.incorrect,
        total: data.total,
        uniqueSolved: data.uniqueSolved
      }))
    };

    // Заполняем статистику по сложности
    (solvedByDifficulty as any[]).forEach(stat => {
      const difficulty = stat.difficulty.toLowerCase();
      if (difficulty in stats.byDifficulty) {
        const solvedCount = Number(stat.solved_count);
        const totalCount = Number(stat.total_count);
        stats.byDifficulty[difficulty as keyof typeof stats.byDifficulty] = {
          total: totalCount,
          solved: solvedCount
        };
        stats.total += totalCount;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[TASKS_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 