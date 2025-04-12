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
          },
          take: 3, // Берем только первые 3 тесткейса
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
    const [totalSubmissionsResult, acceptedSubmissionsResult] = await Promise.all([
      // Общее количество решений
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count 
        FROM "UserTaskSubmission" 
        WHERE "taskId" = ${params.id}
      `,
      // Количество успешных решений
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count 
        FROM "UserTaskSubmission" 
        WHERE "taskId" = ${params.id} 
        AND status = 'ACCEPTED'
      `
    ]);

    const totalSubmissions = Number(totalSubmissionsResult[0].count);
    const acceptedSubmissions = Number(acceptedSubmissionsResult[0].count);

    // Получаем лучшие показатели времени и памяти
    const bestSubmissionResult = await prisma.$queryRaw<Array<{
      executionTime: bigint;
      memory: bigint;
    }>>`
      SELECT "executionTime", memory
      FROM "UserTaskSubmission"
      WHERE "taskId" = ${params.id}
        AND status = 'ACCEPTED'
      ORDER BY "executionTime" ASC
      LIMIT 1
    `;

    const bestSubmission = bestSubmissionResult[0] || null;

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
        totalSubmissions,
        acceptedSubmissions,
        bestMemory: bestSubmission?.memory ? Number(bestSubmission.memory) : null,
        bestTime: bestSubmission?.executionTime ? Number(bestSubmission.executionTime) : null,
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