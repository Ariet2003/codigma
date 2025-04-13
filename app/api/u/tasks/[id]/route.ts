import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        testCases: {
          select: {
            id: true,
            input: true,
            expectedOutput: true,
          }
        },
        codeTemplates: {
          select: {
            id: true,
            language: true,
            baseTemplate: true,
            fullTemplate: true,
          },
        },
      },
    });

    if (!task) {
      return new NextResponse('Task not found', { status: 404 });
    }

    // Получаем статистику решений
    const [totalSubmissions, uniqueAcceptedUsers, bestMemoryResult] = await Promise.all([
      // Общее количество попыток
      prisma.userTaskSubmission.count({
        where: {
          taskId: params.id
        }
      }),
      // Количество уникальных пользователей с успешными решениями
      prisma.userTaskSubmission.findMany({
        where: {
          taskId: params.id,
          status: "ACCEPTED"
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      }),
      // Минимальное значение памяти среди успешных решений
      prisma.$queryRaw<[{ memory: bigint | null }]>`
        SELECT MIN(memory) as memory
        FROM "UserTaskSubmission"
        WHERE "taskId" = ${params.id}
          AND status = 'ACCEPTED'
          AND memory > 0
      `
    ]);

    // Получаем лучшее время выполнения
    const bestTimeResult = await prisma.userTaskSubmission.findFirst({
      where: {
        taskId: params.id,
        status: "ACCEPTED",
        executionTime: {
          gt: 0
        }
      },
      orderBy: {
        executionTime: 'asc'
      },
      select: {
        executionTime: true
      }
    });

    // Получаем статистику по языкам
    const languageStats = await prisma.$queryRaw<Array<{
      language: string;
      totalAttempts: bigint;
      successfulAttempts: bigint;
      successRate: number;
    }>>`
      WITH LanguageAttempts AS (
        SELECT 
          language,
          COUNT(*) as totalAttempts,
          SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as successfulAttempts
        FROM "UserTaskSubmission"
        WHERE "taskId" = ${params.id}
        GROUP BY language
      )
      SELECT 
        language,
        totalAttempts,
        successfulAttempts,
        CAST(CAST(successfulAttempts AS FLOAT) / NULLIF(totalAttempts, 0) * 100 AS DECIMAL(5,2)) as successRate
      FROM LanguageAttempts
      ORDER BY successfulAttempts DESC
    `;

    // Проверяем, решил ли пользователь эту задачу
    const isSolvedResult = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id
      FROM "UserTaskSubmission"
      WHERE "taskId" = ${params.id}
        AND "userId" = ${session.user.id}
        AND status = 'ACCEPTED'
      LIMIT 1
    `;

    return NextResponse.json({
      ...task,
      testCases: task.testCases,
      codeTemplates: task.codeTemplates,
      isSolved: isSolvedResult.length > 0,
      stats: {
        totalSubmissions: Number(totalSubmissions),
        acceptedSubmissions: uniqueAcceptedUsers.length,
        bestMemory: bestMemoryResult[0]?.memory?.toString() || null,
        bestTime: bestTimeResult?.executionTime ? Number(bestTimeResult.executionTime) : null,
        languageStats: languageStats.map(stat => ({
          language: stat.language,
          totalAttempts: Number(stat.totalAttempts),
          successfulAttempts: Number(stat.successfulAttempts),
          successRate: Number(stat.successRate)
        }))
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 