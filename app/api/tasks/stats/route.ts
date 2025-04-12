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

    // Получаем количество решенных задач пользователем с учетом сложности
    const solvedStats = await prisma.$queryRaw`
      SELECT 
        t.difficulty,
        COUNT(DISTINCT t.id) as solved_count
      FROM "Task" t
      INNER JOIN "UserTaskSubmission" uts ON t.id = uts."taskId"
      WHERE uts."userId" = ${session.user.id}
      AND uts.status = 'ACCEPTED'
      GROUP BY t.difficulty
    `;

    // Получаем даты успешных решений за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const submissionDates = await prisma.$queryRaw`
      SELECT DISTINCT DATE(uts."createdAt") as submission_date
      FROM "UserTaskSubmission" uts
      WHERE uts."userId" = ${session.user.id}
      AND uts.status = 'ACCEPTED'
      AND uts."createdAt" >= ${thirtyDaysAgo}
      ORDER BY submission_date DESC
    `;

    // Преобразуем данные в нужный формат
    const stats = {
      total: 0,
      solved: 0,
      byDifficulty: {
        easy: { total: 0, solved: 0 },
        medium: { total: 0, solved: 0 },
        hard: { total: 0, solved: 0 }
      },
      submissionDates: (submissionDates as any[]).map(d => 
        d.submission_date.toISOString().split('T')[0]
      )
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

    // Заполняем количество решенных задач
    (solvedStats as any[]).forEach(stat => {
      const difficulty = stat.difficulty.toLowerCase();
      if (difficulty in stats.byDifficulty) {
        const solvedCount = Number(stat.solved_count);
        stats.byDifficulty[difficulty as keyof typeof stats.byDifficulty].solved = solvedCount;
        stats.solved += solvedCount;
      }
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[TASKS_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 