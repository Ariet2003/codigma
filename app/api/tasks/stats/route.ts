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
      SELECT 
        t.difficulty,
        COUNT(DISTINCT t.id) as solved_count
      FROM "Task" t
      INNER JOIN (
        SELECT DISTINCT "taskId"
        FROM "UserTaskSubmission"
        WHERE "userId" = ${session.user.id}
        AND status = 'ACCEPTED'
      ) solved_tasks ON t.id = solved_tasks."taskId"
      GROUP BY t.difficulty
    `;

    // Получаем статистику по дням за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Получаем все сабмиты за последние 30 дней
    const submissions = await prisma.userTaskSubmission.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    });

    // Группируем сабмиты по дням в локальном времени
    const dailyStats = new Map();
    
    submissions.forEach(submission => {
      const date = new Date(submission.createdAt);
      const localDate = date.toLocaleDateString('en-CA'); // формат YYYY-MM-DD
      
      if (!dailyStats.has(localDate)) {
        dailyStats.set(localDate, {
          correct: 0,
          incorrect: 0,
          total: 0
        });
      }
      
      const stats = dailyStats.get(localDate);
      stats.total += 1;
      if (submission.status === 'ACCEPTED') {
        stats.correct += 1;
      } else {
        stats.incorrect += 1;
      }
    });

    // Преобразуем данные в нужный формат
    const stats = {
      total: 0,
      tasksCompleted: user?.tasksCompleted || 0,
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
        total: data.total
      }))
    };

    // Заполняем общее количество задач по сложности
    (tasksStats as any[]).forEach(stat => {
      const difficulty = stat.difficulty.toLowerCase();
      if (difficulty in stats.byDifficulty) {
        const totalCount = Number(stat.total_count);
        stats.byDifficulty[difficulty as keyof typeof stats.byDifficulty].total = totalCount;
        stats.total += totalCount;
      }
    });

    // Заполняем количество решенных задач по сложности
    (solvedByDifficulty as any[]).forEach(stat => {
      const difficulty = stat.difficulty.toLowerCase();
      if (difficulty in stats.byDifficulty) {
        const solvedCount = Number(stat.solved_count);
        stats.byDifficulty[difficulty as keyof typeof stats.byDifficulty].solved = solvedCount;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[TASKS_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 