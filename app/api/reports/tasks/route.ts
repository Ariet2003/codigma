import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    // Получаем общее количество задач
    const totalTasks = await db.task.count();

    // Получаем статистику по сложности задач
    const difficultyStats = await db.task.groupBy({
      by: ['difficulty'],
      _count: {
        id: true
      }
    });

    // Получаем статистику по тест-кейсам для каждой задачи с пагинацией
    const taskTestCases = await db.task.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        _count: {
          select: {
            testCases: true
          }
        }
      },
      orderBy: {
        testCases: {
          _count: 'desc'
        }
      },
      skip,
      take: pageSize
    });

    // Получаем общую статистику по тест-кейсам
    const testCaseStats = await db.$queryRaw`
      SELECT 
        CAST(MIN(test_case_count) AS INTEGER) as min,
        CAST(MAX(test_case_count) AS INTEGER) as max,
        CAST(ROUND(CAST(AVG(CAST(test_case_count AS DECIMAL)) AS NUMERIC), 2) AS FLOAT) as avg
      FROM (
        SELECT COUNT(tc.id) as test_case_count
        FROM "Task" t
        LEFT JOIN "TestCase" tc ON t.id = tc."taskId"
        GROUP BY t.id
      ) as stats
    ` as { min: number; max: number; avg: number }[];

    // Получаем общее количество задач для пагинации
    const totalTasksWithTestCases = await db.task.count({
      where: {
        testCases: {
          some: {}
        }
      }
    });

    // Форматируем статистику по сложности
    const difficultyMap = difficultyStats.reduce((acc, curr) => {
      acc[curr.difficulty.toLowerCase()] = Number(curr._count.id);
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalTasks: Number(totalTasks),
      difficulty: {
        easy: difficultyMap.easy || 0,
        medium: difficultyMap.medium || 0,
        hard: difficultyMap.hard || 0
      },
      testCases: {
        min: testCaseStats[0]?.min || 0,
        max: testCaseStats[0]?.max || 0,
        average: testCaseStats[0]?.avg || 0
      },
      topTasksByTestCases: taskTestCases.map(task => ({
        id: task.id,
        title: task.title,
        difficulty: task.difficulty,
        testCasesCount: Number(task._count.testCases)
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTasksWithTestCases / pageSize),
        pageSize
      }
    });
  } catch (error) {
    console.error('Error fetching task report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task report' },
      { status: 500 }
    );
  }
} 