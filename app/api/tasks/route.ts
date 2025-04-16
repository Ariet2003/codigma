import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "title";
    const order = searchParams.get("order") || "asc";

    const skip = (page - 1) * limit;

    // Базовые условия для WHERE
    const where: any = {};
    
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    
    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty.toUpperCase();
    }

    // Получаем информацию о решенных задачах пользователя
    const userSolvedTasks = await prisma.userTaskSubmission.findMany({
      where: {
        userId: session.user.id,
        status: 'ACCEPTED'
      },
      select: {
        taskId: true
      },
      distinct: ['taskId']
    });

    const solvedTaskIds = new Set(userSolvedTasks.map(t => t.taskId));

    if (status && status !== 'all') {
      if (status === 'solved') {
        where.id = { in: Array.from(solvedTaskIds) };
      } else if (status === 'unsolved') {
        where.id = { notIn: Array.from(solvedTaskIds) };
      }
    }

    // Получаем задачи с дополнительной статистикой
    const tasks = await prisma.task.findMany({
      where,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: order
      }
    });

    // Получаем количество попыток для каждой задачи текущего пользователя
    const userAttempts = await prisma.userTaskSubmission.groupBy({
      by: ['taskId'],
      where: {
        userId: session.user.id,
        taskId: {
          in: tasks.map(t => t.id)
        }
      },
      _count: {
        id: true
      }
    });

    // Получаем количество уникальных пользователей, решивших каждую задачу
    const acceptedCounts = await prisma.userTaskSubmission.groupBy({
      by: ['taskId'],
      where: {
        status: 'ACCEPTED',
        taskId: {
          in: tasks.map(t => t.id)
        }
      },
      _count: {
        _all: true
      },
      having: {
        userId: {
          _count: {
            gt: 0
          }
        }
      }
    });

    // Получаем количество уникальных пользователей для каждой задачи
    const uniqueUserCounts = await prisma.$queryRaw`
      SELECT 
        "taskId",
        COUNT(DISTINCT "userId") as unique_users
      FROM "UserTaskSubmission"
      WHERE 
        "taskId" IN (${Prisma.join(tasks.map(t => t.id))})
        AND status = 'ACCEPTED'
      GROUP BY "taskId"
    `;

    // Создаем Map для быстрого доступа к статистике
    const attemptsMap = new Map(userAttempts.map(a => [a.taskId, a._count.id]));
    const acceptedCountsMap = new Map(
      (uniqueUserCounts as { taskId: string; unique_users: number }[])
        .map(a => [a.taskId, Number(a.unique_users)])
    );

    // Форматируем задачи с дополнительной информацией
    const formattedTasks = tasks.map(task => ({
      ...task,
      isSolved: solvedTaskIds.has(task.id),
      attempts: attemptsMap.get(task.id) || 0,
      uniqueAcceptedCount: acceptedCountsMap.get(task.id) || 0
    }));

    // Получаем общее количество задач для пагинации
    const total = await prisma.task.count({ where });

    return NextResponse.json({
      tasks: formattedTasks,
      total,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("[TASKS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Создаем задачу
    const task = await prisma.task.create({
      data: {
        title: data.title,
        difficulty: data.difficulty,
        description: data.description,
        functionName: data.function_name,
        inputParams: data.input_params,
        outputParams: data.output_params,
        testCases: {
          create: data.test_cases.map((test: any) => ({
            input: test.input,
            expectedOutput: String(test.expected_output)
          }))
        },
        codeTemplates: {
          create: [
            {
              language: 'cpp',
              baseTemplate: data.templates.cpp.base,
              fullTemplate: data.templates.cpp.full
            },
            {
              language: 'js',
              baseTemplate: data.templates.js.base,
              fullTemplate: data.templates.js.full
            },
            {
              language: 'rust',
              baseTemplate: data.templates.rust.base,
              fullTemplate: data.templates.rust.full
            },
            {
              language: 'java',
              baseTemplate: data.templates.java.base,
              fullTemplate: data.templates.java.full
            }
          ]
        }
      },
      include: {
        testCases: true,
        codeTemplates: true
      }
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Ошибка при сохранении задачи:", error);
    return NextResponse.json(
      { error: "Ошибка при сохранении задачи" },
      { status: 500 }
    );
  }
} 